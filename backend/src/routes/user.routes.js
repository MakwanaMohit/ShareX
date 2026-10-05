const express = require("express");
const router = express.Router();
const { getProfile, updateProfile, deleteProfile, getUserById } = require("../controllers/user.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.delete("/profile", authMiddleware, deleteProfile);
router.get("/:userId", getUserById); // Public user profile (must come after static routes)

module.exports = router;
