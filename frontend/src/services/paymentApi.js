import axios from 'axios';

// Set your backend URL here
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ========== PAYMENT CRUD OPERATIONS ==========

/**
 * Get all payments
 */
export const getAllPayments = async () => {
  try {
    const response = await apiClient.get('/payment/display');
    return response.data;
  } catch (error) {
    console.error('Error fetching payments:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get payment by ID
 */
export const getPaymentById = async (id) => {
  try {
    const response = await apiClient.get(`/payment/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching payment:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Create new payment
 * @param {Object} paymentData - { amount, description, status, paymentMethod, orderId, date }
 */
export const createPayment = async (paymentData) => {
  try {
    const response = await apiClient.post('/payment/add', paymentData);
    return response.data;
  } catch (error) {
    console.error('Error creating payment:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Create new payment with receipt file (multipart/form-data)
 * @param {FormData} formData
 */
export const createPaymentWithReceipt = async (formData) => {
  try {
    const response = await apiClient.post('/payment/add', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating payment with receipt:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Update payment by ID
 * @param {string} id - Payment ID
 * @param {Object} updateData - Updated payment data
 */
export const updatePayment = async (id, updateData) => {
  try {
    const response = await apiClient.put(`/payment/update/${id}`, updateData);
    return response.data;
  } catch (error) {
    console.error('Error updating payment:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Delete payment by ID
 * @param {string} id - Payment ID
 */
export const deletePayment = async (id) => {
  try {
    const response = await apiClient.delete(`/payment/delete/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting payment:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Update payment status
 * @param {string} id - Payment ID
 * @param {Object} statusData - { status: 'completed' | 'pending' | 'failed' | 'refunded' }
 */
export const updatePaymentStatus = async (id, statusData) => {
  try {
    const response = await apiClient.patch(`/payment/${id}/status`, statusData);
    return response.data;
  } catch (error) {
    console.error('Error updating payment status:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get payments by status
 */
export const getPaymentsByStatus = async (status) => {
  try {
    const response = await apiClient.get(`/payment/status/${status}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching payments by status:', error.response?.data || error.message);
    throw error;
  }
};

export default apiClient;
