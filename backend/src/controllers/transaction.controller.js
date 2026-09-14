const Transaction = require("../models/Transaction.model");
const Notification = require("../models/Notification.model");
const ApiResponse = require("../utils/ApiResponse");

// ─── Get Own Transaction History ──────────────────────────────────────────────
const getTransactions = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({
      $or: [{ lender: req.user._id }, { borrower: req.user._id }],
    })
      .populate("resource", "title category images")
      .populate("lender", "name profilePicture")
      .populate("borrower", "name profilePicture")
      .populate("borrowRequest", "borrowDuration status")
      .sort({ createdAt: -1 });

    return ApiResponse.success(res, 200, "Transaction history fetched.", { transactions });
  } catch (error) {
    next(error);
  }
};

// ─── Get Transaction by ID ────────────────────────────────────────────────────
const getTransactionById = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate("resource", "title category images")
      .populate("lender", "name profilePicture")
      .populate("borrower", "name profilePicture")
      .populate("borrowRequest");

    if (!transaction) return ApiResponse.error(res, 404, "Transaction not found.");

    // Only involved parties can view
    const isInvolved =
      transaction.lender._id.toString() === req.user._id.toString() ||
      transaction.borrower._id.toString() === req.user._id.toString();

    if (!isInvolved) return ApiResponse.error(res, 403, "Access denied.");

    return ApiResponse.success(res, 200, "Transaction fetched.", { transaction });
  } catch (error) {
    next(error);
  }
};

// ─── Update Deposit Status ────────────────────────────────────────────────────
const updateDepositStatus = async (req, res, next) => {
  try {
    const { depositStatus } = req.body;

    if (!["refunded", "retained"].includes(depositStatus)) {
      return ApiResponse.error(res, 400, "depositStatus must be 'refunded' or 'retained'.");
    }

    const transaction = await Transaction.findById(req.params.id).populate("resource", "title");

    if (!transaction) return ApiResponse.error(res, 404, "Transaction not found.");
    if (transaction.lender.toString() !== req.user._id.toString()) {
      return ApiResponse.error(res, 403, "Only the lender can update deposit status.");
    }

    transaction.depositStatus = depositStatus;
    await transaction.save();

    // Notify borrower about deposit update
    await Notification.create({
      recipient: transaction.borrower,
      type: "deposit_update",
      message: `Deposit for "${transaction.resource.title}" has been marked as ${depositStatus}.`,
      relatedResource: transaction.resource._id,
    });

    return ApiResponse.success(res, 200, "Deposit status updated.", { transaction });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTransactions, getTransactionById, updateDepositStatus };
