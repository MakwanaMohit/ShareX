const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    borrowRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BorrowRequest",
      required: true,
    },
    resource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resource",
      required: true,
    },
    lender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    borrower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    depositAmount: {
      type: Number,
      default: 0,
    },
    depositStatus: {
      type: String,
      enum: ["pending", "held", "refunded", "retained"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["pay_on_collection", "razorpay"],
      default: "pay_on_collection",
    },
    razorpayPaymentId: {
      type: String,
      default: "",
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const Transaction = mongoose.model("Transaction", transactionSchema);
module.exports = Transaction;
