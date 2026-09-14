const Review = require("../models/Review.model");
const Transaction = require("../models/Transaction.model");
const User = require("../models/User.model");
const ApiResponse = require("../utils/ApiResponse");

// ─── Submit Review ────────────────────────────────────────────────────────────
const submitReview = async (req, res, next) => {
  try {
    const { transactionId, targetType, targetUserId, targetResourceId, rating, comment } = req.body;

    // Verify the transaction exists and the reviewer was involved
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) return ApiResponse.error(res, 404, "Transaction not found.");

    const isInvolved =
      transaction.lender.toString() === req.user._id.toString() ||
      transaction.borrower.toString() === req.user._id.toString();

    if (!isInvolved) {
      return ApiResponse.error(res, 403, "You can only review transactions you were part of.");
    }

    const review = await Review.create({
      reviewer: req.user._id,
      targetType,
      targetUser: targetUserId || null,
      targetResource: targetResourceId || null,
      rating,
      comment,
      transaction: transactionId,
    });

    // Update user average rating if reviewing a user
    if (targetType === "user" && targetUserId) {
      const reviews = await Review.find({ targetType: "user", targetUser: targetUserId });
      const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      await User.findByIdAndUpdate(targetUserId, {
        "rating.average": Math.round(avg * 10) / 10,
        "rating.count": reviews.length,
      });
    }

    return ApiResponse.success(res, 201, "Review submitted.", { review });
  } catch (error) {
    next(error);
  }
};

// ─── Get Reviews for a User ───────────────────────────────────────────────────
const getUserReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({
      targetType: "user",
      targetUser: req.params.userId,
    })
      .populate("reviewer", "name profilePicture")
      .sort({ createdAt: -1 });

    return ApiResponse.success(res, 200, "User reviews fetched.", { reviews });
  } catch (error) {
    next(error);
  }
};

// ─── Get Reviews for a Resource ───────────────────────────────────────────────
const getResourceReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({
      targetType: "resource",
      targetResource: req.params.resourceId,
    })
      .populate("reviewer", "name profilePicture")
      .sort({ createdAt: -1 });

    return ApiResponse.success(res, 200, "Resource reviews fetched.", { reviews });
  } catch (error) {
    next(error);
  }
};

module.exports = { submitReview, getUserReviews, getResourceReviews };
