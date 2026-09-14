const User = require("../models/User.model");
const Resource = require("../models/Resource.model");
const Transaction = require("../models/Transaction.model");
const ApiResponse = require("../utils/ApiResponse");

// ─── Get All Users ────────────────────────────────────────────────────────────
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    return ApiResponse.success(res, 200, "All users fetched.", { users });
  } catch (error) {
    next(error);
  }
};

// ─── Get User by ID ───────────────────────────────────────────────────────────
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return ApiResponse.error(res, 404, "User not found.");
    return ApiResponse.success(res, 200, "User fetched.", { user });
  } catch (error) {
    next(error);
  }
};

// ─── Update User (role / isActive) ───────────────────────────────────────────
const updateUser = async (req, res, next) => {
  try {
    const { role, isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role, isActive },
      { new: true, runValidators: true }
    );

    if (!user) return ApiResponse.error(res, 404, "User not found.");
    return ApiResponse.success(res, 200, "User updated.", { user });
  } catch (error) {
    next(error);
  }
};

// ─── Delete User ──────────────────────────────────────────────────────────────
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return ApiResponse.error(res, 404, "User not found.");
    return ApiResponse.success(res, 200, "User deleted.");
  } catch (error) {
    next(error);
  }
};

// ─── Get All Resources ────────────────────────────────────────────────────────
const getAllResources = async (req, res, next) => {
  try {
    const resources = await Resource.find()
      .populate("owner", "name email")
      .sort({ createdAt: -1 });
    return ApiResponse.success(res, 200, "All resources fetched.", { resources });
  } catch (error) {
    next(error);
  }
};

// ─── Delete Resource ──────────────────────────────────────────────────────────
const deleteResource = async (req, res, next) => {
  try {
    const resource = await Resource.findByIdAndDelete(req.params.id);
    if (!resource) return ApiResponse.error(res, 404, "Resource not found.");
    return ApiResponse.success(res, 200, "Resource removed.");
  } catch (error) {
    next(error);
  }
};

// ─── Get All Transactions ─────────────────────────────────────────────────────
const getAllTransactions = async (req, res, next) => {
  try {
    const transactions = await Transaction.find()
      .populate("resource", "title")
      .populate("lender", "name email")
      .populate("borrower", "name email")
      .sort({ createdAt: -1 });
    return ApiResponse.success(res, 200, "All transactions fetched.", { transactions });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAllResources,
  deleteResource,
  getAllTransactions,
};
