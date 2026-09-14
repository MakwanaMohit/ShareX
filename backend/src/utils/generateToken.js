const jwt = require("jsonwebtoken");

/**
 * Generate a short-lived access token (10 min)
 */
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      email: user.email,
      tokenType: "access",
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "10m" }
  );
};

/**
 * Generate a long-lived refresh token (7 days)
 */
const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      tokenType: "refresh",
    },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d" }
  );
};

/**
 * Cookie options for the refresh token (HTTP-only, secure)
 */
const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
};

module.exports = { generateAccessToken, generateRefreshToken, refreshCookieOptions };
