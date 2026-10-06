const BorrowRequest = require("../models/BorrowRequest.model");
const Resource = require("../models/Resource.model");
const Transaction = require("../models/Transaction.model");
const Notification = require("../models/Notification.model");
const ApiResponse = require("../utils/ApiResponse");
const razorpayUtil = require("../utils/razorpay");

// ─── Helper: Create a notification ───────────────────────────────────────────
const createNotification = async (recipient, type, message, relatedResource, relatedRequest) => {
  await Notification.create({ recipient, type, message, relatedResource, relatedRequest });
};

// ─── Send Borrow Request ──────────────────────────────────────────────────────
const sendBorrowRequest = async (req, res, next) => {
  try {
    const { resourceId, startDate, endDate, message, paymentMethod } = req.body;

    const resource = await Resource.findById(resourceId);
    if (!resource) return ApiResponse.error(res, 404, "Resource not found.");
    if (!resource.isAvailable) return ApiResponse.error(res, 400, "Resource is not available.");
    if (resource.owner.toString() === req.user._id.toString()) {
      return ApiResponse.error(res, 400, "You cannot borrow your own resource.");
    }

    // Check for an already pending or payment_processing request
    const existing = await BorrowRequest.findOne({
      resource: resourceId,
      requester: req.user._id,
      status: { $in: ["pending", "payment_processing"] },
    });
    if (existing) {
      return ApiResponse.error(
        res,
        409,
        "You already have an active request for this resource."
      );
    }

    // Validate payment method
    let selectedPayment = paymentMethod === "razorpay" ? "razorpay" : "pay_on_collection";
    if (
      resource.securityDeposit > 0 &&
      resource.acceptedPaymentMethods?.length > 0 &&
      !resource.acceptedPaymentMethods.includes(selectedPayment)
    ) {
      selectedPayment = resource.acceptedPaymentMethods[0];
    }

    const borrowRequest = await BorrowRequest.create({
      resource: resourceId,
      requester: req.user._id,
      owner: resource.owner,
      borrowDuration: { startDate, endDate },
      message,
      paymentMethod: selectedPayment,
    });

    // Notify owner
    await createNotification(
      resource.owner,
      "borrow_request",
      `${req.user.name} has requested to borrow your resource: ${resource.title}`,
      resource._id,
      borrowRequest._id
    );

    return ApiResponse.success(res, 201, "Borrow request sent.", { borrowRequest });
  } catch (error) {
    next(error);
  }
};

// ─── Get Incoming Requests (owner) ───────────────────────────────────────────
const getIncomingRequests = async (req, res, next) => {
  try {
    const requests = await BorrowRequest.find({ owner: req.user._id })
      .populate("resource", "title category images securityDeposit listingType acceptedPaymentMethods")
      .populate("requester", "name profilePicture rating")
      .sort({ createdAt: -1 });

    return ApiResponse.success(res, 200, "Incoming requests fetched.", { requests });
  } catch (error) {
    next(error);
  }
};

// ─── Get Outgoing Requests (requester) ───────────────────────────────────────
const getOutgoingRequests = async (req, res, next) => {
  try {
    const requests = await BorrowRequest.find({ requester: req.user._id })
      .populate("resource", "title category images securityDeposit listingType acceptedPaymentMethods")
      .populate("owner", "name profilePicture rating")
      .sort({ createdAt: -1 });

    return ApiResponse.success(res, 200, "Outgoing requests fetched.", { requests });
  } catch (error) {
    next(error);
  }
};

