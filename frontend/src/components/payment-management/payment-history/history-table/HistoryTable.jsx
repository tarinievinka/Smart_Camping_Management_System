import React, { useState } from 'react';
import { Download, Eye, FileText } from 'lucide-react';
import PaymentInvoice from '../../payment-invoice/PaymentInvoice';

const HistoryTable = ({ payments = [] }) => {
  const [showInvoice, setShowInvoice] = useState(false);
  const [showSlip, setShowSlip] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

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
        return 'bg-[#166534]/20 text-[#14532d]';
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
          <button className="text-[#166534] hover:text-[#14532d] font-semibold text-sm cursor-pointer">
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
                      LKR {transaction.amount?.toFixed(2) || '0.00'}
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
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDownloadInvoice(transaction)}
                          className="flex items-center gap-1 bg-[#166534] hover:bg-[#14532d] text-white py-1 px-3 rounded transition text-xs font-bold"
                          title="Download Invoice PDF"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          Invoice
                        </button>
                        {transaction.paymentMethod === 'bank-deposit' && transaction.receiptUrl && (
                          <button
                            onClick={() => {
                              setSelectedTransaction(transaction);
                              setShowSlip(true);
                            }}
                            className="flex items-center gap-1 bg-[#166534] hover:bg-[#14532d] text-white py-1 px-3 rounded transition text-xs font-bold"
                            title="View Bank Slip"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Slip
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Slip Modal */}
      {showSlip && selectedTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSlip(false)}></div>
          <div className="relative bg-white rounded-2xl overflow-hidden max-w-2xl w-full shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-gray-900">Your Uploaded Bank Slip</h3>
                <p className="text-xs text-gray-500">Transaction ID: {selectedTransaction.transactionId}</p>
              </div>
              <button
                onClick={() => setShowSlip(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
              >
                ✕
              </button>
            </div>
            <div className="p-4 bg-gray-50 flex items-center justify-center min-h-[300px]">
              <img
                src={`${API_BASE_URL}${selectedTransaction.receiptUrl}`}
                alt="Bank Slip"
                className="max-w-full max-h-[70vh] shadow-lg rounded-lg object-contain"
              />
            </div>
            <div className="p-4 bg-white border-t border-gray-100 flex justify-between items-center">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(selectedTransaction.status)}`}>
                Status: {selectedTransaction.status}
              </span>
              <button
                onClick={() => setShowSlip(false)}
                className="px-6 py-2 bg-[#166534] text-white font-bold rounded-lg hover:bg-[#14532d] transition"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

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
