const jwt = require("jsonwebtoken");
const ApiResponse = require("../utils/ApiResponse");

// We lazy-require User to avoid circular dependency at model load time
const getUser = () => require("../models/User.model");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return ApiResponse.error(res, 401, "Access denied. No token provided.");
    }

    const token = authHeader.split(" ")[1];

    // Verify signature + expiry
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return ApiResponse.error(res, 401, "Access token expired. Please refresh.");
      }
      return ApiResponse.error(res, 401, "Invalid token.");
    }

    // Reject refresh tokens hitting protected routes
    if (decoded.tokenType !== "access") {
      return ApiResponse.error(res, 401, "Invalid token type.");
    }

    // Confirm user still exists and is active
    const User = getUser();
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return ApiResponse.error(res, 401, "User no longer exists.");
    }

    if (!user.isActive) {
      return ApiResponse.error(res, 403, "Your account has been deactivated.");
    }

    req.user = user;
    next();
  } catch (error) {
    return ApiResponse.error(res, 500, "Authentication error.");
  }
};

module.exports = authMiddleware;
