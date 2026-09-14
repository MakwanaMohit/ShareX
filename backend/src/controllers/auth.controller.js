const User = require("../models/User.model");
const ApiResponse = require("../utils/ApiResponse");
const {
  generateAccessToken,
  generateRefreshToken,
  refreshCookieOptions,
} = require("../utils/generateToken");
const jwt = require("jsonwebtoken");

// ─── Register ────────────────────────────────────────────────────────────────
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return ApiResponse.error(res, 400, "Name, email, and password are required.");
    }

    // Check duplicate email
    const existing = await User.findOne({ email });
    if (existing) {
      return ApiResponse.error(res, 409, "Email is already registered.");
    }

    const user = await User.create({ name, email, password });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.cookie("refreshToken", refreshToken, refreshCookieOptions);

    return ApiResponse.success(res, 201, "Registration successful.", {
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Login ────────────────────────────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return ApiResponse.error(res, 400, "Email and password are required.");
    }

    // Explicitly select password (it has select: false in schema)
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return ApiResponse.error(res, 401, "Invalid email or password.");
    }

    if (!user.isActive) {
      return ApiResponse.error(res, 403, "Your account has been deactivated.");
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return ApiResponse.error(res, 401, "Invalid email or password.");
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.cookie("refreshToken", refreshToken, refreshCookieOptions);

    return ApiResponse.success(res, 200, "Login successful.", {
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get Current User (me) ────────────────────────────────────────────────────
const getMe = async (req, res, next) => {
  try {
    return ApiResponse.success(res, 200, "Current user fetched.", { user: req.user });
  } catch (error) {
    next(error);
  }
};

// ─── Refresh Access Token ─────────────────────────────────────────────────────
const refresh = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      return ApiResponse.error(res, 401, "No refresh token found. Please log in.");
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return ApiResponse.error(res, 401, "Refresh token expired or invalid. Please log in again.");
    }

    if (decoded.tokenType !== "refresh") {
      return ApiResponse.error(res, 401, "Invalid token type.");
    }

    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return ApiResponse.error(res, 401, "User not found or deactivated.");
    }

    const newAccessToken = generateAccessToken(user);

    return ApiResponse.success(res, 200, "Access token refreshed.", {
      accessToken: newAccessToken,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Logout ───────────────────────────────────────────────────────────────────
const logout = async (req, res, next) => {
  try {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return ApiResponse.success(res, 200, "Logged out successfully.");
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe, refresh, logout };
