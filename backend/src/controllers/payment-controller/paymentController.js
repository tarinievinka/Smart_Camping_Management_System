const Payment = require('../../models/payement-model/PaymentModel');

// Create a new payment
exports.createPayment = async (req, res) => {
  try {
    const payment = new Payment(req.body);
    await payment.save();
    res.status(201).json(payment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all payments
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find();
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a payment by ID
exports.getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    res.json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a payment by ID
exports.updatePayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    res.json(payment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a payment by ID
exports.deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    res.json({ message: 'Payment deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update payment status (success, failed, pending)
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    payment.paymentStatus = status;
    if (status === 'success') payment.paidAt = new Date();
    await payment.save();
    res.json(payment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
