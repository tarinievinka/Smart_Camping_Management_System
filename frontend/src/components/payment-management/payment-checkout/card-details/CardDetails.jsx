import React from 'react';
import { Lock, HelpCircle } from 'lucide-react';

const CardDetails = ({ formData, onInputChange, cardType, setCardType }) => {
  const formatCardNumber = (value) => {
    const digitsOnly = value.replace(/\D/g, '').slice(0, 16);
    return digitsOnly.replace(/(\d{4})/g, '$1 ').trim();
  };

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    onInputChange({
      target: {
        name: 'cardNumber',
        value: formatted
      }
    });
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length === 1 && parseInt(value) > 1) {
      value = '0' + value;
    }
    
    if (value.length >= 2) {
      let month = parseInt(value.slice(0, 2));
      let yearPart = value.slice(2, 4);
      
      if (month > 12) {
        month = '12';
      } else if (month === 0) {
        month = '01';
      } else {
        month = value.slice(0, 2);
      }
      
      value = month + '/' + yearPart;
    }

    onInputChange({
      target: {
        name: 'expiryDate',
        value: value
      }
    });
  };

  const handleCvvChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    onInputChange({
      target: {
        name: 'cvv',
        value: value
      }
    });
  };

  const handleCardholderChange = (e) => {
    const value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
    onInputChange({
      target: {
        name: 'cardholder',
        value: value
      }
    });
  };

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-100">
      {/* Header with Tabs */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-900">Card Details</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setCardType('visa')}
            className={`px-3 py-1 rounded text-xs font-semibold transition ${cardType === 'visa'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            VISA
          </button>
          <button
            onClick={() => setCardType('mastercard')}
            className={`px-3 py-1 rounded text-xs font-semibold transition ${cardType === 'mastercard'
              ? 'bg-red-100 text-red-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            MC
          </button>
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-5">
        {/* Cardholder Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Cardholder Name
          </label>
          <input
            type="text"
            name="cardholder"
            value={formData.cardholder}
            onChange={handleCardholderChange}
            placeholder="John Doe"
            required
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
          />
        </div>

        {/* Card Number */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Card Number
          </label>
          <div className="relative">
            <input
              type="text"
              name="cardNumber"
              value={formData.cardNumber}
              onChange={handleCardNumberChange}
              placeholder="0000 0000 0000 0000"
              maxLength="19"
              minLength="19"
              required
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
            />
            <Lock className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* Expiry Date and CVV */}
        <div className="grid grid-cols-2 gap-4">
          {/* Expiry Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Expiry Date
            </label>
            <input
              type="text"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleExpiryChange}
              placeholder="MM/YY"
              maxLength="5"
              minLength="5"
              required
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
            />
          </div>

          {/* CVV */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              CVV
            </label>
            <div className="relative">
              <input
                type="password"
                name="cvv"
                value={formData.cvv}
                onChange={handleCvvChange}
                placeholder="123"
                maxLength="3"
                minLength="3"
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
              />
              <HelpCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 cursor-help" />
            </div>
          </div>
        </div>

        {/* Save Card Checkbox */}
        <div className="flex items-center mt-4">
          <input
            type="checkbox"
            id="saveCard"
            name="saveCard"
            checked={formData.saveCard}
            onChange={onInputChange}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
          />
          <label htmlFor="saveCard" className="ml-2 text-sm text-gray-700">
            Save card information for future bookings
          </label>
        </div>
      </div>
    </div>
  );
};

export default CardDetails;
