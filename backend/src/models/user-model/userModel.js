const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    unique: true,
  },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['camper', 'guide', 'campsite_owner', 'admin'],
    default: 'camper',
  },
  phone: { type: String },
  campingDetails: {
    preferredLocations: [String],
    experienceLevel: { type: String, enum: ['beginner', 'intermediate', 'expert'] },
  },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model("user", userSchema);