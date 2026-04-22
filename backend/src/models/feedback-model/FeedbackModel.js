const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  userName: {
    type: String
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

  targetName: {
    type: String
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

<<<<<<< HEAD
=======
  sessionDate: {
    type: Date,
    required: true
  },

  sessionEndDate: {
    type: Date
  },

>>>>>>> 72d49f97b953854ffc2cce76cb28c3b75c102fd7
  imageUrls: {
    type: [String],
    default: []
  }

}, { timestamps: true });

module.exports = mongoose.model("Feedback", feedbackSchema);