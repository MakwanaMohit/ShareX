const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Resource title is required"],
      trim: true,
    },
    category: {
      type: String,
      enum: ["book", "calculator", "lab-equipment", "electronics", "other"],
      required: [true, "Category is required"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    condition: {
      type: String,
      enum: ["new", "good", "fair", "poor"],
      required: [true, "Condition is required"],
    },
    images: {
      type: [String],
      default: [],
    },
    videos: {
      type: [String],
      default: [],
    },
    listingType: {
      type: String,
      enum: ["lend", "donate"],
      required: [true, "Listing type is required"],
    },
    securityDeposit: {
      type: Number,
      default: 0,
      min: [0, "Security deposit cannot be negative"],
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Text index for search
resourceSchema.index({ title: "text", description: "text" });

const Resource = mongoose.model("Resource", resourceSchema);
module.exports = Resource;
