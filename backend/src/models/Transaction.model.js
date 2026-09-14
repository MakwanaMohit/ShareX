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
      enum: ["pending", "refunded", "retained"],
      default: "pending",
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
