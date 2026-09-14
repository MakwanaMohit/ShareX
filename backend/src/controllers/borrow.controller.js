const BorrowRequest = require("../models/BorrowRequest.model");
const Resource = require("../models/Resource.model");
const Transaction = require("../models/Transaction.model");
const Notification = require("../models/Notification.model");
const ApiResponse = require("../utils/ApiResponse");

// ─── Helper: Create a notification ───────────────────────────────────────────
const createNotification = async (recipient, type, message, relatedResource, relatedRequest) => {
  await Notification.create({ recipient, type, message, relatedResource, relatedRequest });
};

// ─── Send Borrow Request ──────────────────────────────────────────────────────
const sendBorrowRequest = async (req, res, next) => {
  try {
    const { resourceId, startDate, endDate, message } = req.body;

    const resource = await Resource.findById(resourceId);
    if (!resource) return ApiResponse.error(res, 404, "Resource not found.");
    if (!resource.isAvailable) return ApiResponse.error(res, 400, "Resource is not available.");
    if (resource.owner.toString() === req.user._id.toString()) {
      return ApiResponse.error(res, 400, "You cannot borrow your own resource.");
    }

    // Check for an already pending request
    const existing = await BorrowRequest.findOne({
      resource: resourceId,
      requester: req.user._id,
      status: "pending",
    });
    if (existing) return ApiResponse.error(res, 409, "You already have a pending request for this resource.");

    const borrowRequest = await BorrowRequest.create({
      resource: resourceId,
      requester: req.user._id,
      owner: resource.owner,
      borrowDuration: { startDate, endDate },
      message,
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
      .populate("resource", "title category images")
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
      .populate("resource", "title category images")
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
      depositAmount: request.resource.securityDeposit,
    });

    // Notify requester
    await createNotification(
      request.requester,
      "request_accepted",
      `Your borrow request for "${request.resource.title}" has been accepted!`,
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
    if (request.status !== "pending") {
      return ApiResponse.error(res, 400, "Only pending requests can be cancelled.");
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
