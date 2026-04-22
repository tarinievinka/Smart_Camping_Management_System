import React, { useState, useEffect } from 'react';
import {
    getAllPayments,
    updatePaymentStatus,
} from '../../../services/paymentApi';
import {
    CheckCircle,
    XCircle,
    Eye,
    Download,
    Search,
    Filter,
    Clock,
    FileCheck,
    FileX,
    Image as ImageIcon,
    ExternalLink,
    RefreshCw,
    ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const BankSlipAdminDashboard = () => {
    const navigate = useNavigate();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSlip, setSelectedSlip] = useState(null);
    const [filterStatus, setFilterStatus] = useState('pending');

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const data = await getAllPayments();
            // Filter only bank-deposit payments that have a receipt
            const bankSlips = (data || []).filter(p => p.paymentMethod === 'bank-deposit' && p.receiptUrl);
            setPayments(bankSlips);
        } catch (error) {
            console.error('Failed to fetch bank slips:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    const handleAction = async (id, status) => {
        try {
            await updatePaymentStatus(id, { status });
            setPayments(prev => prev.map(p => p._id === id ? { ...p, paymentStatus: status } : p));
            if (selectedSlip && selectedSlip._id === id) setSelectedSlip(null);
        } catch (error) {
            alert('Failed to update status');
        }
    };

    const filtered = payments.filter(p => {
        const matchesSearch = p.transactionId?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             p.bookingId?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'all' || p.paymentStatus === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const stats = {
        pending: payments.filter(p => p.paymentStatus === 'pending').length,
        approved: payments.filter(p => p.paymentStatus === 'success').length,
        rejected: payments.filter(p => p.paymentStatus === 'failed').length,
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-20">
            {/* Top Navigation */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => navigate('/admin/payments')}
                                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <FileCheck className="w-6 h-6 text-green-600" />
                                Bank Slip Verification
                            </h1>
                        </div>
                        <button 
                            onClick={fetchPayments}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg transition"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Pending Verification</p>
                            <p className="text-2xl font-bold text-slate-900">{stats.pending}</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                            <CheckCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Total Approved</p>
                            <p className="text-2xl font-bold text-slate-900">{stats.approved}</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center gap-4">
                        <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-red-600">
                            <XCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Total Rejected</p>
                            <p className="text-2xl font-bold text-slate-900">{stats.rejected}</p>
                        </div>
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search by Transaction or Booking ID..."
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-green-500 transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <Filter className="w-4 h-4 text-slate-400" />
                        <select 
                            className="bg-slate-50 border-none rounded-xl text-sm py-2.5 px-4 focus:ring-2 focus:ring-green-500 transition-all"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="pending">Show Pending</option>
                            <option value="success">Show Approved</option>
                            <option value="failed">Show Rejected</option>
                            <option value="all">Show All</option>
                        </select>
                    </div>
                </div>

                {/* Grid Content */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <RefreshCw className="w-10 h-10 text-green-600 animate-spin mb-4" />
                        <p className="text-slate-500 font-medium">Loading bank slips...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 py-20 text-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ImageIcon className="w-10 h-10 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">No slips found</h3>
                        <p className="text-slate-500">There are no bank slips matching your criteria.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filtered.map(payment => (
                            <div key={payment._id} className="group bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all duration-300">
                                <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden cursor-pointer" onClick={() => setSelectedSlip(payment)}>
                                    <img 
                                        src={`${API_BASE_URL}${payment.receiptUrl}`} 
                                        alt="Bank Slip" 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-900 shadow-lg">
                                            <Eye className="w-5 h-5" />
                                        </div>
                                    </div>
                                    <div className="absolute top-3 right-3">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${
                                            payment.paymentStatus === 'success' ? 'bg-green-500 text-white' : 
                                            payment.paymentStatus === 'failed' ? 'bg-red-500 text-white' : 
                                            'bg-amber-500 text-white'
                                        }`}>
                                            {payment.paymentStatus}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-5">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Amount</p>
                                            <p className="text-xl font-black text-slate-900">LKR {payment.amount?.toFixed(2)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Booking ID</p>
                                            <p className="text-sm font-bold text-slate-700">{payment.bookingId}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2 mb-6">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-500">Transaction:</span>
                                            <span className="font-mono font-medium text-slate-700">{payment.transactionId}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-500">Date:</span>
                                            <span className="font-medium text-slate-700">{new Date(payment.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    {payment.paymentStatus === 'pending' && (
                                        <div className="grid grid-cols-2 gap-3">
                                            <button 
                                                onClick={() => handleAction(payment._id, 'success')}
                                                className="flex items-center justify-center gap-2 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-green-200 transition-all active:scale-95"
                                            >
                                                <FileCheck className="w-4 h-4" />
                                                Approve
                                            </button>
                                            <button 
                                                onClick={() => handleAction(payment._id, 'failed')}
                                                className="flex items-center justify-center gap-2 py-2.5 bg-white border-2 border-red-100 hover:bg-red-50 text-red-600 text-sm font-bold rounded-xl transition-all active:scale-95"
                                            >
                                                <FileX className="w-4 h-4" />
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                    
                                    {payment.paymentStatus !== 'pending' && (
                                        <button 
                                            onClick={() => handleAction(payment._id, 'pending')}
                                            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl transition-all"
                                        >
                                            Reset to Pending
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Image Viewer Modal */}
            {selectedSlip && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
                    <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm" onClick={() => setSelectedSlip(null)}></div>
                    <div className="relative bg-white rounded-3xl overflow-hidden max-w-4xl w-full shadow-2xl flex flex-col max-h-full">
                        <div className="flex items-center justify-between p-4 border-b border-slate-100">
                            <div>
                                <h3 className="font-bold text-slate-900">Bank Slip Preview</h3>
                                <p className="text-xs text-slate-500">Booking: {selectedSlip.bookingId}</p>
                            </div>
                            <button 
                                onClick={() => setSelectedSlip(null)}
                                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <XCircle className="w-6 h-6 text-slate-400" />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-auto bg-slate-50 p-4">
                            <img 
                                src={`${API_BASE_URL}${selectedSlip.receiptUrl}`} 
                                alt="Full Bank Slip" 
                                className="max-w-full mx-auto shadow-lg rounded-lg"
                            />
                        </div>

                        <div className="p-6 bg-white border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <a 
                                    href={`${API_BASE_URL}${selectedSlip.receiptUrl}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:underline"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    Open in new tab
                                </a>
                                <button className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900">
                                    <Download className="w-4 h-4" />
                                    Download
                                </button>
                            </div>

                            {selectedSlip.paymentStatus === 'pending' && (
                                <div className="flex items-center gap-3">
                                    <button 
                                        onClick={() => handleAction(selectedSlip._id, 'failed')}
                                        className="px-6 py-2.5 border-2 border-red-100 text-red-600 font-bold rounded-xl hover:bg-red-50 transition-all"
                                    >
                                        Reject
                                    </button>
                                    <button 
                                        onClick={() => handleAction(selectedSlip._id, 'success')}
                                        className="px-6 py-2.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 shadow-lg shadow-green-200 transition-all"
                                    >
                                        Approve Payment
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BankSlipAdminDashboard;
