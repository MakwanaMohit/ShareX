const User = require("../models/User.model");
const ApiResponse = require("../utils/ApiResponse");

// ─── Get Own Profile ──────────────────────────────────────────────────────────
const getProfile = async (req, res, next) => {
  try {
    return ApiResponse.success(res, 200, "Profile fetched.", { user: req.user });
  } catch (error) {
    next(error);
  }
};

// ─── Update Own Profile ───────────────────────────────────────────────────────
const updateProfile = async (req, res, next) => {
  try {
    const { name, contactInfo, profilePicture } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { name, contactInfo, profilePicture },
      { new: true, runValidators: true }
    );

    return ApiResponse.success(res, 200, "Profile updated.", { user: updatedUser });
  } catch (error) {
    next(error);
  }
};

// ─── Delete Own Account ───────────────────────────────────────────────────────
const deleteProfile = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { isActive: false });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return ApiResponse.success(res, 200, "Account deactivated successfully.");
  } catch (error) {
    next(error);
  }
};

// ─── Get Any User's Public Profile ───────────────────────────────────────────
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.params.userId, isActive: true }).select(
      "name profilePicture rating createdAt"
    );

    if (!user) {
      return ApiResponse.error(res, 404, "User not found.");
    }

    return ApiResponse.success(res, 200, "User profile fetched.", { user });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProfile, updateProfile, deleteProfile, getUserById };
