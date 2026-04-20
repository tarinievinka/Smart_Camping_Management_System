import React, { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';

import Footer from '../../../common/footer/Footer';

const PaymentSuccess = () => {
  useEffect(() => {
    // Clear equipment cart and favorites on success
    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user ? user._id : 'guest';
    localStorage.removeItem(`equipment_cart_${userId}`);
    // localStorage.removeItem(`equipment_favorites_${userId}`); // Keep favorites or clear? User said "my cart display empty", so keep favorites.
  }, []);

  return (
    <div>

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <CheckCircle className="w-20 h-20 text-[#166534] mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
            <p className="text-gray-600 mb-2">Your booking has been confirmed.</p>
            <p className="text-sm text-gray-500 mb-6">A confirmation email will be sent to you shortly.</p>
            
            <div className="bg-[#166534]/10 rounded-lg p-4 mb-6">
              <p className="text-sm font-semibold text-gray-900 mb-2">Booking Details</p>
              <p className="text-sm text-gray-600">Wilderness Retreat - Site #42</p>
              <p className="text-sm text-gray-600">Oct 12 - Oct 15, 2023</p>
              <p className="text-sm text-gray-600 font-semibold">Total: LKR 91140.00</p>
            </div>

            <div className="space-y-2">
              <a
                href="/payment-history"
                className="w-full block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition"
              >
                View Payment History
              </a>
              <a
                href="/"
                className="w-full block bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-3 px-4 rounded-lg transition"
              >
                Back to Home
              </a>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PaymentSuccess;
