const ApiResponse = require("../utils/ApiResponse");

const adminMiddleware = (req, res, next) => {
  if (!req.user) {
    return ApiResponse.error(res, 401, "Authentication required.");
  }

  if (req.user.role !== "admin") {
    return ApiResponse.error(res, 403, "Access denied. Admins only.");
  }

  next();
};

module.exports = adminMiddleware;
