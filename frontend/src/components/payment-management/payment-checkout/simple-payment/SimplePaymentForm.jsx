import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { createPayment } from '../../../../services/paymentApi';
import CardDetails from '../card-details/CardDetails';
import { saveEquipmentBooking } from '../../../../utils/equipmentBookings';

<<<<<<< HEAD
const SimplePaymentForm = ({ alreadyPaid = false, amount = 303.80, bookingId = "507f1f77bcf86cd799439012", bookingType = "CampsiteBooking", equipmentItems = [], equipmentBookingDraft = null, returnPath = null }) => {
=======
const SimplePaymentForm = ({ amount = 303.80, bookingId = "507f1f77bcf86cd799439012", bookingType = "CampsiteBooking", equipmentItems = [], equipmentBookingDraft = null }) => {
>>>>>>> 72d49f97b953854ffc2cce76cb28c3b75c102fd7
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
    if (alreadyPaid) return;
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
      const user = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const userId = user._id || user.id || "507f1f77bcf86cd799439011";

      // Prepared payment data with placeholder IDs
      const paymentData = {
        userId: userId,
        bookingType: bookingType,
        bookingId: bookingId,
        amount: amount,
        paymentMethod: "card",
        transactionId: `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        paymentStatus: "pending"
      };

      await createPayment(paymentData);

      // Reduce stock if this is an equipment booking
      if (bookingType === 'EquipmentBooking' && equipmentItems.length > 0) {
        const EQUIP_API = process.env.REACT_APP_API_URL + '/api/equipment';
<<<<<<< HEAD
        const storedUser = JSON.parse(localStorage.getItem('userInfo') || '{}');
=======
>>>>>>> 72d49f97b953854ffc2cce76cb28c3b75c102fd7
        await Promise.all(
          equipmentItems.map(item =>
            fetch(`${EQUIP_API}/reduce-stock/${item._id}`, {
              method: 'PATCH',
<<<<<<< HEAD
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${storedUser.token}`
              },
=======
              headers: { 'Content-Type': 'application/json' },
>>>>>>> 72d49f97b953854ffc2cce76cb28c3b75c102fd7
              body: JSON.stringify({ quantity: item.quantity, mode: item.mode }),
            }).then(res => res.json())
          )
        );
      }

      if (bookingType === 'EquipmentBooking' && equipmentBookingDraft) {
        saveEquipmentBooking(equipmentBookingDraft, {
          bookingId,
          status: 'paid',
          paymentMethod: 'card',
          transactionId: paymentData.transactionId,
          totalAmount: amount,
        });
      }
      setProcessed(true);
      setLoading(false);

      // Redirect after 2 seconds
      setTimeout(() => {
<<<<<<< HEAD
        navigate('/payment-success', {
          state: { message: 'Payment successful. Your booking is now available.', variant: 'success' },
        });
=======
        if (bookingType === 'EquipmentBooking') {
          navigate('/equipment-bookings', {
            state: { message: 'Payment successful. Your equipment booking is now available.' },
          });
          return;
        }
        navigate('/payment-success', { state: { equipmentItems } });
>>>>>>> 72d49f97b953854ffc2cce76cb28c3b75c102fd7
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
          disabled={loading || alreadyPaid}
          className={`w-full font-bold py-4 px-4 rounded-lg flex items-center justify-center gap-2 transition shadow-lg ${
            alreadyPaid ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#166534] hover:bg-[#14532d] text-white'
          }`}
        >
          <Lock className="w-5 h-5" />
          {loading ? 'Processing Securely...' : alreadyPaid ? 'Payment Already Exists' : `Pay LKR ${amount.toFixed(2)}`}
        </button>

        <p className="text-xs text-center text-gray-500">
          Secure encrypted payment with PCI-DSS compliance.
        </p>
      </form>
    </div>
  );
};

export default SimplePaymentForm;
