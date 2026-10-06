const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const { createPaymentOrder, verifyPayment } = require("../controllers/payment.controller");

router.use(authMiddleware);

router.post("/create-order/:requestId", createPaymentOrder);
router.post("/verify", verifyPayment);

module.exports = router;
