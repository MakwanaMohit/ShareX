const express = require("express");
const router = express.Router();
const { submitReview, getUserReviews, getResourceReviews } = require("../controllers/review.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.get("/user/:userId", getUserReviews);
router.get("/resource/:resourceId", getResourceReviews);
router.post("/", authMiddleware, submitReview);

module.exports = router;
