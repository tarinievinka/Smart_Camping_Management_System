import React, { useRef } from 'react';
import { Download, Printer, X } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const PaymentInvoice = ({ payment, onClose }) => {
  const invoiceRef = useRef();

  const generatePDF = async () => {
    try {
      const element = invoiceRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`Invoice-${payment.orderId || 'Unknown'}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF');
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(invoiceRef.current.innerHTML);
    printWindow.document.close();
    printWindow.print();
  };

  const invoiceNumber = `INV-${payment._id?.slice(-6).toUpperCase() || '000000'}`;
  const issueDate = new Date(payment.date).toLocaleDateString();
  const dueDate = new Date(new Date(payment.date).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString();

  const subtotal = payment.amount || 0;
  const tax = subtotal * 0.1;
  const discount = 0;
  const total = subtotal + tax - discount;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl my-8">

        {/* Header with Action Buttons */}
        <div className="flex items-center justify-between bg-gray-100 px-6 py-4 border-b rounded-t-lg">
          <h2 className="text-lg font-bold text-gray-900">Invoice {invoiceNumber}</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white py-1.5 px-3 rounded-lg transition text-sm"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button
              onClick={generatePDF}
              className="flex items-center gap-1.5 bg-[#166534] hover:bg-[#14532d] text-white py-1.5 px-3 rounded-lg transition text-sm"
            >
              <Download className="w-4 h-4" />
              PDF
            </button>
            <button
              onClick={onClose}
              className="flex items-center justify-center bg-gray-500 hover:bg-gray-600 text-white p-1.5 rounded-lg transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Invoice Content */}
        <div ref={invoiceRef} className="p-8 bg-white" style={{ fontFamily: 'Arial, sans-serif' }}>

          {/* Top Header: INVOICE title + meta */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">INVOICE</h1>
              <p className="text-sm text-gray-500 mt-1">Smart Camping Management System</p>
            </div>
            <div className="text-right space-y-1">
              <p className="text-sm text-gray-600"><span className="font-semibold">Invoice #:</span> {invoiceNumber}</p>
              <p className="text-sm text-gray-600"><span className="font-semibold">Issue Date:</span> {issueDate}</p>
              <p className="text-sm text-gray-600"><span className="font-semibold">Due Date:</span> {dueDate}</p>
            </div>
          </div>

          <hr className="border-gray-200 mb-6" />

          {/* FROM / BILL TO */}
          <div className="grid grid-cols-2 gap-8 mb-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">From</p>
              <div className="text-sm text-gray-700 space-y-0.5">
                <p className="font-semibold text-gray-900">Smart Camping Management</p>
                <p>123 Camping Street</p>
                <p>Mountain City, MC 12345</p>
                <p>contact@smartcamping.com</p>
                <p>Phone: (555) 123-4567</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Bill To</p>
              <div className="text-sm text-gray-700 space-y-0.5">
                <p className="font-semibold text-gray-900">Customer</p>
                <p>123 Customer Street</p>
                <p>City, ST 12345</p>
                <p>customer@email.com</p>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-blue-50 border-l-4 border-blue-500 px-4 py-3 mb-6 rounded-r-md flex items-center gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-0.5">Payment Method</p>
              <p className="capitalize font-semibold text-gray-900 text-sm">{payment.paymentMethod?.replace('-', ' ')}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-0.5">Status</p>
              <p className="text-[#166534] font-semibold text-sm">{payment.status?.toUpperCase()}</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Items</p>
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100 border-b-2 border-gray-300">
                  <th className="text-left px-4 py-2.5 font-semibold text-gray-700">Description</th>
                  <th className="text-right px-4 py-2.5 font-semibold text-gray-700">Unit Price</th>
                  <th className="text-center px-4 py-2.5 font-semibold text-gray-700">Qty</th>
                  <th className="text-right px-4 py-2.5 font-semibold text-gray-700">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="px-4 py-3 text-gray-800">{payment.description || 'Camping Service'}</td>
                  <td className="text-right px-4 py-3 text-gray-800">LKR {payment.amount?.toFixed(2)}</td>
                  <td className="text-center px-4 py-3 text-gray-800">1</td>
                  <td className="text-right px-4 py-3 font-semibold text-gray-900">LKR {payment.amount?.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-6">
            <div className="w-60 text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal:</span>
                <span className="font-medium text-gray-900">LKR {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-gray-200">
                <span className="text-gray-500">Tax (10%):</span>
                <span className="font-medium text-gray-900">LKR {tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-1 text-base font-bold">
                <span className="text-gray-900">TOTAL:</span>
                <span className="text-[#166534]">LKR {total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 pt-5">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Notes</p>
            <p className="text-sm text-gray-500 mb-4">
              Thank you for your business! Please contact us if you have any questions about this invoice.
            </p>
            <div className="text-center text-xs text-gray-300 mt-4 space-y-0.5">
              <p>This invoice was generated by Smart Camping Management System</p>
              <p>© 2024 Smart Camping. All rights reserved.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PaymentInvoice;
