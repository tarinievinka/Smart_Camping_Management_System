const mongoose = require("mongoose");

const customerNotificationSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true, trim: true },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "GuideBooking" },
    title: { type: String, required: true, trim: true },
    body: { type: String, default: "", trim: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CustomerNotification", customerNotificationSchema);
