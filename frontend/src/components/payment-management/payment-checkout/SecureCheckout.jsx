import React, { useState } from 'react';
import { ChevronLeft, Shield, AlertCircle } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import PaymentSummary from './payment-summary/PaymentSummary';
import SimplePaymentForm from './simple-payment/SimplePaymentForm';
import { createPaymentWithReceipt } from '../../../services/paymentApi';
import GooglePayButton from '@google-pay/button-react';
import { saveEquipmentBooking } from '../../../utils/equipmentBookings';

const SecureCheckout = () => {
  const location = useLocation();
  const navigate = useNavigate();
    const { bookingId, amount, bookingType, title, image, stay, dates, guests, equipmentItems, equipmentBookingDraft, from } = location.state || {};

  
  const currentBookingId = bookingId || `temp-bk-${Math.random().toString(36).substr(2, 9)}`;
  const currentAmount = amount || 0.00;
  const currentBookingType = bookingType || 'EquipmentBooking';

  const [paymentMethod, setPaymentMethod] = useState('credit-card');
  const [receiptFile, setReceiptFile] = useState(null);
  const [alreadyPaid, setAlreadyPaid] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  React.useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        const { getAllPayments } = await import('../../../services/paymentApi');
        const payments = await getAllPayments();
        const existing = payments.find(p => 
          String(p.bookingId) === String(currentBookingId) && 
          ['pending', 'success'].includes(p.paymentStatus)
        );
        if (existing) {
          setAlreadyPaid(true);
        }
      } catch (err) {
        console.error("Error checking payment status:", err);
      } finally {
        setCheckingStatus(false);
      }
    };
    checkPaymentStatus();
  }, [currentBookingId]);

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
      const user = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const userId = user._id || user.id || '507f1f77bcf86cd799439011';

      const formData = new FormData();
      formData.append('userId', userId); 
      formData.append('bookingType', currentBookingType);
      formData.append('bookingId', currentBookingId);
      formData.append('amount', currentAmount);
      formData.append('paymentMethod', 'bank-deposit');
      formData.append('transactionId', `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`);
      formData.append('paymentStatus', 'pending');
      formData.append('receipt', receiptFile);
      
      await createPaymentWithReceipt(formData);

      // Clear equipment cart if applicable
      if (currentBookingType === 'EquipmentBooking') {
        const user = JSON.parse(localStorage.getItem('user'));
        const userId = user?._id || 'guest';
        localStorage.removeItem(`equipment_cart_${userId}`);
      }

      navigate('/payment-success', { state: { message: 'Bank deposit payment submitted successfully! Waiting for admin approval.', variant: 'success' } });

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

        {alreadyPaid && (
          <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-3 text-amber-800">
            <AlertCircle className="w-5 h-5" />
            <p className="font-medium">A payment for this booking is already in progress or completed. You cannot pay twice.</p>
          </div>
        )}

        {/* Payment Methods Tabs */}
        <div className={`bg-white rounded-lg p-6 border border-gray-100 mb-8 ${alreadyPaid ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="flex items-center justify-around">
            <button
              onClick={() => !alreadyPaid && setPaymentMethod('credit-card')}
              disabled={alreadyPaid}
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
              onClick={() => !alreadyPaid && setPaymentMethod('bank-deposit')}
              disabled={alreadyPaid}
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
              onClick={() => !alreadyPaid && setPaymentMethod('google-pay')}
              disabled={alreadyPaid}
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
            {paymentMethod === 'credit-card' && (
              <SimplePaymentForm 
                alreadyPaid={alreadyPaid}

                amount={currentAmount} 
                bookingId={currentBookingId} 
                bookingType={currentBookingType} 
                equipmentItems={equipmentItems}
                equipmentBookingDraft={equipmentBookingDraft}
                returnPath={from}

              />
            )}
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
                        PNG, JPG, PDF up to 10MB
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
                  disabled={alreadyPaid}
                  className={`w-full font-bold py-4 px-4 rounded-lg transition shadow-lg ${
                    alreadyPaid ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#166534] hover:bg-[#14532d] text-white'
                  }`}
                >
                  {alreadyPaid ? 'Payment Already Submitted' : 'Submit Receipt'}
                </button>
              </div>
            )}
            {paymentMethod === 'google-pay' && (
              <div className="bg-white rounded-lg p-6 border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Google Pay</h2>
                <p className="text-gray-600 mb-4">You will be redirected to Google Pay to complete your payment securely.</p>
                <div className="w-full flex justify-center mt-4">
                  <GooglePayButton
                    environment="TEST"
                    paymentRequest={{
                      apiVersion: 2,
                      apiVersionMinor: 0,
                      allowedPaymentMethods: [
                        {
                          type: 'CARD',
                          parameters: {
                            allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                            allowedCardNetworks: ['MASTERCARD', 'VISA'],
                          },
                          tokenizationSpecification: {
                            type: 'PAYMENT_GATEWAY',
                            parameters: {
                              gateway: 'example',
                              gatewayMerchantId: 'exampleGatewayMerchantId',
                            },
                          },
                        },
                      ],
                      merchantInfo: {
                        merchantId: '12345678901234567890',
                        merchantName: 'Smart Camping Management',
                      },
                      transactionInfo: {
                        totalPriceStatus: 'FINAL',
                        totalPriceLabel: 'Total',
                        totalPrice: currentAmount.toString() || '0.00',
                        currencyCode: 'LKR',
                        countryCode: 'LK',
                      },
                    }}
                    onLoadPaymentData={async (paymentRequest) => {
                      console.log('Google Pay successful', paymentRequest);
                      
                      // Reduce stock for equipment
                      if (currentBookingType === 'EquipmentBooking' && equipmentItems && equipmentItems.length > 0) {
                        const EQUIP_API = process.env.REACT_APP_API_URL + '/api/equipment';
                        try {
                          const storedUser = JSON.parse(localStorage.getItem('userInfo') || '{}');

                          await Promise.all(
                            equipmentItems.map(item =>
                              fetch(`${EQUIP_API}/reduce-stock/${item._id}`, {
                                method: 'PATCH',
                                headers: { 
                                  'Content-Type': 'application/json',
                                  'Authorization': `Bearer ${storedUser.token}`
                                },

                                body: JSON.stringify({ quantity: item.quantity, mode: item.mode }),
                              }).then(res => res.json())
                            )
                          );
                        } catch (err) {
                          console.error('Stock reduction failed:', err);
                        }
                      }

                      if (currentBookingType === 'EquipmentBooking' && equipmentBookingDraft) {
                        saveEquipmentBooking(equipmentBookingDraft, {
                          bookingId: currentBookingId,
                          status: 'paid',
                          paymentMethod: 'google-pay',
                          transactionId: `GPAY-${Date.now()}`,
                          totalAmount: currentAmount,
                        });
                      }

                      navigate('/payment-success', { 

                        state: { 
                          message: 'Google Pay payment completed successfully!', 
                          variant: 'success' 
                        } 
                      });
                    }}
                    onError={error => console.error('Google Pay Error:', error)}
                    buttonType="buy"
                    buttonColor="black"
                    buttonSizeMode="fill"
                    style={{ width: '100%', height: '48px' }}
                  />
                </div>
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
