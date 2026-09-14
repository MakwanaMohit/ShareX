const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAllResources,
  deleteResource,
  getAllTransactions,
} = require("../controllers/admin.controller");
const authMiddleware = require("../middleware/auth.middleware");
const adminMiddleware = require("../middleware/admin.middleware");

// All admin routes require both auth + admin role
router.use(authMiddleware, adminMiddleware);

router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

router.get("/resources", getAllResources);
router.delete("/resources/:id", deleteResource);

router.get("/transactions", getAllTransactions);

module.exports = router;
