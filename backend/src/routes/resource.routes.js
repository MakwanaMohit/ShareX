const express = require("express");
const router = express.Router();
const {
  getResources,
  createResource,
  getResourceById,
  updateResource,
  deleteResource,
  toggleAvailability,
  getMyListings,
} = require("../controllers/resource.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.get("/", getResources);                              // Public — browse/search/filter
router.get("/my/listings", authMiddleware, getMyListings);  // Auth — must be before /:id
router.post("/", authMiddleware, createResource);
router.get("/:id", authMiddleware, getResourceById);
router.put("/:id", authMiddleware, updateResource);
router.delete("/:id", authMiddleware, deleteResource);
router.patch("/:id/availability", authMiddleware, toggleAvailability);

module.exports = router;
