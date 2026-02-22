const Payment = require('../../models/payement-model/PaymentModel');

const createPayment = async (data) => {
  const payment = new Payment(data);
  return await payment.save();
};

const getAllPayments = async () => {
  return await Payment.find();
};

const getPaymentById = async (id) => {
  return await Payment.findById(id);
};

const updatePayment = async (id, data) => {
  return await Payment.findByIdAndUpdate(id, data, { new: true });
};

const deletePayment = async (id) => {
  return await Payment.findByIdAndDelete(id);
};

const updatePaymentStatus = async (id, status) => {
  const payment = await Payment.findById(id);
  if (!payment) return null;
  payment.paymentStatus = status;
  if (status === 'success') payment.paidAt = new Date();
  await payment.save();
  return payment;
};

module.exports = {
  createPayment,
  getAllPayments,
  getPaymentById,
  updatePayment,
  deletePayment,
  updatePaymentStatus
};
