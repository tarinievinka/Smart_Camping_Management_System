import React, { useState, useEffect } from 'react';
import {
    getAllPayments,
    updatePaymentStatus,
    deletePayment,
} from '../../../services/paymentApi';
import {
    Trash2,
    RefreshCw,
    CheckCircle,
    XCircle,
    RotateCcw,
    Search,
    Filter,
    AlertTriangle,
    Coins,
    Clock,
    BadgeCheck,
    FileCheck,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ─── Status badge colours ────────────────────────────────────────────────────
const statusConfig = {
    success: { label: 'Success', bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
    completed: { label: 'Completed', bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
    pending: { label: 'Pending', bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500' },
    failed: { label: 'Failed', bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
    cancelled: { label: 'Cancelled', bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-400' },
    refunded: { label: 'Refunded', bg: 'bg-purple-100', text: 'text-purple-700', dot: 'bg-purple-500' },
};

const StatusBadge = ({ status }) => {
    const cfg = statusConfig[status?.toLowerCase()] || statusConfig.pending;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
        </span>
    );
};

// ─── Summary Card ─────────────────────────────────────────────────────────────
const SummaryCard = ({ icon: Icon, label, value, color, sub }) => (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
            <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
    </div>
);

// ─── Confirm Modal ────────────────────────────────────────────────────────────
const ConfirmModal = ({ open, title, message, confirmLabel, confirmClass, onConfirm, onCancel }) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
                <div className="flex items-center gap-3 mb-3">
                    <AlertTriangle className="w-6 h-6 text-amber-500" />
                    <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                </div>
                <p className="text-sm text-gray-600 mb-6">{message}</p>
                <div className="flex gap-3 justify-end">
                    <button onClick={onCancel} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition">
                        Cancel
                    </button>
                    <button onClick={onConfirm} className={`px-4 py-2 text-sm font-semibold text-white rounded-lg transition ${confirmClass}`}>
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const PaymentAdminDashboard = () => {
    const navigate = useNavigate();
    const [payments, setPayments] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [toast, setToast] = useState(null);
    const [modal, setModal] = useState(null); // { type: 'delete'|'status', payment, newStatus? }

    // ── Fetch ────────────────────────────────────────────────────────────────
    const fetchPayments = async () => {
        setLoading(true);
        try {
            const data = await getAllPayments();
            const normalized = (data || []).map((p) => ({
                ...p,
                status: p.paymentStatus || 'pending',
                date: p.createdAt || p.date,
                description: p.bookingType === 'CampsiteBooking' ? 'Camping Service' :
                    p.bookingType === 'EquipmentBooking' ? 'Equipment Rental' :
                        p.bookingType === 'GuideBooking' ? 'Guide Service' :
                            p.description || 'Camping Service',
            }));
            setPayments(normalized);
            setError(null);
        } catch {
            setError('Failed to load payments.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPayments(); }, []);

    // ── Filter / Search ──────────────────────────────────────────────────────
    useEffect(() => {
        let result = [...payments];
        if (statusFilter !== 'all') result = result.filter((p) => p.status?.toLowerCase() === statusFilter);
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(
                (p) =>
                    p.transactionId?.toLowerCase().includes(q) ||
                    p.description?.toLowerCase().includes(q) ||
                    p.paymentMethod?.toLowerCase().includes(q) ||
                    String(p.amount).includes(q),
            );
        }
        setFiltered(result);
    }, [payments, statusFilter, searchQuery]);

    // ── Toast ────────────────────────────────────────────────────────────────
    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    // ── Actions ──────────────────────────────────────────────────────────────
    const handleUpdateStatus = async () => {
        const { payment, newStatus } = modal;
        try {
            await updatePaymentStatus(payment._id, { status: newStatus });
            setPayments((prev) =>
                prev.map((p) => p._id === payment._id ? { ...p, status: newStatus, paymentStatus: newStatus } : p),
            );
            showToast(`Status updated to "${newStatus}" successfully.`);
        } catch {
            showToast('Failed to update status.', 'error');
        } finally {
            setModal(null);
        }
    };

    const handleDelete = async () => {
        const { payment } = modal;
        try {
            await deletePayment(payment._id);
            setPayments((prev) => prev.filter((p) => p._id !== payment._id));
            showToast('Payment record deleted.');
        } catch {
            showToast('Failed to delete payment.', 'error');
        } finally {
            setModal(null);
        }
    };

    // ── Stats ────────────────────────────────────────────────────────────────
    const totalRevenue = payments.filter((p) => ['success', 'completed'].includes(p.status?.toLowerCase())).reduce((s, p) => s + (p.amount || 0), 0);
    const pendingCount = payments.filter((p) => p.status?.toLowerCase() === 'pending').length;
    const successCount = payments.filter((p) => ['success', 'completed'].includes(p.status?.toLowerCase())).length;
    const refundCount = payments.filter((p) => p.status?.toLowerCase() === 'refunded').length;

    const formatDate = (d) => {
        if (!d) return 'N/A';
        return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top bar */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Payment Administration</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Manage, update, and remove payment records</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/admin/bank-slips')}
                        className="flex items-center gap-2 px-4 py-2 bg-[#166534] hover:bg-[#14532d] text-white text-sm font-semibold rounded-lg transition"
                    >
                        <FileCheck className="w-4 h-4" />
                        Verify Bank Slips
                    </button>
                    <button
                        onClick={fetchPayments}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

                {/* Summary Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <SummaryCard icon={Coins} label="Total Revenue" value={`LKR ${totalRevenue.toFixed(2)}`} color="bg-green-600" sub={`${successCount} completed`} />
                    <SummaryCard icon={Clock} label="Pending" value={pendingCount} color="bg-yellow-500" sub="awaiting confirmation" />
                    <SummaryCard icon={BadgeCheck} label="Completed" value={successCount} color="bg-[#166534]" sub="successful payments" />
                    <SummaryCard icon={RotateCcw} label="Refunded" value={refundCount} color="bg-purple-600" sub="total refunds" />
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by transaction ID, method, amount..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="border border-gray-200 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="all">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="success">Success</option>
                            <option value="completed">Completed</option>
                            <option value="failed">Failed</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="refunded">Refunded</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-900">Payment Records</h2>
                        <span className="text-sm text-gray-500">{filtered.length} record{filtered.length !== 1 ? 's' : ''}</span>
                    </div>

                    {loading ? (
                        <div className="py-20 text-center text-gray-500">
                            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-green-500" />
                            Loading payments...
                        </div>
                    ) : error ? (
                        <div className="py-12 text-center text-red-500">
                            <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                            {error}
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="py-12 text-center text-gray-400">No payment records found.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        {['Date', 'Transaction ID', 'Description', 'Method', 'Amount', 'Status', 'Update Status', 'Delete'].map((h) => (
                                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filtered.map((payment) => (
                                        <tr key={payment._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDate(payment.date)}</td>
                                            <td className="px-4 py-3 font-mono text-gray-700 text-xs whitespace-nowrap">{payment.transactionId || payment._id?.slice(-8)}</td>
                                            <td className="px-4 py-3 text-gray-700">{payment.description}</td>
                                            <td className="px-4 py-3 text-gray-600 capitalize">{payment.paymentMethod?.replace('-', ' ')}</td>
                                            <td className="px-4 py-3 font-semibold text-gray-900">LKR {payment.amount?.toFixed(2)}</td>
                                            <td className="px-4 py-3"><StatusBadge status={payment.status} /></td>

                                            {/* Update Status buttons */}
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1.5">
                                                    <button
                                                        onClick={() => setModal({ type: 'status', payment, newStatus: 'success' })}
                                                        title="Confirm / Approve"
                                                        className="p-1.5 rounded-lg bg-green-50 hover:bg-green-100 text-green-600 transition"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setModal({ type: 'status', payment, newStatus: 'cancelled' })}
                                                        title="Cancel"
                                                        className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 transition"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setModal({ type: 'status', payment, newStatus: 'refunded' })}
                                                        title="Refund"
                                                        className="p-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-600 transition"
                                                    >
                                                        <RotateCcw className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>

                                            {/* Delete */}
                                            <td className="px-4 py-3">
                                                <button
                                                    onClick={() => setModal({ type: 'delete', payment })}
                                                    title="Delete record"
                                                    className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Confirm Modal */}
            {modal?.type === 'status' && (
                <ConfirmModal
                    open
                    title="Update Payment Status"
                    message={`Change payment "${modal.payment.transactionId}" status to "${modal.newStatus}"?`}
                    confirmLabel={`Set to ${modal.newStatus}`}
                    confirmClass={
                        modal.newStatus === 'success' ? 'bg-green-600 hover:bg-green-700' :
                            modal.newStatus === 'cancelled' ? 'bg-gray-600 hover:bg-gray-700' :
                                'bg-purple-600 hover:bg-purple-700'
                    }
                    onConfirm={handleUpdateStatus}
                    onCancel={() => setModal(null)}
                />
            )}

            {modal?.type === 'delete' && (
                <ConfirmModal
                    open
                    title="Delete Payment Record"
                    message={`Permanently delete payment "${modal.payment.transactionId}"? This action cannot be undone.`}
                    confirmLabel="Delete"
                    confirmClass="bg-red-600 hover:bg-red-700"
                    onConfirm={handleDelete}
                    onCancel={() => setModal(null)}
                />
            )}

            {/* Toast notification */}
            {toast && (
                <div className={`fixed bottom-6 right-6 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold text-white flex items-center gap-2 z-50 transition-all ${toast.type === 'error' ? 'bg-red-600' : 'bg-green-600'
                    }`}>
                    {toast.type === 'error' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                    {toast.msg}
                </div>
            )}
        </div>
    );
};

export default PaymentAdminDashboard;
