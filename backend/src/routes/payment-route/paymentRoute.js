const express = require('express');
const router = express.Router();
const paymentController = require('../../controllers/payment-controller/paymentController');

// Create a new payment
router.post('/add', paymentController.createPayment);

// Get all payments
router.get('/display', paymentController.getAllPayments);

// Get a payment by ID
router.get('/:id', paymentController.getPaymentById);

// Update a payment by ID
router.put('/update/:id', paymentController.updatePayment);

// Delete a payment by ID
router.delete('/delete/:id', paymentController.deletePayment);

// Update payment status
router.patch('/:id/status', paymentController.updatePaymentStatus);

module.exports = router;
