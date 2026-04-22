import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '../../../context/ToastContext';
import HistoryCards from './history-card/HistoryCards';
import HistoryTable from './history-table/HistoryTable';
import PaymentMethod from './payment-method/PaymentMethod';
import RecentInvoices from './recent-invoices/RecentInvoices';

import { getAllPayments } from '../../../services/paymentApi';

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    fetchPayments();
  }, []);

  const toastShownRef = useRef(false);
  useEffect(() => {
    if (location.state?.message && !toastShownRef.current) {
      showToast(location.state.message, location.state.variant || 'success');
      toastShownRef.current = true;
      // Clear the message state so it doesn't pop up again on generic refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, showToast, navigate]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const data = await getAllPayments();
      console.log('Backend payments data received:', data);

      // Normalize backend data to match frontend expectations
      let normalizedData = (data || []).map(payment => {
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

      // Filter to only show payments for the logged-in user
      const storedUser = localStorage.getItem('user');
      const storedUserInfo = localStorage.getItem('userInfo');
      const parsedUser = storedUser ? JSON.parse(storedUser) : (storedUserInfo ? JSON.parse(storedUserInfo) : null);
      
      if (parsedUser) {
        const userEmail = (parsedUser.email || parsedUser.user?.email || '').toLowerCase();
        const userId = parsedUser._id || parsedUser.id || parsedUser.userId;
        
        console.log('Filtering for User:', { userId, userEmail });

        normalizedData = normalizedData.filter(payment => {
          const pUserId = payment.userId || (payment.user?._id || payment.user?.id) || payment.user;
          const pEmail = (payment.email || payment.userEmail || payment.billingDetails?.email || '').toLowerCase();
          
          const matchesId = userId && String(pUserId) === String(userId);
          const matchesEmail = userEmail && pEmail === userEmail;

          return matchesId || matchesEmail;
        });
      } else {
        normalizedData = [];
      }

      console.log('Normalized and filtered payments data:', normalizedData);
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
    </div>
  );
};

export default PaymentHistory;
