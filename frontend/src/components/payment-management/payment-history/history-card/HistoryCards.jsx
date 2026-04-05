import React from 'react';
import { TrendingUp, Gift, Briefcase } from 'lucide-react';

const HistoryCards = ({ payments = [] }) => {
  // Calculate stats from payments data
  const totalSpent = payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + (p.amount || 0), 0);
  const upcomingPayments = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + (p.amount || 0), 0);
  const activeRentals = payments.filter(p => p.status === 'completed').length;

  // Format currency
  const formatCurrency = (amount) => `$${amount?.toFixed(2) || '0.00'}`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Total Spent Card */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <div className="flex items-start justify-between mb-4">
          <div className="bg-[#166534]/20 p-3 rounded-lg">
            <TrendingUp className="text-[#166534] text-xl w-6 h-6" />
          </div>
          <span className="text-[#166534] text-sm font-semibold">Total Usage</span>
        </div>
        <h3 className="text-gray-600 text-sm font-medium mb-2">Total Spent</h3>
        <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalSpent)}</p>
        <p className="text-sm text-gray-500 mt-1">{payments.filter(p => p.status === 'completed').length} completed transactions</p>
      </div>

      {/* Upcoming Payments Card */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <div className="flex items-start justify-between mb-4">
          <div className="bg-yellow-100 p-3 rounded-lg">
            <Gift className="text-yellow-600 text-xl w-6 h-6" />
          </div>
          <button className="bg-[#166534]/90 hover:bg-[#166534] text-white text-xs font-semibold px-3 py-1 rounded">
            Pay Now
          </button>
        </div>
        <h3 className="text-gray-600 text-sm font-medium mb-2">Pending Payments</h3>
        <p className="text-3xl font-bold text-gray-900 mb-1">{formatCurrency(upcomingPayments)}</p>
        <p className="text-orange-500 text-sm font-medium">{payments.filter(p => p.status === 'pending').length} transactions pending</p>
      </div>

      {/* Active Rentals Card */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <div className="flex items-start justify-between mb-4">
          <div className="bg-blue-100 p-3 rounded-lg">
            <Briefcase className="text-blue-600 text-xl w-6 h-6" />
          </div>
        </div>
        <h3 className="text-gray-600 text-sm font-medium mb-2">Active Transactions</h3>
        <p className="text-3xl font-bold text-gray-900 mb-1">{activeRentals} Items</p>
        <p className="text-blue-600 text-sm font-medium">Camping experiences & equipment</p>
      </div>
    </div>
  );
};

export default HistoryCards;
