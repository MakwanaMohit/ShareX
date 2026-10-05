const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const authMiddleware = require("../middleware/auth.middleware");
const ApiResponse = require("../utils/ApiResponse");

const router = express.Router();

// Project root uploads folder: <project-root>/uploads
const uploadsDir = path.resolve(__dirname, "../../../uploads");
const profilesDir = path.join(uploadsDir, "profiles");
const productsDir = path.join(uploadsDir, "products");

// Ensure upload directories exist
[uploadsDir, profilesDir, productsDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure disk storage for Profile pictures
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, profilesDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `profile-${uniqueSuffix}${ext}`);
  },
});

// Configure disk storage for Product media (photos & videos)
const productStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, productsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `product-${uniqueSuffix}${ext}`);
  },
});

const profileUpload = multer({
  storage: profileStorage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed for profile pictures"), false);
    }
  },
});

const productUpload = multer({
  storage: productStorage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit for high-def videos & photos
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image and video files are allowed"), false);
    }
  },
});

// ─── 1. Upload Profile Picture ───────────────────────────────────────────────
router.post(
  "/profile",
  authMiddleware,
  profileUpload.single("file"),
  (req, res, next) => {
    try {
      if (!req.file) {
        return ApiResponse.error(res, 400, "No profile image file uploaded.");
      }

      // Return relative serving path
      const fileUrl = `/uploads/profiles/${req.file.filename}`;
      return ApiResponse.success(res, 200, "Profile picture uploaded successfully.", {
        url: fileUrl,
        filename: req.file.filename,
      });
    } catch (error) {
      next(error);
    }
  }
);

// ─── 2. Upload Single Product Media (Photo or Video) ─────────────────────────
router.post(
  "/product",
  authMiddleware,
  productUpload.single("file"),
  (req, res, next) => {
    try {
      if (!req.file) {
        return ApiResponse.error(res, 400, "No product media file uploaded.");
      }

      const fileUrl = `/uploads/products/${req.file.filename}`;
      const isVideo = req.file.mimetype.startsWith("video/");

      return ApiResponse.success(res, 200, "Media uploaded successfully.", {
        url: fileUrl,
        filename: req.file.filename,
        mediaType: isVideo ? "video" : "image",
      });
    } catch (error) {
      next(error);
    }
  }
);

// ─── 3. Upload Multiple Product Photos/Videos ────────────────────────────────
router.post(
  "/product-multiple",
  authMiddleware,
  productUpload.array("files", 10),
  (req, res, next) => {
    try {
      if (!req.files || req.files.length === 0) {
        return ApiResponse.error(res, 400, "No files uploaded.");
      }

      const items = req.files.map((file) => ({
        url: `/uploads/products/${file.filename}`,
        filename: file.filename,
        mediaType: file.mimetype.startsWith("video/") ? "video" : "image",
      }));

      return ApiResponse.success(res, 200, "Files uploaded successfully.", {
        files: items,
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
