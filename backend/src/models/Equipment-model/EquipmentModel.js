const mongoose = require("mongoose");

const equipmentSchema = new mongoose.Schema({

  name: {
    type: String,
    required: [true, "Equipment name is required"],
    trim: true,
    minlength: [3,   "Name must be at least 3 characters"],
    maxlength: [100, "Name cannot exceed 100 characters"],
  },

  category: {
    type: String,
    required: [true, "Category is required"],
    enum: {
      values:  ["Tents", "Sleeping Bags", "Backpacks", "Cooking Gear", "Lighting", "Other"],
      message: "{VALUE} is not a valid category",
    },
  },

  condition: {
    type: String,
    required: [true, "Condition is required"],
    enum: {
      values:  ["New", "Good", "Fair", "Poor"],
      message: "{VALUE} is not a valid condition",
    },
  },

  rentalPrice: {
    type: Number,
    required: [true, "Rental price is required"],
    min: [1, "Rental price must be greater than 0"],
  },

  salePrice: {
    type: Number,
    required: [true, "Sale price is required"],
    min: [1, "Sale price must be greater than 0"],
  },

  stockQuantity: {
    type: Number,
    required: [true, "Stock quantity is required"],
    min: [0, "Stock quantity cannot be negative"],
  },

  availabilityStatus: {
    type: String,
    enum: {
      values:  ["Available", "Rented", "Out of Stock", "Deactivated"],
      message: "{VALUE} is not a valid availability status",
    },
    default: "Available",
  },

  imageUrl: {
    type: String,
    default: "",
  },

}, { timestamps: true });

// ── Custom validator: salePrice must be >= rentalPrice ──────
equipmentSchema.pre("save", function (next) {
  if (this.salePrice < this.rentalPrice) {
    return next(new Error("Sale price must not be less than rental price"));
  }
  next();
});

// Same check on findByIdAndUpdate
equipmentSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  if (
    update.salePrice !== undefined &&
    update.rentalPrice !== undefined &&
    Number(update.salePrice) < Number(update.rentalPrice)
  ) {
    return next(new Error("Sale price must not be less than rental price"));
  }
  next();
});

module.exports = mongoose.model("Equipment", equipmentSchema);