import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, UserCheck, Plus, Clock } from "lucide-react";
import axios from "axios";

import StatCard from "./stat-card/StatCard";
import BookingTable from "./booking-table/BookingTable";
import PerformanceChart from "./performance-chart/PerformanceChart";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const GuideDashboard = () => {
    const [guides, setGuides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pendingCount, setPendingCount] = useState(0);
    const navigate = useNavigate();

    const fetchGuides = async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            const res = await axios.get(`${API_URL}/api/guides/display`);
            setGuides(res.data);
            setError(null);
        } catch (err) {
            setError("Failed to load guides. Please make sure the backend is running.");
            console.error(err);
        } finally {
            if (!silent) setLoading(false);
        }
    };

    useEffect(() => {
        fetchGuides();
    }, []);

    const handleDelete = (id) => {
        setGuides((prev) => prev.filter((g) => g._id !== id));
    };

    const availableCount = guides.filter((g) => g.availability).length;

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div
                        className="w-8 h-8 border-4 rounded-full animate-spin"
                        style={{ borderColor: 'rgba(22,101,52,0.2)', borderTopColor: '#166534' }}
                    />
                    <p className="text-sm text-gray-400 font-medium">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Guide Dashboard</h1>
                        <p className="text-gray-500 text-sm mt-1">
                            Manage and monitor your camping guides
                        </p>
                    </div>
                    <button
                        onClick={() => navigate("/guides/add")}
                        className="inline-flex items-center gap-2 px-5 py-2.5 text-white rounded-xl font-semibold text-sm shadow-sm hover:shadow-md transition-all"
                        style={{ backgroundColor: '#166534' }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#14532d'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = '#166534'}
                    >
                        <Plus size={16} /> Add Guide
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                        {error}
                    </div>
                )}

                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
                    <StatCard
                        title="Total Guides"
                        value={guides.length}
                        trend={guides.length > 0 ? `${guides.length} registered` : null}
                        icon={<Users size={24} />}
                        color="bg-blue-500"
                    />
                    <StatCard
                        title="Available"
                        value={availableCount}
                        trend={guides.length > 0 ? `${Math.round((availableCount / guides.length) * 100)}%` : null}
                        icon={<UserCheck size={24} />}
                        color="bg-[#166534]"
                    />
                    <StatCard
                        title="Pending Approval"
                        value={pendingCount}
                        trend={pendingCount > 0 ? 'Awaiting review' : 'All clear'}
                        icon={<Clock size={24} />}
                        color="bg-amber-500"
                    />
                </div>

                {/* Layout */}
                <div className="space-y-6">
                    <div>
                        <PerformanceChart guides={guides} />
                    </div>
                    <div>
                        <BookingTable guides={guides} onDelete={handleDelete} />
                    </div>

                    {/* Pending Applications - inline on same page */}
                    <PendingApplications
                        onApproved={() => fetchGuides(true)}
                        onCountChange={setPendingCount}
                    />
                </div>
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────────────────────
   Pending Guide Applications  (self-contained sub-component)
