const express = require("express");
const router = express.Router();
const { getNotifications, markAsRead, markAllAsRead } = require("../controllers/notification.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.use(authMiddleware);

router.get("/", getNotifications);
router.patch("/read-all", markAllAsRead);     // before /:id to avoid conflict
router.patch("/:id/read", markAsRead);

module.exports = router;