// ─── Accept Request ───────────────────────────────────────────────────────────
const acceptRequest = async (req, res, next) => {
  try {
    const request = await BorrowRequest.findById(req.params.id).populate("resource");

    if (!request) return ApiResponse.error(res, 404, "Borrow request not found.");
    if (request.owner.toString() !== req.user._id.toString()) {
      return ApiResponse.error(res, 403, "Not authorized.");
    }
    if (request.status !== "pending") {
      return ApiResponse.error(res, 400, "Only pending requests can be accepted.");
    }

    const depositAmount = request.resource?.securityDeposit || 0;

    // IF payment method is Razorpay and deposit > 0:
    // Move to payment_processing and create Razorpay order for borrower
    if (request.paymentMethod === "razorpay" && depositAmount > 0) {
      const order = await razorpayUtil.createOrder(
        depositAmount,
        `rcpt_${request._id.toString().slice(-10)}`,
        {
          borrowRequestId: request._id.toString(),
          resourceId: request.resource._id.toString(),
          borrowerId: request.requester.toString(),
        }
      );

      request.status = "payment_processing";
      request.razorpayOrderId = order.id;
      await request.save();

      // Notify requester to pay deposit online
      await createNotification(
        request.requester,
        "deposit_update",
        `Your borrow request for "${request.resource.title}" was accepted! Please complete the ₹${depositAmount} deposit via Razorpay to confirm booking.`,
        request.resource._id,
        request._id
      );

      return ApiResponse.success(res, 200, "Request accepted. Awaiting borrower's Razorpay payment.", {
        request,
        razorpayOrder: {
          id: order.id,
          amount: order.amount,
          currency: order.currency,
          keyId: process.env.RAZORPAY_KEY_ID,
        },
      });
    }

    // IF payment method is Pay on Collection OR deposit is 0:
    // Direct completion
    request.status = "accepted";
    await request.save();

    // Mark resource unavailable
    await Resource.findByIdAndUpdate(request.resource._id, { isAvailable: false });

    // Create transaction record
    await Transaction.create({
      borrowRequest: request._id,
      resource: request.resource._id,
      lender: req.user._id,
      borrower: request.requester,
      depositAmount,
      paymentMethod: "pay_on_collection",
      depositStatus: "pending",
    });

    // Notify requester
    await createNotification(
      request.requester,
      "request_accepted",
      `Your borrow request for "${request.resource.title}" has been accepted! You can pay the ₹${depositAmount} deposit on collection.`,
      request.resource._id,
      request._id
    );

    return ApiResponse.success(res, 200, "Request accepted.", { request });
  } catch (error) {
    next(error);
  }
};

// ─── Reject Request ───────────────────────────────────────────────────────────
const rejectRequest = async (req, res, next) => {
  try {
    const request = await BorrowRequest.findById(req.params.id).populate("resource");

    if (!request) return ApiResponse.error(res, 404, "Borrow request not found.");
    if (request.owner.toString() !== req.user._id.toString()) {
      return ApiResponse.error(res, 403, "Not authorized.");
    }
    if (request.status !== "pending") {
      return ApiResponse.error(res, 400, "Only pending requests can be rejected.");
    }

    request.status = "rejected";
    await request.save();

    // Notify requester
    await createNotification(
      request.requester,
      "request_rejected",
      `Your borrow request for "${request.resource.title}" was rejected.`,
      request.resource._id,
      request._id
    );

    return ApiResponse.success(res, 200, "Request rejected.", { request });
  } catch (error) {
    next(error);
  }
};

// ─── Mark as Returned ─────────────────────────────────────────────────────────
const markReturned = async (req, res, next) => {
  try {
    const request = await BorrowRequest.findById(req.params.id).populate("resource");

    if (!request) return ApiResponse.error(res, 404, "Borrow request not found.");
    if (request.owner.toString() !== req.user._id.toString()) {
      return ApiResponse.error(res, 403, "Not authorized.");
    }
    if (request.status !== "accepted") {
      return ApiResponse.error(res, 400, "Only accepted requests can be marked as returned.");
    }

    request.status = "returned";
    await request.save();

    // Mark resource available again
    await Resource.findByIdAndUpdate(request.resource._id, { isAvailable: true });

    // Update transaction as completed
    await Transaction.findOneAndUpdate(
      { borrowRequest: request._id },
      { completedAt: new Date() }
    );

    // Notify requester
    await createNotification(
      request.requester,
      "transaction_complete",
      `Your borrowing of "${request.resource.title}" is complete. Thank you!`,
      request.resource._id,
      request._id
    );

    return ApiResponse.success(res, 200, "Resource marked as returned.", { request });
  } catch (error) {
    next(error);
  }
};

// ─── Cancel Request (requester only) ─────────────────────────────────────────
const cancelRequest = async (req, res, next) => {
  try {
    const request = await BorrowRequest.findById(req.params.id);

    if (!request) return ApiResponse.error(res, 404, "Borrow request not found.");
    if (request.requester.toString() !== req.user._id.toString()) {
      return ApiResponse.error(res, 403, "Not authorized.");
    }
    if (!["pending", "payment_processing"].includes(request.status)) {
      return ApiResponse.error(
        res,
        400,
        "Only pending or awaiting-payment requests can be cancelled."
      );
    }

    request.status = "cancelled";
    await request.save();

    return ApiResponse.success(res, 200, "Request cancelled.", { request });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendBorrowRequest,
  getIncomingRequests,
  getOutgoingRequests,
  acceptRequest,
  rejectRequest,
  markReturned,
  cancelRequest,
};
