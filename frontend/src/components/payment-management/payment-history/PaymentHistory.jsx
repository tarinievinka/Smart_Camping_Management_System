import React, { useState, useEffect } from 'react';
import HistoryCards from './history-card/HistoryCards';
import HistoryTable from './history-table/HistoryTable';
import PaymentMethod from './payment-method/PaymentMethod';
import RecentInvoices from './recent-invoices/RecentInvoices';
import Navbar from '../../../common/navbar/Navbar';
import Footer from '../../../common/footer/Footer';
import { getAllPayments } from '../../../services/paymentApi';

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const data = await getAllPayments();
      console.log('Backend payments data received:', data);

      // Normalize backend data to match frontend expectations
      const normalizedData = (data || []).map(payment => {
        // Map backend 'success' to frontend 'completed'
        let status = payment.paymentStatus || 'pending';
        if (status === 'success') status = 'completed';

        return {
          ...payment,
          status: status,
          date: payment.createdAt || payment.date,
          transactionId: payment.transactionId || payment._id,
          description: payment.bookingType === 'CampsiteBooking' ? 'Camping Service' :
            payment.bookingType === 'EquipmentBooking' ? 'Equipment Rental' :
              payment.bookingType === 'GuideBooking' ? 'Guide Service' :
                payment.description || 'Camping Service'
        };
      });

      console.log('Normalized payments data:', normalizedData);
      setPayments(normalizedData);
      setError(null);
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError('Failed to load payment data');
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        {/* Main Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Management</h1>
            <p className="text-gray-600">View and manage your camping expenses and billing details.</p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading payment data...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8">
              {error}
            </div>
          )}

          {/* Content - Only show when data is loaded */}
          {!loading && (
            <>
              {/* History Cards */}
              <HistoryCards payments={payments} />

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Transaction History (2 columns) */}
                <div className="lg:col-span-2">
                  <HistoryTable payments={payments} />
                </div>

                {/* Right Column - Payment Methods and Recent Invoices */}
                <div className="space-y-6">
                  <PaymentMethod />
                  <RecentInvoices payments={payments} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PaymentHistory;
