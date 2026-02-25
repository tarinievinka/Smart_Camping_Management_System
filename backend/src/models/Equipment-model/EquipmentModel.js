const mongoose = require("mongoose");

const equipmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    enum: ["Tents", "Sleeping Bags", "Backpacks", "Cooking Gear", "Lighting", "Other"],
  },
  condition: {
    type: String,
    required: true,
    enum: ["New", "Good", "Fair", "Poor"],
  },
  rentalPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  salePrice: {
    type: Number,
    required: true,
    min: 0,
  },
  stockQuantity: {
    type: Number,
    required: true,
    min: 0,
  },
  availabilityStatus: {
    type: String,
    enum: ["Available", "Rented", "Out of Stock", "Deactivated"],
    default: "Available",
  },
}, { timestamps: true });

module.exports = mongoose.model("Equipment", equipmentSchema);