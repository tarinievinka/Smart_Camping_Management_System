const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  targetType: {
    type: String,
    enum: ["Campsite", "Equipment", "Guide"],
    required: true
  },

  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "targetType"   // Dynamic reference (same like bookingType)
  },

  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },

  title: {
    type: String
  },

  comment: {
    type: String
  },

  isVisible: {
    type: Boolean,
    default: true
  },

  editableUntil: {
    type: Date
  },

  sessionDate: {
    type: Date,
    required: true
  }

}, { timestamps: true });

module.exports = mongoose.model("Feedback", feedbackSchema);