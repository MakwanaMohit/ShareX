const Resource = require("../models/Resource.model");
const ApiResponse = require("../utils/ApiResponse");

// ─── Browse / Search / Filter Resources (Public) ─────────────────────────────
const getResources = async (req, res, next) => {
  try {
    const { search, category, listingType, available } = req.query;
    const filter = {};

    if (search) {
      filter.$text = { $search: search };
    }
    if (category) filter.category = category;
    if (listingType) filter.listingType = listingType;
    if (available !== undefined) filter.isAvailable = available === "true";

    const resources = await Resource.find(filter)
      .populate("owner", "name profilePicture rating")
      .sort({ createdAt: -1 });

    return ApiResponse.success(res, 200, "Resources fetched.", { resources });
  } catch (error) {
    next(error);
  }
};

// ─── Add Resource ─────────────────────────────────────────────────────────────
const createResource = async (req, res, next) => {
  try {
    const {
      title,
      category,
      description,
      condition,
      images,
      videos,
      listingType,
      securityDeposit,
      acceptedPaymentMethods,
    } = req.body;

    const resource = await Resource.create({
      owner: req.user._id,
      title,
      category,
      description,
      condition,
      images,
      videos: Array.isArray(videos) ? videos : [],
      listingType,
      securityDeposit,
      acceptedPaymentMethods:
        Array.isArray(acceptedPaymentMethods) && acceptedPaymentMethods.length > 0
          ? acceptedPaymentMethods
          : ["pay_on_collection", "razorpay"],
    });

    return ApiResponse.success(res, 201, "Resource listed successfully.", { resource });
  } catch (error) {
    next(error);
  }
};

// ─── Get Resource by ID ───────────────────────────────────────────────────────
const getResourceById = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id).populate(
      "owner",
      "name email profilePicture rating"
    );

    if (!resource) {
      return ApiResponse.error(res, 404, "Resource not found.");
    }

    return ApiResponse.success(res, 200, "Resource fetched.", { resource });
  } catch (error) {
    next(error);
  }
};

// ─── Edit Resource (owner only) ───────────────────────────────────────────────
const updateResource = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) return ApiResponse.error(res, 404, "Resource not found.");

    if (resource.owner.toString() !== req.user._id.toString()) {
      return ApiResponse.error(res, 403, "Not authorized to edit this resource.");
    }

    const {
      title,
      category,
      description,
      condition,
      images,
      videos,
      listingType,
      securityDeposit,
      acceptedPaymentMethods,
    } = req.body;

    const updateFields = {
      title,
      category,
      description,
      condition,
      images,
      videos: Array.isArray(videos) ? videos : [],
      listingType,
      securityDeposit,
    };

    if (Array.isArray(acceptedPaymentMethods) && acceptedPaymentMethods.length > 0) {
      updateFields.acceptedPaymentMethods = acceptedPaymentMethods;
    }

    const updated = await Resource.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    );

    return ApiResponse.success(res, 200, "Resource updated.", { resource: updated });
  } catch (error) {
    next(error);
  }
};

// ─── Delete Resource (owner only) ─────────────────────────────────────────────
const deleteResource = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) return ApiResponse.error(res, 404, "Resource not found.");

    if (resource.owner.toString() !== req.user._id.toString()) {
      return ApiResponse.error(res, 403, "Not authorized to delete this resource.");
    }

    await Resource.findByIdAndDelete(req.params.id);

    return ApiResponse.success(res, 200, "Resource deleted successfully.");
  } catch (error) {
    next(error);
  }
};

// ─── Toggle Availability ──────────────────────────────────────────────────────
const toggleAvailability = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) return ApiResponse.error(res, 404, "Resource not found.");

    if (resource.owner.toString() !== req.user._id.toString()) {
      return ApiResponse.error(res, 403, "Not authorized.");
    }

    resource.isAvailable = !resource.isAvailable;
    await resource.save();

    return ApiResponse.success(res, 200, `Resource marked as ${resource.isAvailable ? "available" : "unavailable"}.`, {
      isAvailable: resource.isAvailable,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get Current User's Listings ──────────────────────────────────────────────
const getMyListings = async (req, res, next) => {
  try {
    const resources = await Resource.find({ owner: req.user._id }).sort({ createdAt: -1 });
    return ApiResponse.success(res, 200, "Your listings fetched.", { resources });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getResources,
  createResource,
  getResourceById,
  updateResource,
  deleteResource,
  toggleAvailability,
  getMyListings,
};
