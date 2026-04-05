import React, { useState } from 'react';
import { FileText, Download } from 'lucide-react';
import PaymentInvoice from '../../payment-invoice/PaymentInvoice';

const RecentInvoices = ({ payments = [] }) => {
  const [showInvoice, setShowInvoice] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Get the 3 most recent completed payments as invoices
  const invoices = payments
    .filter(p => p.status === 'completed')
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 3)
    .map((payment, index) => ({
      _id: payment._id,
      id: index + 1,
      invoiceNumber: `INV-${payment._id?.slice(-6).toUpperCase() || index}`,
      date: new Date(payment.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      amount: `$${payment.amount?.toFixed(2) || '0.00'}`,
      description: payment.description,
      orderId: payment.orderId,
      paymentMethod: payment.paymentMethod,
      status: payment.status
    }));

  const handleDownloadInvoice = (invoice) => {
    setSelectedInvoice({
      ...invoice,
      amount: parseFloat(invoice.amount.replace('$', ''))
    });
    setShowInvoice(true);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
      {/* Header */}
      <h2 className="text-lg font-bold text-gray-900 mb-6">Recent Invoices</h2>

      {/* Invoices List */}
      <div className="space-y-4 mb-6">
        {invoices.length === 0 ? (
          <div className="text-center py-8 text-gray-600">
            <p>No completed invoices yet.</p>
          </div>
        ) : (
          invoices.map((invoice) => (
            <div
              key={invoice.id}
              className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition"
            >
              <div className="flex items-center space-x-4">
                <div className="bg-gray-100 p-3 rounded-lg">
                  <FileText className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    Invoice #{invoice.invoiceNumber}
                  </p>
                  <p className="text-sm text-gray-600">
                    {invoice.date} • {invoice.amount}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => handleDownloadInvoice(invoice)}
                className="p-2 hover:bg-[#166534]/20 rounded-lg transition"
                title="Download Invoice PDF"
              >
                <Download className="w-6 h-6 text-[#166534]" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* View History Link */}
      <div className="flex justify-center">
        <button
          className="text-gray-700 font-semibold hover:text-gray-900 transition cursor-pointer"
        >
          View History
        </button>
      </div>

      {/* Invoice Modal */}
      {showInvoice && selectedInvoice && (
        <PaymentInvoice
          payment={selectedInvoice}
          onClose={() => {
            setShowInvoice(false);
            setSelectedInvoice(null);
          }}
        />
      )}
    </div>
  );
};

export default RecentInvoices;
