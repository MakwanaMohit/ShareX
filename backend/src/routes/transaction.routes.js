const express = require("express");
const router = express.Router();
const { getTransactions, getTransactionById, updateDepositStatus } = require("../controllers/transaction.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.use(authMiddleware);

router.get("/", getTransactions);
router.get("/:id", getTransactionById);
router.patch("/:id/deposit-status", updateDepositStatus);

module.exports = router;
