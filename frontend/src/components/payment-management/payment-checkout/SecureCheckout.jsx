import React, { useState } from 'react';
import { ChevronLeft, Shield } from 'lucide-react';
import PaymentSummary from './payment-summary/PaymentSummary';
import SimplePaymentForm from './simple-payment/SimplePaymentForm';

const SecureCheckout = () => {
  const [paymentMethod, setPaymentMethod] = useState('credit-card');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <button className="flex items-center gap-2 hover:text-gray-900">
                <ChevronLeft className="w-4 h-4" />
                Back to booking
              </button>
              <span>/</span>
              <span>Booking</span>
              <span>/</span>
              <span>Review</span>
              <span>/</span>
              <span className="text-[#166534] font-semibold">Payment</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#166534]">
              <Shield className="w-4 h-4" />
              SECURE SSL ENCRYPTED
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Secure Checkout</h1>
          <p className="text-gray-600">
            Complete your reservation for the Wilderness Retreat at Pine Ridge.
          </p>
        </div>

        {/* Payment Methods Tabs */}
        <div className="bg-white rounded-lg p-6 border border-gray-100 mb-8">
          <div className="flex items-center justify-around">
            <button
              onClick={() => setPaymentMethod('credit-card')}
              className={`flex flex-col items-center gap-2 px-6 py-4 rounded-lg transition ${
                paymentMethod === 'credit-card'
                  ? 'border-b-2 border-[#166534]'
                  : 'border-b-2 border-transparent'
              }`}
            >
              <div className={`text-2xl ${paymentMethod === 'credit-card' ? 'text-[#166534]' : 'text-gray-400'}`}>
                💳
              </div>
              <span className={`text-sm font-semibold ${paymentMethod === 'credit-card' ? 'text-[#166534]' : 'text-gray-600'}`}>
                CREDIT CARD
              </span>
            </button>

            <button
              onClick={() => setPaymentMethod('paypal')}
              className={`flex flex-col items-center gap-2 px-6 py-4 rounded-lg transition ${
                paymentMethod === 'paypal'
                  ? 'border-b-2 border-[#166534]'
                  : 'border-b-2 border-transparent'
              }`}
            >
              <div className={`text-2xl ${paymentMethod === 'paypal' ? 'text-[#166534]' : 'text-gray-400'}`}>
                💰
              </div>
              <span className={`text-sm font-semibold ${paymentMethod === 'paypal' ? 'text-[#166534]' : 'text-gray-600'}`}>
                PAYPAL
              </span>
            </button>

            <button
              onClick={() => setPaymentMethod('apple-pay')}
              className={`flex flex-col items-center gap-2 px-6 py-4 rounded-lg transition ${
                paymentMethod === 'apple-pay'
                  ? 'border-b-2 border-[#166534]'
                  : 'border-b-2 border-transparent'
              }`}
            >
              <div className={`text-2xl ${paymentMethod === 'apple-pay' ? 'text-[#166534]' : 'text-gray-400'}`}>
                🅝
              </div>
              <span className={`text-sm font-semibold ${paymentMethod === 'apple-pay' ? 'text-[#166534]' : 'text-gray-600'}`}>
                APPLE PAY
              </span>
            </button>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Card Details */}
          <div className="lg:col-span-2">
            {paymentMethod === 'credit-card' && <SimplePaymentForm amount={303.80} />}
            {paymentMethod === 'paypal' && (
              <div className="bg-white rounded-lg p-6 border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4">PayPal Payment</h2>
                <p className="text-gray-600 mb-4">You will be redirected to PayPal to complete your payment securely.</p>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition">
                  Continue with PayPal
                </button>
              </div>
            )}
            {paymentMethod === 'apple-pay' && (
              <div className="bg-white rounded-lg p-6 border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Apple Pay</h2>
                <p className="text-gray-600 mb-4">You will be redirected to Apple Pay to complete your payment securely.</p>
                <button className="w-full bg-black hover:bg-gray-900 text-white font-semibold py-3 px-4 rounded-lg transition">
                  Continue with Apple Pay
                </button>
              </div>
            )}
          </div>

          {/* Right Column - Payment Summary */}
          <div>
            <PaymentSummary />
          </div>
        </div>

        {/* Security Badges Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-wrap items-center justify-center gap-8">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
              <Shield className="w-5 h-5 text-[#166534]" />
              PCI-DSS COMPLIANT
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
              <Shield className="w-5 h-5 text-[#166534]" />
              256-BIT SSL SECURE
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
              <Shield className="w-5 h-5 text-[#166534]" />
              MCAFEE SECURE
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecureCheckout;
