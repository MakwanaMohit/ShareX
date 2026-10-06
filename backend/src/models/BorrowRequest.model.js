const mongoose = require("mongoose");

const borrowRequestSchema = new mongoose.Schema(
  {
    resource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resource",
      required: true,
    },
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    borrowDuration: {
      startDate: {
        type: Date,
        required: [true, "Start date is required"],
      },
      endDate: {
        type: Date,
        required: [true, "End date is required"],
      },
    },
    status: {
      type: String,
      enum: ["pending", "payment_processing", "accepted", "rejected", "returned", "cancelled"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["pay_on_collection", "razorpay"],
      default: "pay_on_collection",
    },
    razorpayOrderId: {
      type: String,
      default: "",
    },
    razorpayPaymentId: {
      type: String,
      default: "",
    },
    depositPaid: {
      type: Boolean,
      default: false,
    },
    depositStatus: {
      type: String,
      enum: ["pending", "held", "refunded", "retained"],
      default: "pending",
    },
    message: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

const BorrowRequest = mongoose.model("BorrowRequest", borrowRequestSchema);
module.exports = BorrowRequest;
