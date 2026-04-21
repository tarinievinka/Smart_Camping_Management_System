import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ROLE_COLORS = {
    admin:          { bg: 'rgba(220,38,38,0.1)',   color: '#dc2626', border: 'rgba(220,38,38,0.3)' },
    camper:         { bg: 'rgba(16,161,16,0.1)',   color: '#10a110', border: 'rgba(16,161,16,0.3)' },
    guide:          { bg: 'rgba(245,158,11,0.1)',  color: '#d97706', border: 'rgba(245,158,11,0.3)' },
    campsite_owner: { bg: 'rgba(59,130,246,0.1)',  color: '#2563eb', border: 'rgba(59,130,246,0.3)' },
};

const DeleteUsers = () => {
    const navigate = useNavigate();
    const [users, setUsers]         = useState([]);
    const [loading, setLoading]     = useState(true);
    const [error, setError]         = useState('');
    const [deletingId, setDeletingId] = useState(null);
    const [successMsg, setSuccessMsg] = useState('');
    const [search, setSearch]       = useState('');
    const [confirmId, setConfirmId] = useState(null); // ID waiting for confirm

    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const token = userInfo.token;
    const me = userInfo;

    // Redirect if not admin
    useEffect(() => {
        if (!token || me.role !== 'admin') { navigate('/login'); }
    }, [navigate, token, me.role]);

    // Load users
    const fetchUsers = () => {
        setLoading(true);
        setError('');
        fetch('http://localhost:5000/api', {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((r) => r.json())
            .then((data) => {
                if (Array.isArray(data)) setUsers(data);
                else setError(data.error || 'Failed to load users');
            })
            .catch(() => setError('Network error. Please try again.'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchUsers(); }, []); // eslint-disable-line

    // Delete user
    const handleDelete = async (id) => {
        setDeletingId(id);
        setSuccessMsg('');
        try {
            const res = await fetch(`http://localhost:5000/api/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok) {
                setUsers((prev) => prev.filter((u) => u._id !== id));
                setSuccessMsg('User deleted successfully.');
                setTimeout(() => setSuccessMsg(''), 3000);
            } else {
                setError(data.error || 'Delete failed.');
            }
        } catch {
            setError('Network error.');
        } finally {
            setDeletingId(null);
            setConfirmId(null);
        }
    };

    const filtered = users.filter(
        (u) =>
            u.name?.toLowerCase().includes(search.toLowerCase()) ||
            u.email?.toLowerCase().includes(search.toLowerCase()) ||
            u.role?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div style={s.page}>
            <div style={s.bgImage} />
            <div style={s.bgOverlay} />

            {/* Header */}
            <header style={s.header}>
                <div style={s.logo} onClick={() => navigate('/')}>
                    <div style={s.logoIcon}>
                        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="white">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                    </div>
                    <span style={s.logoText}>Smart Camping</span>
                </div>
                <button style={s.backBtn} onClick={() => navigate('/admin-dashboard')}>
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Dashboard
                </button>
            </header>

            <main style={s.main}>
                {/* Page title */}
                <div style={s.titleRow}>
                    <div>
                        <h2 style={s.pageTitle}>Manage Users</h2>
                        <p style={s.pageSubtitle}>
                            {loading ? 'Loading...' : `${filtered.length} user${filtered.length !== 1 ? 's' : ''} found`}
                        </p>
                    </div>
                    <button style={s.refreshBtn} onClick={fetchUsers}>
                        <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh
                    </button>
                </div>

                {/* Search */}
                <div style={s.searchWrap}>
                    <svg style={s.searchIcon} width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="#9ca3af">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        style={s.searchInput}
                        type="text"
                        placeholder="Search by name, email or role..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* Alerts */}
                {error    && <div style={s.errorBanner}>{error}</div>}
                {successMsg && <div style={s.successBanner}>{successMsg}</div>}

                {/* User list */}
                {loading ? (
                    <div style={s.centerWrap}>
                        <div style={s.spinner} />
                        <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: '1rem' }}>Loading users...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div style={s.emptyWrap}>
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1rem' }}>No users found.</p>
                    </div>
                ) : (
                    <div style={s.list}>
                        {filtered.map((u) => {
                            const roleStyle = ROLE_COLORS[u.role] || ROLE_COLORS.camper;
                            const isSelf    = u._id === me._id;
                            const isConfirm = confirmId === u._id;

                            return (
                                <div key={u._id} style={s.userCard}>
                                    {/* Avatar */}
                                    <div style={s.userAvatar}>
                                        {(u.name || 'U').slice(0, 2).toUpperCase()}
                                    </div>

                                    {/* Info */}
                                    <div style={s.userInfo}>
                                        <div style={s.userNameRow}>
                                            <span style={s.uName}>{u.name}</span>
                                            {isSelf && <span style={s.youBadge}>You</span>}
                                            <span style={{
                                                ...s.rolePill,
                                                background: roleStyle.bg,
                                                color: roleStyle.color,
                                                border: `1px solid ${roleStyle.border}`,
                                            }}>
                                                {u.role?.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <p style={s.uEmail}>{u.email}</p>
                                        <p style={s.uMeta}>
                                            ID: {u.userId || u._id?.slice(-8)} &nbsp;·&nbsp;
                                            {u.isActive ? '🟢 Active' : '🔴 Inactive'}
                                        </p>
                                    </div>

                                    {/* Delete controls */}
                                    <div style={s.deleteWrap}>
                                        {isSelf ? (
                                            <span style={s.selfNote}>Cannot delete yourself</span>
                                        ) : isConfirm ? (
                                            <div style={s.confirmRow}>
                                                <span style={s.confirmText}>Sure?</span>
                                                <button
                                                    style={s.confirmYes}
                                                    disabled={deletingId === u._id}
                                                    onClick={() => handleDelete(u._id)}
                                                >
                                                    {deletingId === u._id ? '...' : 'Yes'}
                                                </button>
                                                <button style={s.confirmNo} onClick={() => setConfirmId(null)}>No</button>
                                            </div>
                                        ) : (
                                            <button style={s.deleteCardBtn} onClick={() => setConfirmId(u._id)}>
                                                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
};

const s = {
    page: { minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Inter','Segoe UI',sans-serif", position: 'relative' },
    bgImage: { position: 'fixed', inset: 0, backgroundImage: "url('https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?auto=format&fit=crop&q=80&w=2000')", backgroundSize: 'cover', backgroundPosition: 'center', zIndex: 0 },
    bgOverlay: { position: 'fixed', inset: 0, background: 'linear-gradient(135deg,rgba(0,0,0,0.65) 0%,rgba(15,0,30,0.7) 100%)', backdropFilter: 'blur(3px)', zIndex: 1 },
    header: { position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem 2rem' },
    logo: { display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' },
    logoIcon: { width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg,#22c55e,#10a110)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(34,197,94,0.4)' },
    logoText: { color: 'white', fontWeight: 800, fontSize: '1.4rem', letterSpacing: '-0.03em', textShadow: '0 2px 8px rgba(0,0,0,0.3)' },
    backBtn: { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', color: 'white', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' },
    main: { flex: 1, position: 'relative', zIndex: 10, padding: '0 2rem 3rem', maxWidth: '760px', margin: '0 auto', width: '100%', boxSizing: 'border-box' },
    titleRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' },
    pageTitle: { fontSize: '1.6rem', fontWeight: 800, color: 'white', margin: '0 0 0.2rem', letterSpacing: '-0.03em' },
    pageSubtitle: { fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', margin: 0 },
    refreshBtn: { display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: '9px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)', color: 'white', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },
    searchWrap: { position: 'relative', marginBottom: '1rem' },
    searchIcon: { position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' },
    searchInput: { width: '100%', boxSizing: 'border-box', paddingLeft: '42px', paddingRight: '14px', paddingTop: '11px', paddingBottom: '11px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', color: 'white', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit' },
    errorBanner: { padding: '0.75rem 1rem', borderRadius: '10px', background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.35)', color: '#fca5a5', fontSize: '0.85rem', marginBottom: '1rem' },
    successBanner: { padding: '0.75rem 1rem', borderRadius: '10px', background: 'rgba(16,161,16,0.15)', border: '1px solid rgba(16,161,16,0.35)', color: '#86efac', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem' },
    centerWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '4rem' },
    spinner: { width: '40px', height: '40px', border: '3px solid rgba(220,38,38,0.2)', borderTopColor: '#dc2626', borderRadius: '50%' },
    emptyWrap: { textAlign: 'center', paddingTop: '4rem' },
    list: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
    userCard: { display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.1rem 1.25rem', borderRadius: '16px', background: 'rgba(255,255,255,0.95)', boxShadow: '0 4px 16px rgba(0,0,0,0.15)', backdropFilter: 'blur(8px)' },
    userAvatar: { flexShrink: 0, width: '46px', height: '46px', borderRadius: '12px', background: 'linear-gradient(135deg,#374151,#111827)', color: 'white', fontWeight: 800, fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    userInfo: { flex: 1, minWidth: 0 },
    userNameRow: { display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.2rem' },
    uName: { fontWeight: 700, fontSize: '0.95rem', color: '#111827' },
    youBadge: { padding: '0.1rem 0.5rem', borderRadius: '999px', background: '#dbeafe', color: '#1d4ed8', fontSize: '0.68rem', fontWeight: 700 },
    rolePill: { padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700, textTransform: 'capitalize' },
    uEmail: { fontSize: '0.8rem', color: '#6b7280', margin: '0 0 0.2rem' },
    uMeta: { fontSize: '0.75rem', color: '#9ca3af', margin: 0 },
    deleteWrap: { flexShrink: 0 },
    selfNote: { fontSize: '0.72rem', color: '#9ca3af', fontStyle: 'italic' },
    deleteCardBtn: { display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: '10px', background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.25)', color: '#dc2626', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit' },
    confirmRow: { display: 'flex', alignItems: 'center', gap: '0.4rem' },
    confirmText: { fontSize: '0.8rem', fontWeight: 700, color: '#dc2626' },
    confirmYes: { padding: '0.35rem 0.75rem', borderRadius: '8px', background: '#dc2626', border: 'none', color: 'white', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit' },
    confirmNo: { padding: '0.35rem 0.75rem', borderRadius: '8px', background: '#f3f4f6', border: 'none', color: '#374151', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit' },
};

export default DeleteUsers;
