import React, { useState } from 'react';
import { ChevronLeft, Shield } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import PaymentSummary from './payment-summary/PaymentSummary';
import SimplePaymentForm from './simple-payment/SimplePaymentForm';
import { createPaymentWithReceipt } from '../../../services/paymentApi';

const SecureCheckout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { bookingId, amount, bookingType, title, image, stay, dates, guests } = location.state || {};
  
  const currentBookingId = bookingId || '507f1f77bcf86cd799439012';
  const currentAmount = amount || 91140.00;
  const currentBookingType = bookingType || 'CampsiteBooking';

  const [paymentMethod, setPaymentMethod] = useState('credit-card');
  const [receiptFile, setReceiptFile] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setReceiptFile(e.target.files[0]);
    }
  };

  const handleSubmitReceipt = async () => {
    if (!receiptFile) {
      alert("Please upload a receipt first!");
      return;
    }
    
    try {
      const formData = new FormData();
      // Use mock IDs for demo/testing that matches current front-end behavior
      formData.append('userId', '507f1f77bcf86cd799439011'); 
      formData.append('bookingType', currentBookingType);
      formData.append('bookingId', currentBookingId);
      formData.append('amount', currentAmount);
      formData.append('paymentMethod', 'bank-deposit');
      formData.append('transactionId', `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`);
      formData.append('paymentStatus', 'pending');
      formData.append('receipt', receiptFile);
      
      await createPaymentWithReceipt(formData);
      navigate('/payment-history', { state: { message: 'Bank deposit payment submitted successfully! Waiting for admin approval.', variant: 'success' } });
    } catch (err) {
      console.error('Payment failed:', err);
      alert('Payment submission failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <button onClick={() => window.history.back()} className="flex items-center gap-2 hover:text-gray-900 border-none bg-transparent cursor-pointer p-0">
                <ChevronLeft className="w-4 h-4" />
                Back
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
                CREDIT / DEBIT CARD
              </span>
            </button>

            <button
              onClick={() => setPaymentMethod('bank-deposit')}
              className={`flex flex-col items-center gap-2 px-6 py-4 rounded-lg transition ${
                paymentMethod === 'bank-deposit'
                  ? 'border-b-2 border-[#166534]'
                  : 'border-b-2 border-transparent'
              }`}
            >
              <div className={`text-2xl ${paymentMethod === 'bank-deposit' ? 'text-[#166534]' : 'text-gray-400'}`}>
                🏦
              </div>
              <span className={`text-sm font-semibold ${paymentMethod === 'bank-deposit' ? 'text-[#166534]' : 'text-gray-600'}`}>
                BANK DEPOSIT
              </span>
            </button>            <button
              onClick={() => setPaymentMethod('google-pay')}
              className={`flex flex-col items-center gap-2 px-6 py-4 rounded-lg transition ${
                paymentMethod === 'google-pay'
                  ? 'border-b-2 border-[#166534]'
                  : 'border-b-2 border-transparent'
              }`}
            >
              <div className={`text-2xl ${paymentMethod === 'google-pay' ? 'text-[#166534]' : 'text-gray-400'}`}>
                🅖
              </div>
              <span className={`text-sm font-semibold ${paymentMethod === 'google-pay' ? 'text-[#166534]' : 'text-gray-600'}`}>
                GOOGLE PAY
              </span>
            </button>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Card Details */}
          <div className="lg:col-span-2">
            {paymentMethod === 'credit-card' && <SimplePaymentForm amount={currentAmount} bookingId={currentBookingId} bookingType={currentBookingType} />}
            {paymentMethod === 'bank-deposit' && (
              <div className="bg-white rounded-lg p-6 border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Bank Deposit Details</h2>
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-600 mb-2"><span className="font-semibold">Bank Name:</span> Commercial Bank</p>
                  <p className="text-sm text-gray-600 mb-2"><span className="font-semibold">Account Name:</span> Smart Camping Management</p>
                  <p className="text-sm text-gray-600 mb-2"><span className="font-semibold">Account Number:</span> 1234567890</p>
                  <p className="text-sm text-gray-600"><span className="font-semibold">Branch:</span> City Branch</p>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Upload Payment Receipt
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-[#166534] transition">
                    <div className="space-y-1 text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="flex text-sm text-gray-600 justify-center">
                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-[#166534] hover:text-[#14532d] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#166534]">
                          <span>Upload a file</span>
                          <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*,.pdf" onChange={handleFileChange} />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, PDF up to 5MB
                      </p>
                    </div>
                  </div>
                  {receiptFile && (
                    <div className="mt-4 flex items-center justify-between bg-white px-4 py-3 border border-green-200 rounded-lg shadow-sm">
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-[#166534] font-bold">✓</span>
                        <span className="text-sm font-medium text-gray-700 truncate">{receiptFile.name}</span>
                      </div>
                      <button onClick={() => setReceiptFile(null)} className="text-gray-400 hover:text-red-500 font-bold ml-4">
                        ✕
                      </button>
                    </div>
                  )}
                </div>

                <button 
                  onClick={handleSubmitReceipt}
                  className="w-full bg-[#166534] hover:bg-[#14532d] text-white font-bold py-4 px-4 rounded-lg transition shadow-lg"
                >
                  Submit Receipt
                </button>
              </div>
            )}
            {paymentMethod === 'google-pay' && (
              <div className="bg-white rounded-lg p-6 border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Google Pay</h2>
                <p className="text-gray-600 mb-4">You will be redirected to Google Pay to complete your payment securely.</p>
                <button className="w-full bg-black hover:bg-gray-900 text-white font-semibold py-3 px-4 rounded-lg transition">
                  Continue with Google Pay
                </button>
              </div>
            )}
          </div>

          {/* Right Column - Payment Summary */}
          <div>
            <PaymentSummary amount={currentAmount} title={title} image={image} stay={stay} dates={dates} guests={guests} />
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
