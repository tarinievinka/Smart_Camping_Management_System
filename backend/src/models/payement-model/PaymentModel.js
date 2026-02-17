const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  bookingType: {
    type: String,
    enum: ["CampsiteBooking", "EquipmentBooking", "GuideBooking"],
    required: true
  },

  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "bookingType"   // Dynamic reference
  },

  amount: {
    type: Number,
    required: true
  },

  paymentMethod: {
    type: String,
    enum: ["card", "upi", "cash", "online"],
    required: true
  },

  transactionId: {
    type: String
  },

  paymentStatus: {
    type: String,
    enum: ["pending", "success", "failed"],
    default: "pending"
  },

  paidAt: {
    type: Date
  }

}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);
