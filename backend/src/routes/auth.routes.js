const express = require("express");
const router = express.Router();
const { register, login, getMe, refresh, logout } = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware, getMe);
router.post("/refresh", refresh);           // reads from HTTP-only cookie — no auth header needed
router.post("/logout", authMiddleware, logout);

module.exports = router;
