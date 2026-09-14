const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "borrow_request",
        "request_accepted",
        "request_rejected",
        "return_reminder",
        "transaction_complete",
        "deposit_update",
      ],
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    relatedResource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resource",
      default: null,
    },
    relatedRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BorrowRequest",
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Index for fast lookup of a user's unread notifications
notificationSchema.index({ recipient: 1, isRead: 1 });

const Notification = mongoose.model("Notification", notificationSchema);
module.exports = Notification;
