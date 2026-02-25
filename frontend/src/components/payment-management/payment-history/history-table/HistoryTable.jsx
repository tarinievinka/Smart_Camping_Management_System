import React, { useState } from 'react';
import { Download } from 'lucide-react';
import PaymentInvoice from '../../payment-invoice/PaymentInvoice';

const HistoryTable = ({ payments = [] }) => {
  const [showInvoice, setShowInvoice] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const handleDownloadInvoice = (transaction) => {
    setSelectedTransaction({
      ...transaction,
      amount: transaction.amount,
      date: transaction.date || new Date().toISOString()
    });
    setShowInvoice(true);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'refunded':
        return 'bg-red-100 text-red-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Transaction History</h2>
          <button className="text-green-600 hover:text-green-700 font-semibold text-sm cursor-pointer">
            View all
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {payments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No transactions found. Start by making a payment.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Transaction ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {payments.map((transaction) => (
                  <tr key={transaction._id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm text-gray-700 font-medium">
                      {formatDate(transaction.date)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {transaction.description || 'Camping Service'}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      ${transaction.amount?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-block px-3 py-1 rounded font-semibold ${getStatusColor(transaction.status)}`}>
                        {transaction.status?.charAt(0).toUpperCase() + transaction.status?.slice(1) || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                      {transaction.transactionId || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => handleDownloadInvoice(transaction)}
                        className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded transition"
                        title="Download Invoice PDF"
                      >
                        <Download className="w-4 h-4" />
                        Invoice
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Invoice Modal */}
      {showInvoice && selectedTransaction && (
        <PaymentInvoice
          payment={selectedTransaction}
          onClose={() => {
            setShowInvoice(false);
            setSelectedTransaction(null);
          }}
        />
      )}
    </>
  );
};

export default HistoryTable;
