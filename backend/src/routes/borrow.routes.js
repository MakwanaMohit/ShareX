const express = require("express");
const router = express.Router();
const {
  sendBorrowRequest,
  getIncomingRequests,
  getOutgoingRequests,
  acceptRequest,
  rejectRequest,
  markReturned,
  cancelRequest,
} = require("../controllers/borrow.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.use(authMiddleware); // all borrow routes require auth

router.post("/", sendBorrowRequest);
router.get("/incoming", getIncomingRequests);
router.get("/outgoing", getOutgoingRequests);
router.patch("/:id/accept", acceptRequest);
router.patch("/:id/reject", rejectRequest);
router.patch("/:id/return", markReturned);
router.patch("/:id/cancel", cancelRequest);

module.exports = router;
