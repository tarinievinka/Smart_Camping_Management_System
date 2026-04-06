import React from 'react';
import { Lock } from 'lucide-react';

const PaymentSummary = () => {
  const orderData = {
    title: 'Wilderness Retreat - Site #42',
    image: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=150&h=150&fit=crop',
    stay: '3 Nights Stay',
    dates: 'Oct 12 - Oct 15, 2023',
    guests: '2 Adults, 1 Child',
    costs: [
      {
        label: 'Campsite (Site #42)',
        amount: 67500.00
      },
      {
        label: 'Equipment Rental (Grill, Tent)',
        amount: 13500.00
      },
      {
        label: 'Service Fee',
        amount: 3750.00
      },
      {
        label: 'Taxes',
        amount: 6390.00
      }
    ],
    total: 91140.00
  };

  return (
    <div className="bg-white rounded-lg border border-gray-100 overflow-hidden sticky top-8">
      {/* Header Section */}
      <div className="bg-gray-50 p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Order Summary</h2>
        <p className="text-gray-600 text-sm">{orderData.title}</p>
      </div>

      {/* Content Section */}
      <div className="p-6">
        {/* Camping Details Card */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 flex gap-4">
          <img
            src={orderData.image}
            alt="Campsite"
            className="w-20 h-20 rounded-lg object-cover"
          />
          <div>
            <h3 className="font-bold text-gray-900 mb-1">{orderData.stay}</h3>
            <p className="text-sm text-gray-600 mb-1">{orderData.dates}</p>
            <p className="text-sm text-gray-600">{orderData.guests}</p>
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
          {orderData.costs.map((cost, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-gray-700">{cost.label}</span>
              <span className="font-semibold text-gray-900">LKR {cost.amount.toFixed(2)}</span>
            </div>
          ))}
        </div>

        {/* Total Amount Section */}
        <div className="mb-6">
          <div className="flex justify-between items-baseline mb-1">
            <span className="font-bold text-gray-900">Total Amount</span>
            <span className="text-3xl font-bold text-gray-900">LKR {orderData.total.toFixed(2)}</span>
          </div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">All prices in lkr</p>
        </div>

        {/* Complete Payment Button */}
        <button className="w-full bg-[#166534]/90 hover:bg-[#166534] text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition mb-4">
          <Lock className="w-5 h-5" />
          Complete Payment
        </button>

        {/* Terms Footer */}
        <p className="text-xs text-center text-gray-500">
          By clicking 'Complete Payment', you agree to our{' '}
          <button className="text-blue-600 hover:underline bg-none border-none cursor-pointer p-0">
            Terms of Service
          </button>{' '}
          and Cancellation Policy.
        </p>
      </div>
    </div>
  );
};

export default PaymentSummary;
