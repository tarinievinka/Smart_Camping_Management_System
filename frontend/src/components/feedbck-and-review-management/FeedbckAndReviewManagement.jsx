import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// ── Star Rating Display ────────────────────────────────────────────────────────
const StarRating = ({ rating }) => {
    return (
        <div style={{ display: 'flex', gap: '2px' }}>
            {[1, 2, 3, 4, 5].map((star) => (
                <svg
                    key={star}
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill={star <= rating ? '#f59e0b' : 'none'}
                    stroke={star <= rating ? '#f59e0b' : '#d1d5db'}
                    strokeWidth="2"
                >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
            ))}
        </div>
    );
};

// ── Status Badge ───────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
    const config = {
        published: { bg: '#dcfce7', color: '#166534', label: 'Published' },
        pending: { bg: '#fef9c3', color: '#854d0e', label: 'Pending' },
        hidden: { bg: '#f3f4f6', color: '#374151', label: 'Hidden' },
        flagged: { bg: '#fee2e2', color: '#991b1b', label: 'Flagged' },
    };
    const cfg = config[status] || config.pending;
    return (
        <span style={{
            padding: '3px 10px',
            borderRadius: '999px',
            fontSize: '0.72rem',
            fontWeight: 700,
            backgroundColor: cfg.bg,
            color: cfg.color,
        }}>
            {cfg.label}
        </span>
    );
};

