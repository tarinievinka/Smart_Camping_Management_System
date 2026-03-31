import React from 'react';
import { CreditCard, Edit2, Plus } from 'lucide-react';

const PaymentMethod = () => {
  const [paymentMethods] = React.useState([
    {
      id: 1,
      type: 'Visa',
      lastFour: '4242',
      expiry: '10/25',
      cardType: 'visa'
    },
    {
      id: 2,
      type: 'Mastercard',
      lastFour: '3599',
      expiry: '12/26',
      cardType: 'mastercard'
    }
  ]);

  const getCardTypeStyles = (cardType) => {
    switch (cardType) {
      case 'visa':
        return 'bg-blue-50 border-blue-200';
      case 'mastercard':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getIconStyles = (cardType) => {
    switch (cardType) {
      case 'visa':
        return 'text-blue-600';
      case 'mastercard':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
      {/* Header */}
      <h2 className="text-lg font-bold text-gray-900 mb-6">Payment Methods</h2>

      {/* Payment Method Cards */}
      <div className="space-y-4 mb-6">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className={`p-4 rounded-lg border flex items-center justify-between ${getCardTypeStyles(
              method.cardType
            )}`}
          >
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-lg bg-white`}>
                <CreditCard className={`w-6 h-6 ${getIconStyles(method.cardType)}`} />
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {method.type}
                </p>
                <p className="text-sm text-gray-600">
                  Ending in {method.lastFour}
                </p>
                <p className="text-xs text-gray-500">
                  Expires {method.expiry}
                </p>
              </div>
            </div>
            <button className="p-2 hover:bg-white rounded-lg transition">
              <Edit2 className={`w-5 h-5 ${getIconStyles(method.cardType)}`} />
            </button>
          </div>
        ))}
      </div>

      {/* Add New Card Button */}
      <button className="w-full py-3 px-4 border border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition flex items-center justify-center space-x-2">
        <Plus className="w-5 h-5 text-gray-600" />
        <span className="text-gray-700 font-semibold">Add New Card</span>
      </button>
    </div>
  );
};

export default PaymentMethod;
