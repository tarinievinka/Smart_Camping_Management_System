const express = require("express");
const router = express.Router();
const guideBookingController = require("../../controllers/guide-booking-controller/guideBookingController");

// Create booking
router.post("/add", guideBookingController.createBooking);

// Get all bookings
router.get("/display", guideBookingController.getAllBookings);

// Customer notifications (after guide confirms booking, etc.)
router.get("/notifications", guideBookingController.getCustomerNotifications);
router.patch("/notifications/:id/read", guideBookingController.markCustomerNotificationRead);

// Update a booking by ID
router.put("/update/:id", guideBookingController.updateBooking);

// Delete booking by ID
router.delete("/cancel/:id", guideBookingController.deleteBookingById);

module.exports = router;
