import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { createPayment } from '../../../../services/paymentApi';
import CardDetails from '../card-details/CardDetails';

const SimplePaymentForm = ({ amount = 303.80, bookingId = "507f1f77bcf86cd799439012", bookingType = "CampsiteBooking" }) => {
  const navigate = useNavigate();
  const [cardType, setCardType] = useState('visa');
  const [cardData, setCardData] = useState({
    cardholder: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    saveCard: false
  });
  const [processed, setProcessed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCardData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate expiration date
    if (cardData.expiryDate.length !== 5) {
      setError('Please enter a valid expiry date (MM/YY).');
      setLoading(false);
      return;
    }

    const [monthStr, yearStr] = cardData.expiryDate.split('/');
    const month = parseInt(monthStr, 10);
    const year = parseInt(`20${yearStr}`, 10);
    
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      setError('Card has expired. Please use a valid card.');
      setLoading(false);
      return;
    }

    try {
      // Prepared payment data with placeholder IDs
      const paymentData = {
        userId: "507f1f77bcf86cd799439011",
        bookingType: bookingType,
        bookingId: bookingId,
        amount: amount,
        paymentMethod: "card",
        transactionId: `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        paymentStatus: "pending"
      };

      await createPayment(paymentData);

      setProcessed(true);
      setLoading(false);

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/payment-history', { state: { message: 'Payment Successful! Your booking has been confirmed.', variant: 'success' } });
      }, 2000);
    } catch (err) {
      console.error('Payment failed:', err);
      setError('Payment processing failed. Please try again.');
      setLoading(false);
    }
  };

  if (processed) {
    return (
      <div className="bg-white rounded-lg p-8 border border-gray-100 text-center">
        <CheckCircle className="w-16 h-16 text-[#166534] mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h3>
        <p className="text-gray-600 mb-4">Your booking has been confirmed.</p>
        <p className="text-sm text-gray-500">Redirecting to history...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <CardDetails
          formData={cardData}
          onInputChange={handleInputChange}
          cardType={cardType}
          setCardType={setCardType}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#166534] hover:bg-[#14532d] disabled:bg-gray-400 text-white font-bold py-4 px-4 rounded-lg flex items-center justify-center gap-2 transition shadow-lg"
        >
          <Lock className="w-5 h-5" />
          {loading ? 'Processing Securely...' : `Pay LKR ${amount.toFixed(2)}`}
        </button>

        <p className="text-xs text-center text-gray-500">
          Secure encrypted payment with PCI-DSS compliance.
        </p>
      </form>
    </div>
  );
};

export default SimplePaymentForm;
