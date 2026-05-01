import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { validatePhone } from '../../../utils/validation';
import { useAuth } from '../../../context/AuthContext';

const EditProfile = () => {
    const navigate = useNavigate();
    const { setUser: setAuthUser } = useAuth();

    const [form, setForm] = useState({ name: '', email: '', phone: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [isDeleted, setIsDeleted] = useState(false);
    const [userRole, setUserRole] = useState(null);

    // Pre-fill from localStorage
    useEffect(() => {
        const stored = localStorage.getItem('userInfo');
        if (!stored) { navigate('/login'); return; }
        const userInfo = JSON.parse(stored);
        if (!userInfo.token) { navigate('/login'); return; }
        setUserRole(userInfo.role);
        setForm({ name: userInfo.name || '', email: userInfo.email || '', phone: userInfo.phone || '' });

    }, [navigate]);

    const handleChange = (e) =>
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        const token = userInfo.token;

        const updateData = { name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim() };
        
        if (form.phone && !validatePhone(form.phone)) {
            setError('Phone number must be exactly 10 digits.');
            setIsLoading(false);
            return;
        }



        try {
            const res = await fetch('http://localhost:5000/api/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(updateData),
            });

            const data = await res.json();

            if (res.ok) {
                const currentUser = JSON.parse(localStorage.getItem('userInfo') || '{}');
                const updatedUser = { ...currentUser, ...data };
                localStorage.setItem('userInfo', JSON.stringify(updatedUser));
                setAuthUser(updatedUser); // Update AuthContext state
                setUserRole(updatedUser.role);
                setSuccess('Profile updated successfully! ✓');
                const isOwner = ['owner', 'campsite_owner', 'campsite-owner'].includes(updatedUser.role);
                const isGuide = updatedUser.role === 'guide';
                const dashboardPath = updatedUser.role === 'admin' ? '/admin-dashboard' : 
                                     (isOwner ? '/owner-profile' : 
                                     (isGuide ? '/guides/owndashboard' : '/camper-dashboard'));
                setTimeout(() => navigate(dashboardPath), 1500);
            } else {
                setError(data.error || 'Update failed. Please try again.');
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm('Are you sure you want to delete your account? This action is permanent and cannot be undone.')) {
            return;
        }

        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        const token = userInfo.token;

        try {
            const res = await fetch('http://localhost:5000/api/profile', {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.ok) {
                setIsDeleted(true);
                localStorage.removeItem('userInfo');
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to delete account.');
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={styles.page}>
            {/* Background */}
            <div style={styles.bgImage} />
            <div style={styles.bgOverlay} />

            {/* Header */}
            <header style={styles.header}>
                <div style={styles.logo} onClick={() => navigate('/')} title="Home">
                    <div style={styles.logoIcon}>
                        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="white">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                    </div>
                    <span style={styles.logoText}>Smart Camping</span>
                </div>

                <button style={styles.backBtn} onClick={() => {
                    const isOwner = ['owner', 'campsite_owner', 'campsite-owner'].includes(userRole);
                    const isGuide = userRole === 'guide';
                    const dashboardPath = userRole === 'admin' ? '/admin-dashboard' : 
                                         (isOwner ? '/owner-profile' : 
                                         (isGuide ? '/guides/owndashboard' : '/camper-dashboard'));
                    navigate(dashboardPath);
                }}>
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Dashboard
                </button>
            </header>

            {/* Main */}
            <main style={styles.main}>
                <div style={styles.card}>
                    {/* Card Header */}
                    <div style={styles.cardHeader}>
                        <div style={styles.editIcon}>
                            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="white">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </div>
                        <h2 style={styles.cardTitle}>Edit Profile</h2>
                        <p style={styles.cardSubtitle}>Update your name and email address</p>
                    </div>

                    {/* Alerts */}
                    {error && <div style={styles.errorAlert}>{error}</div>}
                    {success && <div style={styles.successAlert}>{success}</div>}

                    <form onSubmit={handleSubmit} style={styles.form}>
                        {/* Full Name */}
                        <div style={styles.field}>
                            <label style={styles.label}>Full Name</label>
                            <div style={styles.inputWrapper}>
                                <span style={styles.inputIcon}>
                                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#10a110">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </span>
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="Your full name"
                                    required
                                    style={styles.input}
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div style={styles.field}>
                            <label style={styles.label}>Email Address</label>
                            <div style={styles.inputWrapper}>
                                <span style={styles.inputIcon}>
                                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#10a110">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </span>
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="name@example.com"
                                    required
                                    style={styles.input}
                                />
                            </div>
                        </div>

                        {/* Phone */}
                        <div style={styles.field}>
                            <label style={styles.label}>Phone Number</label>
                            <div style={styles.inputWrapper}>
                                <span style={styles.inputIcon}>
                                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#10a110">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                </span>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={form.phone}
                                    onChange={handleChange}
                                    placeholder="+92 300 0000000"
                                    style={styles.input}
                                />
                            </div>
                        </div>



                        {/* Buttons */}
                        <div style={styles.btnRow}>
                            <button
                                type="button"
                                style={styles.cancelBtn}
                                onClick={() => {
                                    const isOwner = ['owner', 'campsite_owner', 'campsite-owner'].includes(userRole);
                                    navigate(userRole === 'admin' ? '/admin-dashboard' : (isOwner ? '/owner-profile' : '/camper-dashboard'));
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                style={styles.saveBtn}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    'Saving...'
                                ) : (
                                    <>
                                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                                                d="M5 13l4 4L19 7" />
                                        </svg>
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <div style={styles.dangerZone}>
                        <h3 style={styles.dangerTitle}>Danger Zone</h3>
                        <p style={styles.dangerText}>Once you delete your account, there is no going back. Please be certain.</p>
                        <button 
                            type="button" 
                            style={styles.deleteAccountBtn} 
                            onClick={handleDeleteAccount}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Processing...' : 'Delete My Account'}
                        </button>
                    </div>
                </div>
            </main>

            {isDeleted && (
                <div style={styles.deleteOverlay}>
                    <div style={styles.deleteCard}>
                        <div style={styles.deleteIconBg}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                <path d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 style={styles.deleteTitle}>Profile Successfully Deleted</h2>
                        <p style={styles.deleteSub}>Your account has been removed. You will be redirected to the login page shortly.</p>
                        <div style={styles.deleteProgressContainer}>
                            <div style={styles.deleteProgressBar} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── Field wrapper ─────────────────────────────────────────────────────────────
// The Field component is no longer used directly as fields are inlined.

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = {
    page: {
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        position: 'relative',
        overflow: 'hidden',
    },
    bgImage: {
        position: 'fixed',
        inset: 0,
        backgroundImage: "url('https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&w=2000')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        zIndex: 0,
    },
    bgOverlay: {
        position: 'fixed',
        inset: 0,
        background: 'linear-gradient(135deg, rgba(0,0,0,0.55) 0%, rgba(0,30,10,0.6) 100%)',
        backdropFilter: 'blur(2px)',
        zIndex: 1,
    },
    header: {
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1.5rem 2rem',
    },
    logo: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        cursor: 'pointer',
    },
    logoIcon: {
        width: '48px',
        height: '48px',
        borderRadius: '14px',
        background: 'linear-gradient(135deg, #22c55e, #10a110)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 0 20px rgba(34,197,94,0.4)',
    },
    logoText: {
        color: 'white',
        fontWeight: 800,
        fontSize: '1.4rem',
        letterSpacing: '-0.03em',
        textShadow: '0 2px 8px rgba(0,0,0,0.3)',
    },
    backBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.6rem 1.2rem',
        borderRadius: '10px',
        border: '1px solid rgba(255,255,255,0.25)',
        background: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(8px)',
        color: 'white',
        fontWeight: 600,
        fontSize: '0.85rem',
        cursor: 'pointer',
    },
    main: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem 1rem 3rem',
        position: 'relative',
        zIndex: 10,
    },
    card: {
        width: '100%',
        maxWidth: '480px',
        background: 'rgba(255,255,255,0.97)',
        borderRadius: '28px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.15)',
        overflow: 'hidden',
    },
    cardHeader: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '2rem 2rem 1.5rem',
        background: 'linear-gradient(180deg, rgba(16,161,16,0.07) 0%, transparent 100%)',
        borderBottom: '1px solid #f3f4f6',
    },
    editIcon: {
        width: '60px',
        height: '60px',
        borderRadius: '18px',
        background: 'linear-gradient(135deg, #22c55e, #10a110)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 8px 24px rgba(16,161,16,0.35)',
        marginBottom: '1rem',
    },
    cardTitle: {
        fontSize: '1.6rem',
        fontWeight: 800,
        color: '#111827',
        margin: '0 0 0.4rem',
        letterSpacing: '-0.03em',
    },
    cardSubtitle: {
        fontSize: '0.85rem',
        color: '#9ca3af',
        margin: 0,
        fontWeight: 500,
    },
    errorAlert: {
        margin: '1rem 1.5rem 0',
        padding: '0.75rem 1rem',
        borderRadius: '10px',
        background: '#fef2f2',
        border: '1px solid #fca5a5',
        color: '#dc2626',
        fontSize: '0.85rem',
        fontWeight: 500,
    },
    successAlert: {
        margin: '1rem 1.5rem 0',
        padding: '0.75rem 1rem',
        borderRadius: '10px',
        background: '#f0fdf4',
        border: '1px solid #86efac',
        color: '#15803d',
        fontSize: '0.85rem',
        fontWeight: 600,
    },
    form: {
        padding: '1.75rem 2rem 2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.2rem',
    },
    field: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.4rem',
    },
    label: {
        fontSize: '0.72rem',
        fontWeight: 700,
        color: '#374151',
        textTransform: 'uppercase',
        letterSpacing: '0.07em',
    },
    hint: {
        fontSize: '0.72rem',
        color: '#9ca3af',
        margin: '0 0 0.1rem',
    },
    inputWrapper: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
    },
    inputIcon: {
        position: 'absolute',
        left: '14px',
        display: 'flex',
        alignItems: 'center',
        pointerEvents: 'none',
    },
    input: {
        width: '100%',
        paddingLeft: '42px',
        paddingRight: '14px',
        paddingTop: '12px',
        paddingBottom: '12px',
        border: '1.5px solid #e5e7eb',
        borderRadius: '12px',
        fontSize: '0.9rem',
        color: '#1f2937',
        background: '#f9fafb',
        outline: 'none',
        boxSizing: 'border-box',
        fontFamily: 'inherit',
        transition: 'border-color 0.2s, box-shadow 0.2s',
    },
    btnRow: {
        display: 'flex',
        gap: '0.75rem',
        marginTop: '0.5rem',
    },
    cancelBtn: {
        flex: 1,
        padding: '0.85rem',
        borderRadius: '12px',
        border: '1.5px solid #e5e7eb',
        background: 'white',
        color: '#6b7280',
        fontWeight: 700,
        fontSize: '0.9rem',
        cursor: 'pointer',
        fontFamily: 'inherit',
    },
    saveBtn: {
        flex: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        padding: '0.85rem',
        borderRadius: '12px',
        border: 'none',
        background: 'linear-gradient(135deg, #10a110, #15803d)',
        color: 'white',
        fontWeight: 700,
        fontSize: '0.9rem',
        cursor: 'pointer',
        boxShadow: '0 4px 15px rgba(16,161,16,0.35)',
        fontFamily: 'inherit',
    },



    dangerZone: {
        margin: '0 2rem 2rem',
        padding: '1.5rem',
        borderRadius: '16px',
        background: '#fff1f2',
        border: '1px solid #fecdd3',
    },
    dangerTitle: {
        fontSize: '0.9rem',
        fontWeight: 800,
        color: '#991b1b',
        margin: '0 0 0.5rem',
    },
    dangerText: {
        fontSize: '0.8rem',
        color: '#b91c1c',
        margin: '0 0 1rem',
        opacity: 0.8,
    },
    deleteAccountBtn: {
        width: '100%',
        padding: '0.75rem',
        borderRadius: '10px',
        border: '1.5px solid #f1f5f9',
        background: '#dc2626',
        color: 'white',
        fontWeight: 700,
        fontSize: '0.85rem',
        cursor: 'pointer',
        transition: 'all 0.2s',
        ':hover': {
            background: '#b91c1c',
        }
    },
    deleteOverlay: {
        position: 'fixed', inset: 0, zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)',
        animation: 'fadeIn 0.3s ease-out'
    },
    deleteCard: {
        background: '#fff', padding: '40px', borderRadius: '24px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
        maxWidth: '400px', width: '90%', textAlign: 'center',
        animation: 'scaleUp 0.3s ease-out'
    },
    deleteIconBg: {
        width: '72px', height: '72px', background: '#10a110',
        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 24px', boxShadow: '0 8px 16px rgba(16, 161, 16, 0.3)'
    },
    deleteTitle: { fontSize: '22px', fontWeight: 800, color: '#1e293b', marginBottom: '12px' },
    deleteSub: { fontSize: '15px', color: '#64748b', lineHeight: '1.5', marginBottom: '24px' },
    deleteProgressContainer: { width: '100%', height: '4px', background: '#f1f5f9', borderRadius: '2px', overflow: 'hidden' },
    deleteProgressBar: { 
        width: '100%', height: '100%', background: '#10a110', 
        animation: 'progress 3s linear forwards' 
    }
};

export default EditProfile;
