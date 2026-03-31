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
  isActive: { type: Boolean, default: true },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
}, { timestamps: true });

module.exports = mongoose.model("user", userSchema);