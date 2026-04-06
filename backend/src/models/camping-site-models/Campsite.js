import mongoose from 'mongoose';

const CampsiteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  price: { type: Number, required: true },
  amenities: { type: [String], default: [] },
  images: { type: [String], default: [] },
  contactNumber: { type: String, default: '' },
  availability: { type: Boolean, default: true },
  minBookingDays: { type: Number, default: 1 },
  maxBookingDays: { type: Number, default: 30 },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

const Campsite = mongoose.model('Campsite', CampsiteSchema);

export default Campsite;