// ── Confirm Modal ──────────────────────────────────────────────────────────────
const ConfirmModal = ({ open, title, message, onConfirm, onCancel }) => {
    if (!open) return null;
    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem'
        }}>
            <div style={{
                background: 'white', borderRadius: '16px', padding: '1.75rem',
                maxWidth: '420px', width: '100%', boxShadow: '0 25px 50px rgba(0,0,0,0.25)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#dc2626" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#111827' }}>{title}</h3>
                </div>
                <p style={{ margin: '0 0 1.5rem', fontSize: '0.875rem', color: '#6b7280' }}>{message}</p>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                    <button onClick={onCancel} style={{ padding: '0.5rem 1.25rem', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#f9fafb', color: '#374151', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                        Cancel
                    </button>
                    <button onClick={onConfirm} style={{ padding: '0.5rem 1.25rem', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg,#dc2626,#991b1b)', color: 'white', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

// ── Sample Data ────────────────────────────────────────────────────────────────
const SAMPLE_REVIEWS = [
    { _id: '1', userName: 'Alice Sharma', userEmail: 'alice@example.com', rating: 5, comment: 'Absolutely loved the camping experience! The equipment was top-notch and guides were very helpful.', category: 'Equipment', status: 'published', createdAt: '2026-04-15T08:30:00Z' },
    { _id: '2', userName: 'Bob Patel', userEmail: 'bob@example.com', rating: 4, comment: 'Great guides, very knowledgeable. Would definitely book again.', category: 'Guide', status: 'published', createdAt: '2026-04-14T12:00:00Z' },
    { _id: '3', userName: 'Carol Singh', userEmail: 'carol@example.com', rating: 2, comment: 'The campsite was a bit noisy and not as clean as expected. Disappointed.', category: 'Campsite', status: 'flagged', createdAt: '2026-04-13T09:15:00Z' },
    { _id: '4', userName: 'David Kumar', userEmail: 'david@example.com', rating: 5, comment: 'Fantastic experience from start to finish. Will recommend to friends!', category: 'General', status: 'published', createdAt: '2026-04-12T16:45:00Z' },
    { _id: '5', userName: 'Eva Nair', userEmail: 'eva@example.com', rating: 3, comment: 'Average experience. Equipment was okay but guide was late by 30 minutes.', category: 'Guide', status: 'pending', createdAt: '2026-04-11T11:00:00Z' },
    { _id: '6', userName: 'Frank Thomas', userEmail: 'frank@example.com', rating: 1, comment: 'Terrible service! Equipment was broken and no replacement offered.', category: 'Equipment', status: 'flagged', createdAt: '2026-04-10T07:20:00Z' },
    { _id: '7', userName: 'Grace Joseph', userEmail: 'grace@example.com', rating: 4, comment: 'Really enjoyed the trip. Scenic views and excellent campsite facilities.', category: 'Campsite', status: 'published', createdAt: '2026-04-09T14:30:00Z' },
    { _id: '8', userName: 'Henry Raj', userEmail: 'henry@example.com', rating: 5, comment: 'The best camping trip I have ever been on. 10/10 would recommend.', category: 'General', status: 'published', createdAt: '2026-04-08T10:00:00Z' },
];

// ── Main Component ─────────────────────────────────────────────────────────────
const FeedbckAndReviewManagement = () => {
    const navigate = useNavigate();
    const [reviews, setReviews] = useState(SAMPLE_REVIEWS);
    const [filtered, setFiltered] = useState(SAMPLE_REVIEWS);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [ratingFilter, setRatingFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [deleteModal, setDeleteModal] = useState(null);
    const [toast, setToast] = useState(null);

    // ── Filtering ──────────────────────────────────────────────────────────────
    useEffect(() => {
        let result = [...reviews];
        if (statusFilter !== 'all') result = result.filter(r => r.status === statusFilter);
        if (ratingFilter !== 'all') result = result.filter(r => r.rating === parseInt(ratingFilter));
        if (categoryFilter !== 'all') result = result.filter(r => r.category === categoryFilter);
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(r =>
                r.userName?.toLowerCase().includes(q) ||
                r.comment?.toLowerCase().includes(q) ||
                r.userEmail?.toLowerCase().includes(q)
            );
        }
        setFiltered(result);
    }, [reviews, statusFilter, ratingFilter, categoryFilter, searchQuery]);

    // ── Toast ──────────────────────────────────────────────────────────────────
    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    // ── Actions ────────────────────────────────────────────────────────────────
    const handleDelete = () => {
        setReviews(prev => prev.filter(r => r._id !== deleteModal._id));
        setDeleteModal(null);
        showToast('Review deleted successfully.');
    };

    const handleStatusChange = (id, newStatus) => {
        setReviews(prev => prev.map(r => r._id === id ? { ...r, status: newStatus } : r));
        showToast(`Status updated to "${newStatus}".`);
    };

    // ── Stats ──────────────────────────────────────────────────────────────────
    const avgRating = reviews.length
        ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
        : '0.0';
    const flaggedCount = reviews.filter(r => r.status === 'flagged').length;
    const publishedCount = reviews.filter(r => r.status === 'published').length;
    const fiveStarCount = reviews.filter(r => r.rating === 5).length;

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Inter','Segoe UI',sans-serif" }}>

            {/* Top Bar */}
            <div style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button
                        onClick={() => navigate('/admin-dashboard')}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.9rem', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#f9fafb', color: '#374151', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                        Back
                    </button>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: '#111827' }}>Reviews & Feedback</h1>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#9ca3af' }}>Monitor and manage all user reviews</p>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 1rem', borderRadius: '999px', background: 'linear-gradient(135deg,#db2777,#9333ea)', color: 'white', fontSize: '0.78rem', fontWeight: 700 }}>
                    <svg width="13" height="13" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                    Admin · Feedback Panel
                </div>
            </div>

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>

                {/* Stats Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
                    {[
                        { label: 'Avg. Rating', value: avgRating, icon: '⭐', color: '#f59e0b', bg: '#fffbeb' },
                        { label: 'Published', value: publishedCount, icon: '✅', color: '#10b981', bg: '#f0fdf4' },
                        { label: 'Flagged', value: flaggedCount, icon: '🚩', color: '#ef4444', bg: '#fef2f2' },
                        { label: '5-Star Reviews', value: fiveStarCount, icon: '🌟', color: '#8b5cf6', bg: '#f5f3ff' },
                    ].map(card => (
                        <div key={card.label} style={{ background: 'white', borderRadius: '16px', padding: '1.25rem 1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: `1px solid ${card.bg}`, display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>{card.icon}</div>
                            <div>
                                <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{card.label}</p>
                                <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: '#111827' }}>{card.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div style={{ background: 'white', borderRadius: '14px', padding: '1rem 1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.07)', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
                    {/* Search */}
                    <div style={{ position: 'relative', flex: '1', minWidth: '220px' }}>
                        <svg style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#9ca3af" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
                        <input
                            type="text"
                            placeholder="Search by name, email or comment..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            style={{ width: '100%', paddingLeft: '34px', paddingRight: '12px', paddingTop: '8px', paddingBottom: '8px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
                        />
                    </div>
                    {/* Status */}
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '0.85rem', color: '#374151', outline: 'none' }}>
                        <option value="all">All Statuses</option>
                        <option value="published">Published</option>
                        <option value="pending">Pending</option>
                        <option value="hidden">Hidden</option>
                        <option value="flagged">Flagged</option>
                    </select>
                    {/* Rating */}
                    <select value={ratingFilter} onChange={e => setRatingFilter(e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '0.85rem', color: '#374151', outline: 'none' }}>
                        <option value="all">All Ratings</option>
                        {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{r} Star{r !== 1 ? 's' : ''}</option>)}
                    </select>
                    {/* Category */}
                    <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '0.85rem', color: '#374151', outline: 'none' }}>
                        <option value="all">All Categories</option>
                        <option value="Equipment">Equipment</option>
                        <option value="Guide">Guide</option>
                        <option value="Campsite">Campsite</option>
                        <option value="General">General</option>
                    </select>
                </div>

                {/* Table */}
                <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                    <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#111827' }}>All Reviews</h2>
                        <span style={{ fontSize: '0.82rem', color: '#9ca3af' }}>{filtered.length} record{filtered.length !== 1 ? 's' : ''}</span>
                    </div>

                    {filtered.length === 0 ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📭</div>
                            <p style={{ margin: 0, fontWeight: 600 }}>No reviews found</p>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                <thead>
                                    <tr style={{ background: '#f9fafb' }}>
                                        {['User', 'Category', 'Rating', 'Comment', 'Date', 'Status', 'Actions'].map(h => (
                                            <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap', borderBottom: '1px solid #f3f4f6' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((review, idx) => (
                                        <tr key={review._id} style={{ borderBottom: idx < filtered.length - 1 ? '1px solid #f9fafb' : 'none', transition: 'background 0.15s' }}
                                            onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                        >
                                            {/* User */}
                                            <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,#db2777,#9333ea)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.75rem', flexShrink: 0 }}>
                                                        {review.userName?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p style={{ margin: 0, fontWeight: 600, color: '#111827' }}>{review.userName}</p>
                                                        <p style={{ margin: 0, fontSize: '0.72rem', color: '#9ca3af' }}>{review.userEmail}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            {/* Category */}
                                            <td style={{ padding: '0.85rem 1rem' }}>
                                                <span style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 600, background: '#eff6ff', color: '#1d4ed8' }}>{review.category}</span>
                                            </td>
                                            {/* Rating */}
                                            <td style={{ padding: '0.85rem 1rem' }}>
                                                <StarRating rating={review.rating} />
                                            </td>
                                            {/* Comment */}
                                            <td style={{ padding: '0.85rem 1rem', maxWidth: '280px' }}>
                                                <p style={{ margin: 0, color: '#374151', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{review.comment}</p>
                                            </td>
                                            {/* Date */}
                                            <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap', color: '#6b7280' }}>{formatDate(review.createdAt)}</td>
                                            {/* Status */}
                                            <td style={{ padding: '0.85rem 1rem' }}>
                                                <StatusBadge status={review.status} />
                                            </td>
                                            {/* Actions */}
                                            <td style={{ padding: '0.85rem 1rem' }}>
                                                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                                                    {/* Publish */}
                                                    <button
                                                        title="Publish"
                                                        onClick={() => handleStatusChange(review._id, 'published')}
                                                        style={{ padding: '5px', borderRadius: '7px', border: 'none', background: '#f0fdf4', color: '#16a34a', cursor: 'pointer' }}
                                                    >
                                                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                                    </button>
                                                    {/* Flag */}
                                                    <button
                                                        title="Flag"
                                                        onClick={() => handleStatusChange(review._id, 'flagged')}
                                                        style={{ padding: '5px', borderRadius: '7px', border: 'none', background: '#fff7ed', color: '#ea580c', cursor: 'pointer' }}
                                                    >
                                                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6H10.75L9.5 15H5a2 2 0 00-2 2z" /></svg>
                                                    </button>
                                                    {/* Hide */}
                                                    <button
                                                        title="Hide"
                                                        onClick={() => handleStatusChange(review._id, 'hidden')}
                                                        style={{ padding: '5px', borderRadius: '7px', border: 'none', background: '#f3f4f6', color: '#6b7280', cursor: 'pointer' }}
                                                    >
                                                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                                    </button>
                                                    {/* Delete */}
                                                    <button
                                                        title="Delete"
                                                        onClick={() => setDeleteModal(review)}
                                                        style={{ padding: '5px', borderRadius: '7px', border: 'none', background: '#fef2f2', color: '#dc2626', cursor: 'pointer' }}
                                                    >
                                                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Modal */}
            <ConfirmModal
                open={!!deleteModal}
                title="Delete Review"
                message={`Permanently delete this review by "${deleteModal?.userName}"? This action cannot be undone.`}
                onConfirm={handleDelete}
                onCancel={() => setDeleteModal(null)}
            />

            {/* Toast */}
            {toast && (
                <div style={{
                    position: 'fixed', bottom: '1.5rem', right: '1.5rem',
                    padding: '0.75rem 1.25rem', borderRadius: '12px',
                    background: toast.type === 'error' ? '#dc2626' : 'linear-gradient(135deg,#db2777,#9333ea)',
                    color: 'white', fontWeight: 600, fontSize: '0.85rem',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.2)', zIndex: 200,
                    display: 'flex', alignItems: 'center', gap: '0.5rem'
                }}>
                    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    {toast.msg}
                </div>
            )}
        </div>
    );
};

export default FeedbckAndReviewManagement;
