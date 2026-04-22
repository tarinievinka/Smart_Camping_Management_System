import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Lock } from 'lucide-react';

const StripePayment = ({ amount = 303.80 }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) return;

    setLoading(true);

    try {
      // Create payment method
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement),
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      // Here you would send paymentMethod.id to your backend
      // For testing, we'll just simulate success
      console.log('Payment Method:', paymentMethod);
      
      setSuccess(true);
      setError(null);
      setTimeout(() => {
        window.location.href = '/payment-success';
      }, 2000);
    } catch (err) {
      setError('Payment failed. Please try again.');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white rounded-lg p-6 border border-gray-100">
        <div className="text-center">
          <div className="text-[#166534] text-4xl mb-4">✓</div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Payment Successful!</h3>
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-100">
      <h2 className="text-lg font-bold text-gray-900 mb-6">Card Payment</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Card Details
          </label>
          <div className="p-4 border border-gray-200 rounded-lg">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#fa755a',
                  },
                },
              }}
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={!stripe || loading}
          className="w-full bg-[#166534]/90 hover:bg-[#166534] disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition"
        >
          <Lock className="w-5 h-5" />
          {loading ? 'Processing...' : `Pay LKR ${amount.toFixed(2)}`}
        </button>

        <p className="text-xs text-center text-gray-500">
          Your payment is secure and encrypted with 256-bit SSL
        </p>
      </form>

      {/* Test Card Numbers for Stripe */}
      <div className="mt-6 p-4 bg-green-50 rounded-lg">
        <p className="text-xs font-semibold text-green-900 mb-2">Test Card Numbers:</p>
        <p className="text-xs text-green-800 font-mono">✓ 4242 4242 4242 4242 (Visa - Success)</p>
        <p className="text-xs text-green-800 font-mono">✗ 5000 0000 0000 0002 (Visa - Decline)</p>
        <p className="text-xs text-green-800 font-mono">Any future expiry date, any 3-digit CVC</p>
      </div>
    </div>
  );
};

export default StripePayment;
