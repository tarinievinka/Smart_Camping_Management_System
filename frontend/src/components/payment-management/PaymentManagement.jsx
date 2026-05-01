import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Loader, Eye, FileText } from 'lucide-react';

import PaymentInvoice from './payment-invoice/PaymentInvoice';
import {
  getAllPayments,
  createPayment,
  updatePayment,
  deletePayment,
  updatePaymentStatus,
} from '../../services/paymentApi';

const PaymentManagement = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoicePayment, setInvoicePayment] = useState(null);
  const [formData, setFormData] = useState({
    amount: '',
    bookingType: 'CampsiteBooking',
    paymentStatus: 'pending',
    paymentMethod: 'credit-card',
    bookingId: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [filter, setFilter] = useState('all');

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllPayments();
      if (filter === 'all') {
        setPayments(data);
      } else {
        setPayments(data.filter(p => p.paymentStatus === filter));
      }
    } catch (error) {
      console.error('Failed to fetch payments:', error);
      alert('Failed to load payments');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  // Fetch all payments on component mount
  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const paymentDataToSend = {
        ...formData,
        amount: parseFloat(formData.amount),
      };

      if (editingId) {
        // Update existing payment
        await updatePayment(editingId, paymentDataToSend);
        alert('Payment updated successfully!');
        setEditingId(null);
      } else {
        // Create new payment
        await createPayment(paymentDataToSend);
        alert('Payment created successfully!');
      }

      // Reset form and refresh list
      setFormData({
        amount: '',
        bookingType: 'CampsiteBooking',
        paymentStatus: 'pending',
        paymentMethod: 'credit-card',
        bookingId: '',
        date: new Date().toISOString().split('T')[0],
      });
      setShowForm(false);
      await fetchPayments();
    } catch (error) {
      console.error('Error saving payment:', error);
      alert('Error saving payment');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      amount: item.amount,
      bookingType: item.bookingType || 'CampsiteBooking',
      paymentStatus: item.paymentStatus,
      paymentMethod: item.paymentMethod,
      bookingId: item.bookingId || '',
      date: item.date?.split('T')[0] || new Date().toISOString().split('T')[0],
    });
    setEditingId(item._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this payment?')) {
      try {
        setLoading(true);
        await deletePayment(id);
        alert('Payment deleted successfully!');
        await fetchPayments();
      } catch (error) {
        console.error('Error deleting payment:', error);
        alert('Error deleting payment');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      setLoading(true);
      await updatePaymentStatus(id, { status: newStatus });
      alert('Payment status updated!');
      await fetchPayments();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating status');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      amount: '',
      bookingType: 'CampsiteBooking',
      paymentStatus: 'pending',
      paymentMethod: 'credit-card',
      bookingId: '',
      date: new Date().toISOString().split('T')[0],
    });
  };

  const handleGenerateInvoice = (payment) => {
    setInvoicePayment(payment);
    setShowInvoice(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'bg-[#166534]/20 text-[#14532d]';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>

      
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Payment Management</h1>
              <p className="text-gray-600 mt-1">Manage and track all payment transactions</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-[#166534] hover:bg-[#14532d] text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              <Plus className="w-5 h-5" />
              Record Payment
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="bg-white rounded-lg shadow mb-6 p-4 flex gap-4">
            {['all', 'success', 'pending', 'failed', 'refunded'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  filter === status
                    ? 'bg-[#166534] text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          {/* Form Modal */}
          {showForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
                <h2 className="text-2xl font-bold mb-4">
                  {editingId ? 'Edit Payment' : 'Record New Payment'}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Amount (LKR)
                    </label>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      step="0.01"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#166534]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Booking Type
                    </label>
                    <select
                      name="bookingType"
                      value={formData.bookingType}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#166534]"
                    >
                      <option value="CampsiteBooking">Campsite Booking</option>
                      <option value="EquipmentBooking">Equipment Booking</option>
                      <option value="GuideBooking">Guide Booking</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Booking ID
                    </label>
                    <input
                      type="text"
                      name="bookingId"
                      value={formData.bookingId}
                      onChange={handleInputChange}
                      placeholder="e.g., 507f1f77bcf86cd799439012"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#166534]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Payment Method
                    </label>
                    <select
                      name="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#166534]"
                    >
                      <option value="credit-card">Credit Card</option>
                      <option value="paypal">PayPal</option>
                      <option value="bank-transfer">Bank Transfer</option>
                      <option value="apple-pay">Apple Pay</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Status
                    </label>
                    <select
                      name="paymentStatus"
                      value={formData.paymentStatus}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#166534]"
                    >
                      <option value="pending">Pending</option>
                      <option value="success">Completed</option>
                      <option value="failed">Failed</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#166534]"
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-[#166534] hover:bg-[#14532d] disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
                    >
                      {loading && <Loader className="w-4 h-4 animate-spin" />}
                      {editingId ? 'Update' : 'Create'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold py-2 px-4 rounded-lg transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Details Modal */}
          {showDetails && selectedPayment && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
                <h2 className="text-2xl font-bold mb-4">Payment Details</h2>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-600">Booking ID</label>
                    <p className="font-semibold text-gray-900 truncate" title={selectedPayment.bookingId || selectedPayment._id}>
                      {selectedPayment.bookingId || selectedPayment._id || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Amount</label>
                    <p className="font-semibold text-gray-900">LKR {selectedPayment.amount?.toFixed(2)}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Booking Type</label>
                    <p className="text-gray-700">{selectedPayment.bookingType || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Payment Method</label>
                    <p className="text-gray-700">{selectedPayment.paymentMethod}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Status</label>
                    <p className={`inline-block px-3 py-1 rounded font-semibold text-sm ${getStatusColor(selectedPayment.paymentStatus)}`}>
                      {selectedPayment.paymentStatus}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Date</label>
                    <p className="text-gray-700">{selectedPayment.date ? new Date(selectedPayment.date).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  {selectedPayment.receiptUrl && (
                    <div className="pt-2">
                      <label className="text-sm text-gray-600 block mb-2">Receipt Image</label>
                      <a href={`http://localhost:5000${selectedPayment.receiptUrl}`} target="_blank" rel="noopener noreferrer">
                        <img 
                          src={`http://localhost:5000${selectedPayment.receiptUrl}`} 
                          alt="Payment Receipt" 
                          className="w-full h-auto rounded-lg border border-gray-200 cursor-pointer object-cover max-h-48 hover:opacity-90 transition"
                        />
                      </a>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setShowDetails(false)}
                  className="w-full mt-6 bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold py-2 px-4 rounded-lg transition"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Payments Table */}
          {loading && payments.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-8 h-8 animate-spin text-[#166534]" />
            </div>
          ) : payments.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-600 mb-4">No payments found</p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-[#166534] hover:bg-[#14532d] text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                Record First Payment
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Booking ID</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Amount</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Type</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Method</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment._id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900 font-semibold truncate max-w-[120px]" title={payment.bookingId || payment._id}>
                        {payment.bookingId || payment._id || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">LKR {payment.amount?.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{payment.bookingType}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 capitalize">{payment.paymentMethod.replace('-', ' ')}</td>
                      <td className="px-6 py-4 text-sm">
                        <select
                          value={payment.paymentStatus}
                          onChange={(e) => handleStatusChange(payment._id, e.target.value)}
                          className={`px-2 py-1 rounded font-semibold text-sm cursor-pointer ${getStatusColor(payment.paymentStatus)}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="success">Completed</option>
                          <option value="failed">Failed</option>
                          <option value="refunded">Refunded</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{new Date(payment.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-sm flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedPayment(payment);
                            setShowDetails(true);
                          }}
                          className="flex items-center gap-1 bg-[#166534] hover:bg-[#14532d] text-white py-1 px-2 rounded transition"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleGenerateInvoice(payment)}
                          className="flex items-center gap-1 bg-purple-600 hover:bg-purple-700 text-white py-1 px-2 rounded transition"
                          title="Generate Invoice"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(payment)}
                          className="flex items-center gap-1 bg-orange-600 hover:bg-orange-700 text-white py-1 px-2 rounded transition"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(payment._id)}
                          className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white py-1 px-2 rounded transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Summary Stats */}
          {payments.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm mb-2">Total Amount</p>
                <p className="text-3xl font-bold text-gray-900">
                  LKR {payments.reduce((sum, p) => sum + (p.amount || 0), 0).toFixed(2)}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm mb-2">Completed</p>
                <p className="text-3xl font-bold text-[#166534]">
                  LKR {payments.filter(p => p.paymentStatus === 'success').reduce((sum, p) => sum + (p.amount || 0), 0).toFixed(2)}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm mb-2">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">
                  LKR {payments.filter(p => p.paymentStatus === 'pending').reduce((sum, p) => sum + (p.amount || 0), 0).toFixed(2)}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm mb-2">Failed/Refunded</p>
                <p className="text-3xl font-bold text-red-600">
                  LKR {payments.filter(p => ['failed', 'refunded'].includes(p.paymentStatus)).reduce((sum, p) => sum + (p.amount || 0), 0).toFixed(2)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Invoice Modal */}
      {showInvoice && invoicePayment && (
        <PaymentInvoice
          payment={invoicePayment}
          onClose={() => {
            setShowInvoice(false);
            setInvoicePayment(null);
          }}
        />
      )}

    </div>
  );
};

export default PaymentManagement;
