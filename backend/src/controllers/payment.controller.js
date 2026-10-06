const BorrowRequest = require("../models/BorrowRequest.model");
const Resource = require("../models/Resource.model");
const Transaction = require("../models/Transaction.model");
const Notification = require("../models/Notification.model");
const ApiResponse = require("../utils/ApiResponse");
const razorpayUtil = require("../utils/razorpay");

// ─── Helper: Create Notification ─────────────────────────────────────────────
const createNotification = async (recipient, type, message, relatedResource, relatedRequest) => {
  await Notification.create({ recipient, type, message, relatedResource, relatedRequest });
};

// ─── Create Razorpay Order for a Borrow Request ──────────────────────────────
const createPaymentOrder = async (req, res, next) => {
  try {
    const { requestId } = req.params;

    const request = await BorrowRequest.findById(requestId).populate("resource");
    if (!request) return ApiResponse.error(res, 404, "Borrow request not found.");

    if (request.requester.toString() !== req.user._id.toString()) {
      return ApiResponse.error(res, 403, "Not authorized to pay for this request.");
    }

    if (request.status !== "payment_processing") {
      return ApiResponse.error(
        res,
        400,
        `Cannot initiate payment. Request status is "${request.status}".`
      );
    }

    const depositAmount = request.resource?.securityDeposit || 0;
    if (depositAmount <= 0) {
      return ApiResponse.error(res, 400, "Security deposit amount must be greater than zero.");
    }

    // Create Razorpay Order
    const order = await razorpayUtil.createOrder(
      depositAmount,
      `rcpt_${request._id.toString().slice(-10)}`,
      {
        borrowRequestId: request._id.toString(),
        resourceId: request.resource._id.toString(),
        borrowerId: req.user._id.toString(),
      }
    );

    request.razorpayOrderId = order.id;
    await request.save();

    return ApiResponse.success(res, 200, "Payment order created successfully.", {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      resourceTitle: request.resource.title,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Verify Razorpay Payment & Confirm Borrow Request ────────────────────────
const verifyPayment = async (req, res, next) => {
  try {
    const { requestId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!requestId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return ApiResponse.error(
        res,
        400,
        "Missing required payment details (requestId, order_id, payment_id, signature)."
      );
    }

    const request = await BorrowRequest.findById(requestId)
      .populate("resource")
      .populate("owner", "name email");

    if (!request) return ApiResponse.error(res, 404, "Borrow request not found.");

    if (request.requester.toString() !== req.user._id.toString()) {
      return ApiResponse.error(res, 403, "Not authorized.");
    }

    // Verify HMAC-SHA256 signature
    const isValid = razorpayUtil.verifySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      return ApiResponse.error(res, 400, "Invalid payment signature verification.");
    }

    // If already accepted, return idempotently
    if (request.status === "accepted" && request.depositPaid) {
      return ApiResponse.success(res, 200, "Payment already verified.", { request });
    }

    // Update request state
    request.status = "accepted";
    request.depositPaid = true;
    request.depositStatus = "held";
    request.razorpayOrderId = razorpay_order_id;
    request.razorpayPaymentId = razorpay_payment_id;
    await request.save();

    // Mark resource as unavailable
    await Resource.findByIdAndUpdate(request.resource._id, { isAvailable: false });

    // Create transaction record
    const transaction = await Transaction.create({
      borrowRequest: request._id,
      resource: request.resource._id,
      lender: request.owner._id,
      borrower: req.user._id,
      depositAmount: request.resource.securityDeposit || 0,
      depositStatus: "held",
      paymentMethod: "razorpay",
      razorpayPaymentId: razorpay_payment_id,
    });

    // Notify Lender (Booking Confirmed + Deposit Paid)
    await createNotification(
      request.owner._id,
      "deposit_update",
      `${req.user.name} completed the ₹${request.resource.securityDeposit} deposit payment via Razorpay for "${request.resource.title}". Booking is confirmed!`,
      request.resource._id,
      request._id
    );

    // Notify Borrower (Confirmation)
    await createNotification(
      req.user._id,
      "request_accepted",
      `Payment of ₹${request.resource.securityDeposit} via Razorpay confirmed! Your borrow for "${request.resource.title}" is confirmed.`,
      request.resource._id,
      request._id
    );

    return ApiResponse.success(res, 200, "Payment verified and booking confirmed!", {
      request,
      transaction,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
};
