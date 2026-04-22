import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ users: '--', campsites: '--', guides: '--', bookings: '--' });
    const [deactivateMsg, setDeactivateMsg] = useState('');
    const [deactivateError, setDeactivateError] = useState('');

    useEffect(() => {
        const stored = localStorage.getItem('userInfo');

        if (!stored) { navigate('/login'); return; }

        const userInfo = JSON.parse(stored);
        const token = userInfo.token;
        if (!token || userInfo.role !== 'admin') { navigate('/login'); return; }

        setUser(userInfo);
        setLoading(false);

        // Refresh profile from backend
        fetch('http://localhost:5000/api/profile', {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((r) => r.json())
            .then((fresh) => {
                if (fresh && !fresh.error) {
                    const latestUserInfo = { ...userInfo, ...fresh };
                    setUser(latestUserInfo);
                    localStorage.setItem('userInfo', JSON.stringify(latestUserInfo));
                }
            })
            .catch(() => { });

        // Fetch user count for stats
        fetch('http://localhost:5000/api', {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((r) => r.json())
            .then((data) => {
                if (Array.isArray(data)) {
                    const guides = data.filter(u => u.role === 'guide').length;
                    const owners = data.filter(u => u.role === 'campsite_owner').length;
                    setStats(prev => ({
                        ...prev,
                        users: data.length,
                        guides,
                        campsites: owners,
                    }));
                }
            })
            .catch(() => { });
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        navigate('/login');
    };

    const handleDeactivate = async () => {
        if (!window.confirm('Are you sure you want to deactivate your admin account?')) return;

        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        const token = userInfo.token;
        try {
            const targetId = user?._id || user?.id; // Attempt to use _id or id
            const res = await fetch(`http://localhost:5000/api/${targetId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ isActive: false })
            });

            if (res.ok) {
                setDeactivateMsg('Deactivated successfully');
                const updatedUser = { ...user, isActive: false };
                setUser(updatedUser);
                localStorage.setItem('userInfo', JSON.stringify(updatedUser));
                setTimeout(() => setDeactivateMsg(''), 3000);
            } else {
                const data = await res.json();
                setDeactivateError(data.error || 'Failed to deactivate.');
                setTimeout(() => setDeactivateError(''), 3000);
            }
        } catch (err) {
            setDeactivateError('Network error');
            setTimeout(() => setDeactivateError(''), 3000);
        }
    };

    const formatDate = (d) =>
        d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';

    const getInitials = (name) =>
        name ? name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) : 'AD';

    if (loading) {
        return (
            <div style={s.loadingWrap}>
                <div style={s.spinnerWrap}>
                    <div style={s.spinner} />
                </div>
                <p style={s.loadingText}>Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div style={s.page}>
            {/* Background */}
            <div style={s.bgImage} />
            <div style={s.bgOverlay} />

            {/* Header */}
            <header style={s.header}>
                <div style={{ flex: 1 }} />
                <div style={s.headerRight}>
                    <div style={s.adminChip}>
                        <div style={s.adminDot} />
                        Admin Panel
                    </div>
                </div>
            </header>

            <main style={s.main}>
                {/* Welcome Banner */}
                <div style={s.welcomeBanner}>
                    <div style={s.avatarRing}>
                        <div style={s.avatar}>{getInitials(user?.name)}</div>
                    </div>
                    <div style={s.welcomeText}>
                        <div style={s.adminBadge}>
                            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            Administrator
                        </div>
                        <h1 style={s.welcomeTitle}>Welcome back, {user?.name?.split(' ')[0]}!</h1>
                        <p style={s.welcomeSub}>Member since {formatDate(user?.createdAt)} · Full system access</p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div style={s.statsGrid}>
                    <StatCard
                        icon={
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                        }
                        label="Total Users"
                        value={stats.users}
                        color="#10a110"
                        glow="rgba(16,161,16,0.3)"
                    />
                    <StatCard
                        icon={
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M2 20s1-8 10-8 10 8 10 8"></path>
                                <path d="m12 12-8 8"></path>
                                <path d="m12 12 8 8"></path>
                                <circle cx="12" cy="7" r="5"></circle>
                            </svg>
                        }
                        label="Campsite Owners"
                        value={stats.campsites}
                        color="#3b82f6"
                        glow="rgba(59,130,246,0.3)"
                    />
                    <StatCard
                        icon={
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
                            </svg>
                        }
                        label="Guides"
                        value={stats.guides}
                        color="#f59e0b"
                        glow="rgba(245,158,11,0.3)"
                    />

                </div>

                {/* Content Row */}
                <div style={s.contentRow}>
                    {/* Admin Info */}
                    <div style={s.infoCard}>
                        {deactivateMsg && <div style={{ marginBottom: '1rem', padding: '0.75rem', borderRadius: '8px', backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0', fontSize: '0.85rem', fontWeight: 600 }}>{deactivateMsg}</div>}
                        {deactivateError && <div style={{ marginBottom: '1rem', padding: '0.75rem', borderRadius: '8px', backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca', fontSize: '0.85rem', fontWeight: 600 }}>{deactivateError}</div>}
                        <div style={s.cardHeader}>
                            <span style={s.cardHeaderIcon}>🪪</span>
                            <h3 style={s.cardTitle}>Account Details</h3>
                        </div>
                        <div style={s.infoList}>
                            <InfoRow label="Email" value={user?.email || '—'} icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"></path><path d="M22 2 11 13"></path></svg>} bg="#eff6ff" />
                            <InfoRow label="Phone" value={user?.phone || 'Not provided'} icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l2.28-2.28a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>} bg="#f0fdf4" />
                            <InfoRow
                                label="Status"
                                value={user?.isActive ? 'Active ✓' : 'Inactive'}
                                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>}
                                valueColor={user?.isActive ? '#10a110' : '#ef4444'}
                                bg={user?.isActive ? '#f0fdf4' : '#fef2f2'}
                            />
                            <InfoRow label="User ID" value={user?.userId || '—'} icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3L15.5 7.5z"></path></svg>} mono bg="#f8fafc" />
                        </div>

                        {/* Account Actions */}
                        <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <ActionButton
                                icon={
                                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                }
                                label="Update Details"
                                sub="Update your admin account info"
                                bg="linear-gradient(135deg,#374151,#1f2937)"
                                glow="rgba(55,65,81,0.4)"
                                onClick={() => navigate('/edit-profile')}
                            />
                            <ActionButton
                                icon={
                                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                    </svg>
                                }
                                label="Deactivate Admin"
                                sub="Suspend or deactivate admin account"
                                bg="linear-gradient(135deg,#991b1b,#7f1d1d)"
                                glow="rgba(153,27,27,0.35)"
                                onClick={handleDeactivate}
                            />
                        </div>
                    </div>

                    {/* Actions Card without Header */}
                    <div style={s.actionsCard}>
                        <div style={s.actionsList}>
                            <ActionButton
                                icon={
                                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                                        <circle cx="12" cy="10" r="3" />
                                    </svg>
                                }
                                label="Campsite Management"
                                sub="Manage campsite listings and owners"
                                bg="linear-gradient(135deg,#0d9488,#0f766e)"
                                glow="rgba(13,148,136,0.35)"
                                onClick={() => navigate('/campsites-admin')}
                            />
                            <ActionButton
                                icon={
                                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                    </svg>
                                }
                                label="Equipment Management"
                                sub="Manage camping equipment inventory"
                                bg="linear-gradient(135deg,#2563eb,#1d4ed8)"
                                glow="rgba(37,99,235,0.35)"
                                onClick={() => navigate('/equipment-dashboard')}
                            />
                            <ActionButton
                                icon={
                                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                        <circle cx="9" cy="7" r="4" />
                                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                    </svg>
                                }
                                label="Guide Management"
                                sub="Oversee guides and assignments"
                                bg="linear-gradient(135deg,#f59e0b,#d97706)"
                                glow="rgba(245,158,11,0.35)"
                                onClick={() => navigate('/guides/dashboard')}
                            />
                            <ActionButton
                                icon={
                                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="12" y1="1" x2="12" y2="23"></line>
                                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                                    </svg>
                                }
                                label="Payment Management"
                                sub="Review transactions and payouts"
                                bg="linear-gradient(135deg,#10b981,#059669)"
                                glow="rgba(16,185,129,0.35)"
                                onClick={() => navigate('/admin/payments')}
                            />
                            <ActionButton
                                icon={
                                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                    </svg>
                                }
                                label="Reviews & Feedback"
                                sub="Manage user reviews and feedback"
                                bg="linear-gradient(135deg,#db2777,#9333ea)"
                                glow="rgba(219,39,119,0.35)"
                                onClick={() => navigate('/admin/feedback')}
                            />
                        </div>

                        {/* System status badge */}
                        <div style={s.statusBadge}>
                            <div style={s.statusDot} />
                            <span style={s.statusText}>All systems operational</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

/* ── Sub-components ── */

const StatCard = ({ icon, label, value, color, glow }) => (
    <div style={{ ...s.statCard, borderLeft: `4px solid ${color}` }}>
        <div style={{ ...s.statIconWrap, background: `${color}10`, color }}>
            {icon}
        </div>
        <div style={s.statContent}>
            <p style={s.statLabel}>{label}</p>
            <p style={s.statValue}>{value}</p>
        </div>
    </div>
);

const InfoRow = ({ icon, label, value, valueColor, mono, bg }) => (
    <div style={{ ...s.infoRow, background: bg || '#f9fafb' }}>
        <span style={s.infoRowIcon}>{icon}</span>
        <div style={s.infoRowContent}>
            <span style={s.infoRowLabel}>{label}</span>
            <span style={{
                ...s.infoRowValue,
                ...(valueColor ? { color: valueColor, fontWeight: 700 } : {}),
                ...(mono ? { fontFamily: 'monospace', fontSize: '0.8rem' } : {}),
            }}>
                {value}
            </span>
        </div>
    </div>
);

const ActionButton = ({ icon, label, sub, bg, glow, onClick }) => (
    <button style={{ ...s.actionBtn, background: bg, boxShadow: `0 4px 18px ${glow}` }} onClick={onClick}>
        <div style={s.actionBtnIcon}>{icon}</div>
        <div style={s.actionBtnText}>
            <span style={s.actionBtnLabel}>{label}</span>
            <span style={s.actionBtnSub}>{sub}</span>
        </div>
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.6)">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
    </button>
);

/* ── Styles ── */

const s = {
    /* Page */
    page: { minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Inter','Segoe UI',sans-serif", position: 'relative', overflow: 'hidden' },
    bgImage: { position: 'fixed', inset: 0, backgroundImage: "url('/images/admin%20dash.jpg')", backgroundSize: 'cover', backgroundPosition: 'center', zIndex: 0 },
    bgOverlay: { position: 'fixed', inset: 0, background: 'linear-gradient(135deg,rgba(0,0,0,0.65) 0%,rgba(5,10,25,0.75) 100%)', backdropFilter: 'blur(3px)', zIndex: 1 },

    /* Header */
    header: { position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.4rem 2.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', background: 'rgba(0,0,0,0.2)' },
    logo: { display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' },
    logoIcon: { width: '46px', height: '46px', borderRadius: '13px', background: 'linear-gradient(135deg,#22c55e,#10a110)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(34,197,94,0.4)' },
    logoText: { color: 'white', fontWeight: 800, fontSize: '1.35rem', letterSpacing: '-0.03em', textShadow: '0 2px 8px rgba(0,0,0,0.3)' },
    headerRight: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
    adminChip: { display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.4rem 1rem', borderRadius: '999px', border: '1px solid rgba(220,38,38,0.4)', background: 'rgba(220,38,38,0.12)', color: '#fca5a5', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.04em' },
    adminDot: { width: '7px', height: '7px', borderRadius: '50%', background: '#dc2626', boxShadow: '0 0 6px #dc2626', animation: 'pulse 2s infinite' },
    logoutBtn: { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.55rem 1.1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)', color: 'white', fontWeight: 600, fontSize: '0.83rem', cursor: 'pointer' },

    /* Main */
    main: { flex: 1, position: 'relative', zIndex: 10, padding: '2rem 2.5rem 3rem', maxWidth: '1100px', margin: '0 auto', width: '100%', boxSizing: 'border-box' },

    /* Welcome Banner */
    welcomeBanner: { display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', padding: '1.75rem 2rem', borderRadius: '20px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)' },
    avatarRing: { padding: '3px', borderRadius: '50%', background: 'linear-gradient(135deg,#dc2626,#7f1d1d)', boxShadow: '0 0 25px rgba(220,38,38,0.5)', flexShrink: 0 },
    avatar: { width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg,#7f1d1d,#450a0a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', fontWeight: 800, color: 'white', border: '3px solid white' },
    welcomeText: { flex: 1 },
    adminBadge: { display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.28rem 0.8rem', borderRadius: '999px', background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.4)', color: '#fca5a5', fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.45rem' },
    welcomeTitle: { fontSize: '1.85rem', fontWeight: 800, color: 'white', margin: '0 0 0.3rem', letterSpacing: '-0.03em' },
    welcomeSub: { fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', margin: 0 },

    /* Stats */
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginBottom: '2.5rem' },
    statCard: {
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        padding: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1.25rem',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        transition: 'transform 0.2s ease'
    },
    statIconWrap: {
        width: '52px',
        height: '52px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
    },
    statContent: { display: 'flex', flexDirection: 'column', gap: '2px' },
    statLabel: { fontSize: '0.65rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 },
    statValue: { fontSize: '1.8rem', fontWeight: 800, color: '#1e293b', margin: 0, letterSpacing: '-0.02em' },

    /* Content Row */
    contentRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },

    /* Shared Card */
    infoCard: { background: 'rgba(255,255,255,0.97)', borderRadius: '20px', padding: '1.5rem 1.75rem', boxShadow: '0 8px 24px rgba(0,0,0,0.18)' },
    actionsCard: { background: 'rgba(255,255,255,0.97)', borderRadius: '20px', padding: '1.5rem 1.75rem', boxShadow: '0 8px 24px rgba(0,0,0,0.18)', display: 'flex', flexDirection: 'column' },
    cardHeader: { display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.1rem', paddingBottom: '0.75rem', borderBottom: '1px solid #f3f4f6' },
    cardHeaderIcon: { fontSize: '1.1rem' },
    cardTitle: { fontSize: '0.85rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 },

    /* Info Rows */
    infoList: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
    infoRow: { display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem', borderRadius: '14px', border: '1px solid rgba(0,0,0,0.03)' },
    infoRowIcon: { fontSize: '1rem', flexShrink: 0 },
    infoRowContent: { display: 'flex', flexDirection: 'column', minWidth: 0 },
    infoRowLabel: { fontSize: '0.66rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.15rem' },
    infoRowValue: { fontSize: '0.87rem', fontWeight: 600, color: '#1f2937', wordBreak: 'break-all', margin: 0 },

    /* Action Buttons */
    actionsList: { display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1, maxHeight: '420px', overflowY: 'auto', paddingRight: '0.4rem' },
    actionBtn: { display: 'flex', alignItems: 'center', gap: '0.9rem', padding: '1rem 1.2rem', borderRadius: '14px', border: 'none', color: 'white', cursor: 'pointer', textAlign: 'left', width: '100%', fontFamily: 'inherit', transition: 'transform 0.15s, box-shadow 0.15s' },
    actionBtnIcon: { flexShrink: 0, width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    actionBtnText: { flex: 1, display: 'flex', flexDirection: 'column', gap: '0.15rem' },
    actionBtnLabel: { fontSize: '0.88rem', fontWeight: 700 },
    actionBtnSub: { fontSize: '0.72rem', color: 'rgba(255,255,255,0.65)' },

    /* Status Badge */
    statusBadge: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', padding: '0.5rem 0.9rem', borderRadius: '10px', background: 'rgba(16,161,16,0.08)', border: '1px solid rgba(16,161,16,0.2)' },
    statusDot: { width: '8px', height: '8px', borderRadius: '50%', background: '#10a110', boxShadow: '0 0 6px rgba(16,161,16,0.8)' },
    statusText: { fontSize: '0.75rem', fontWeight: 600, color: '#10a110' },

    /* Loading */
    loadingWrap: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#0f0a1a,#050a19)' },
    spinnerWrap: { marginBottom: '1rem' },
    spinner: { width: '44px', height: '44px', border: '3px solid rgba(220,38,38,0.2)', borderTopColor: '#dc2626', borderRadius: '50%' },
    loadingText: { color: 'rgba(255,255,255,0.4)', fontFamily: "'Inter',sans-serif", fontSize: '0.9rem' },
};

export default AdminDashboard;
