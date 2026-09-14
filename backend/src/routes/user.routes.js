const express = require("express");
const router = express.Router();
const { getProfile, updateProfile, deleteProfile, getUserById } = require("../controllers/user.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.use(authMiddleware); // all user routes require auth

router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.delete("/profile", deleteProfile);
router.get("/:userId", getUserById);

module.exports = router;