───────────────────────────────────────────────────────────── */
const PendingApplications = ({ onApproved, onCountChange }) => {
    const [pending, setPending] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionMsg, setActionMsg] = useState({ type: '', text: '' });

    const fetchPending = async () => {
        setLoading(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
            const token = userInfo.token;
            const res = await axios.get(`${API_URL}/api/`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            const allUsers = Array.isArray(res.data) ? res.data : [];
            const filtered = allUsers.filter(u => u.role === 'guide' && u.guideStatus === 'pending');
            setPending(filtered);
            if (onCountChange) onCountChange(filtered.length);
        } catch (err) {
            console.error('Failed to fetch pending guides:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPending();
    }, []);

    const showMsg = (type, text) => {
        setActionMsg({ type, text });
        setTimeout(() => setActionMsg({ type: '', text: '' }), 3500);
    };

    const handleApprove = async (applicantId) => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
            const token = userInfo.token;
            await axios.patch(
                `${API_URL}/api/guides/${applicantId}/approve`,
                { verified: true },
                { headers: token ? { Authorization: `Bearer ${token}` } : {} }
            );
            showMsg('success', 'Guide approved! Their profile has been created.');
            // Refresh pending list AND the all-guides roster above
            await fetchPending();
            if (onApproved) onApproved();
        } catch (err) {
            showMsg('error', err?.response?.data?.error || 'Failed to approve guide.');
        }
    };

    const handleReject = async (applicantId) => {
        if (!window.confirm('Are you sure you want to reject this application?')) return;
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
            const token = userInfo.token;
            await axios.patch(
                `${API_URL}/api/${applicantId}/status`,
                { isActive: false },
                { headers: token ? { Authorization: `Bearer ${token}` } : {} }
            );
            showMsg('success', 'Application rejected.');
            await fetchPending();
        } catch (err) {
            console.error('Reject error:', err);
            showMsg('error', err?.response?.data?.error || 'Failed to reject application.');
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden"
            style={{ border: '1px solid #fde68a' }}>

            {/* Section Header */}
            <div className="px-6 py-4 border-b flex items-center justify-between"
                style={{ background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)', borderColor: '#fde68a' }}>
                <div>
                    <h3 className="text-lg font-bold flex items-center gap-2"
                        style={{ color: '#92400e' }}>
                        <span className="inline-flex items-center justify-center w-6 h-6 text-white text-xs rounded-full font-bold"
                            style={{ backgroundColor: '#d97706' }}>
                            {pending.length}
                        </span>
                        Pending Guide Applications
                    </h3>
                    <p className="text-sm mt-0.5" style={{ color: '#b45309' }}>
                        Review applicant CVs before approving — approved guides appear in the roster above
                    </p>
                </div>
            </div>

            {/* Action Message Banner */}
            {actionMsg.text && (
                <div className={`mx-6 mt-4 px-4 py-3 rounded-xl text-sm font-semibold ${
                    actionMsg.type === 'success'
                        ? 'bg-green-50 border border-green-200 text-green-800'
                        : 'bg-red-50 border border-red-200 text-red-800'
                }`}>
                    {actionMsg.text}
                </div>
            )}

            {/* Body */}
            {loading ? (
                <div className="flex items-center justify-center py-10">
                    <div className="w-6 h-6 border-4 rounded-full animate-spin"
                        style={{ borderColor: 'rgba(217,119,6,0.2)', borderTopColor: '#d97706' }} />
                </div>
            ) : pending.length === 0 ? (
                <div className="py-10 text-center text-gray-400 text-sm">
                    No pending applications right now ✓
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr style={{ backgroundColor: '#fffbeb' }}>
                                {['Applicant', 'Contact', 'NIC', 'Experience', 'Languages', 'CV', 'Actions'].map(col => (
                                    <th key={col}
                                        className="px-6 py-3 text-left font-semibold text-xs uppercase tracking-wider"
                                        style={{ color: '#92400e' }}>
                                        {col}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {pending.map((applicant, idx) => {
                                const app = applicant.guideApplication || {};
                                const displayName = app.fullName || applicant.name || 'Unknown';
                                return (
                                    <tr key={applicant._id}
                                        className="transition-colors"
                                        style={{ borderTop: idx > 0 ? '1px solid #fef3c7' : 'none' }}
                                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fffbeb'}
                                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>

                                        {/* Applicant */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                                                    style={{ backgroundColor: 'rgba(217,119,6,0.12)', color: '#d97706' }}>
                                                    {displayName.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">{displayName}</p>
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold"
                                                        style={{ backgroundColor: '#fef3c7', color: '#b45309' }}>
                                                        ⏳ Pending
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Contact */}
                                        <td className="px-6 py-4">
                                            <p className="text-gray-700">{applicant.email}</p>
                                            <p className="text-xs text-gray-400">{applicant.phone || '—'}</p>
                                        </td>

                                        {/* NIC */}
                                        <td className="px-6 py-4 text-gray-700 font-mono text-xs">
                                            {app.nic || '—'}
                                        </td>

                                        {/* Experience */}
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold">
                                                {app.experience ? `${app.experience} yrs` : '—'}
                                            </span>
                                        </td>

                                        {/* Languages */}
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {app.languages?.length > 0
                                                    ? app.languages.map(lang => (
                                                        <span key={lang}
                                                            className="px-2 py-0.5 rounded text-xs font-medium"
                                                            style={{ backgroundColor: '#f3f4f6', color: '#374151' }}>
                                                            {lang}
                                                        </span>
                                                    ))
                                                    : <span className="text-gray-400">—</span>
                                                }
                                            </div>
                                        </td>

                                        {/* CV */}
                                        <td className="px-6 py-4">
                                            {app.cv ? (
                                                <a
                                                    href={`${API_URL}${app.cv}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all"
                                                    style={{ backgroundColor: '#2563eb' }}
                                                >
                                                    📄 View CV
                                                </a>
                                            ) : (
                                                <span className="text-gray-400 text-xs italic">No CV</span>
                                            )}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleApprove(applicant._id)}
                                                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all"
                                                    style={{ backgroundColor: '#166534' }}
                                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#14532d'}
                                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#166534'}
                                                >
                                                    ✓ Approve
                                                </button>
                                                <button
                                                    onClick={() => handleReject(applicant._id)}
                                                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all"
                                                    style={{ backgroundColor: '#dc2626' }}
                                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#b91c1c'}
                                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#dc2626'}
                                                >
                                                    ✕ Reject
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default GuideDashboard;