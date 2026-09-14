const express = require("express");
const router = express.Router();
const { submitReview, getUserReviews, getResourceReviews } = require("../controllers/review.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.use(authMiddleware);

router.post("/", submitReview);
router.get("/user/:userId", getUserReviews);
router.get("/resource/:resourceId", getResourceReviews);

module.exports = router;
