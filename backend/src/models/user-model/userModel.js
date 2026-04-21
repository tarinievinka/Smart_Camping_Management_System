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
  phone: { 
    type: String,
    validate: {
      validator: function(v) {
        // Allows exactly 10 digits or empty/null
        return !v || /^\d{10}$/.test(v);
      },
      message: props => `${props.value} must be exactly 10 digits!`
    }
  },
  campingDetails: {
    preferredLocations: [String],
    experienceLevel: { type: String, enum: ['beginner', 'intermediate', 'expert'] },
  },
  guideStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  guideApplication: {
    experience: { type: Number, min: 0 },
    fullName: { type: String, trim: true },
    nic: { type: String, trim: true },
    age: { type: Number, min: 18 },
    description: { type: String, trim: true },
    languages: { type: [String], default: [] },
    cv: { type: String, trim: true },
  },
  isActive: { type: Boolean, default: true },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
}, { timestamps: true });

module.exports = mongoose.model("user", userSchema);