import React from 'react';

const PaymentFailure = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center py-12">
      <h1 className="text-3xl font-bold text-red-600 mb-4">Payment Failed</h1>
      <p className="text-gray-600 mb-6">Something went wrong with your payment. Please try again.</p>
      <a href="/payment-checkout" className="bg-[#166534] hover:bg-[#14532d] text-white font-semibold py-3 px-6 rounded-lg transition">
        Try Again
      </a>
    </div>
  );
};

export default PaymentFailure;
