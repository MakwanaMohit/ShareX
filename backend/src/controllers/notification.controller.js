const Notification = require("../models/Notification.model");
const ApiResponse = require("../utils/ApiResponse");

// ─── Get All Notifications for Current User ───────────────────────────────────
const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate("relatedResource", "title")
      .sort({ createdAt: -1 });

    return ApiResponse.success(res, 200, "Notifications fetched.", { notifications });
  } catch (error) {
    next(error);
  }
};

// ─── Mark Single Notification as Read ────────────────────────────────────────
const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) return ApiResponse.error(res, 404, "Notification not found.");
    if (notification.recipient.toString() !== req.user._id.toString()) {
      return ApiResponse.error(res, 403, "Access denied.");
    }

    notification.isRead = true;
    await notification.save();

    return ApiResponse.success(res, 200, "Notification marked as read.", { notification });
  } catch (error) {
    next(error);
  }
};

// ─── Mark All Notifications as Read ──────────────────────────────────────────
const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });

    return ApiResponse.success(res, 200, "All notifications marked as read.");
  } catch (error) {
    next(error);
  }
};

module.exports = { getNotifications, markAsRead, markAllAsRead };
