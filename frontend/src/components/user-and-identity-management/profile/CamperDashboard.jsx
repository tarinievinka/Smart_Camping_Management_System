import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CamperDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Dashboard');
    const [isDeleted, setIsDeleted] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('userInfo');
        const userInfo = stored ? JSON.parse(stored) : null;
        if (!userInfo || !userInfo.token) {
            navigate('/login');
            return;
        }

        setUser(userInfo);
        setLoading(false);
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        navigate('/login');
    };

    const handleDeleteAccount = async () => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        const token = userInfo.token;
        try {
            const res = await fetch('http://localhost:5000/api/profile', {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (res.ok) {
                setIsDeleted(true);
                setTimeout(() => {
                    handleLogout();
                }, 3000);
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to delete account.');
            }
        } catch (err) {
            alert('Network error. Please try again.');
        }
    };

    const isDemoUser = user?.name?.toLowerCase().includes('maleesha');

    if (loading) {
        return (
            <div style={styles.loadingScreen}>
                <div style={styles.spinner} />
                <p style={{ color: '#10a110', marginTop: '1rem', fontWeight: 600 }}>Loading Dashboard...</p>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Sidebar */}
            <aside style={styles.sidebar}>
                <div style={styles.logoArea}>
                    <div style={styles.logoSquare}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                            <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                    </div>
                    <div>
                        <h1 style={styles.logoText}>Smart Camping</h1>
                        <p style={styles.logoSubtext}>Management System</p>
                    </div>
                </div>

                <nav style={styles.navMenu}>
                    <NavItem label="Dashboard" icon="📊" active={activeTab === 'Dashboard'} onClick={() => setActiveTab('Dashboard')} />
                    <NavItem label="My Bookings" icon="📅" active={activeTab === 'My Bookings'} onClick={() => setActiveTab('My Bookings')} />
                    <NavItem label="Equipment" icon="⛺" active={activeTab === 'Equipment'} onClick={() => setActiveTab('Equipment')} />
                    <NavItem label="Guides" icon="🧭" active={activeTab === 'Guides'} onClick={() => setActiveTab('Guides')} />
                    <NavItem label="Payments" icon="💳" active={activeTab === 'Payments'} onClick={() => setActiveTab('Payments')} />
                    <NavItem label="My Reviews" icon="⭐" active={activeTab === 'My Reviews'} onClick={() => navigate('/my-reviews')} />
                </nav>

                <div style={styles.sidebarFooter}>
                    <div style={styles.userCard}>
                        <div style={styles.userDetails}>
                            <p style={styles.userName}>{user?.name?.trim() || 'User'}</p>
                            <p style={styles.userRole}>Camper</p>
                        </div>
                        <button style={styles.logoutBtn} onClick={handleLogout}>
                            <span style={styles.logoutText}>Sign Out</span>
                            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#ef4444">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div style={{ padding: '0 20px 20px' }}>
                    <button 
                        style={styles.deleteAccountBtn} 
                        onClick={() => {
                            if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                                handleDeleteAccount();
                            }
                        }}
                    >
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete Account
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main style={styles.content}>
                <header style={styles.topHeader}>
                    <h2 style={styles.headerTitle}>{activeTab}</h2>
                    <div style={styles.headerRight}>
                        <div style={styles.searchBox}>
                            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#9ca3af">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input type="text" placeholder="Search trips, gear..." style={styles.searchField} />
                        </div>
                        <button style={styles.topIconBtn}>
                            🔔
                        </button>
                        <button style={styles.topIconBtn}>
                            ✉️
                        </button>
                    </div>
                </header>

                <div style={styles.scrollArea}>
                    <section style={styles.hero}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                            <div>
                                <h2 style={styles.welcomeMsg}>Welcome, {user?.name?.split(' ')[0] || 'Explorer'}!</h2>
                                {isDemoUser ? (
                                    <p style={styles.welcomeSub}>Your next adventure at <span style={{ color: '#10a110', fontWeight: 700 }}>Pine Ridge Reserve</span> starts in 3 days.</p>
                                ) : (
                                    <p style={styles.welcomeSub}>Ready for your next camping trip?</p>
                                )}
                            </div>
                            <button style={styles.updateDetailsBtn} onClick={() => navigate('/edit-profile')}>
                                ✏️ Update Personal Details
                            </button>
                        </div>
                    </section>

                    {/* Alert Box - Only for Demo User */}
                    {isDemoUser && (
                        <div style={styles.alert}>
                            <div style={styles.alertIconBg}>
                                <span style={{ fontSize: '20px' }}>⚠️</span>
                            </div>
                            <div style={styles.alertInfo}>
                                <p style={styles.alertHeader}>High Wind Advisory</p>
                                <p style={styles.alertBody}>Expect gusts up to 45mph at Pine Ridge Reserve. Secure your loose equipment and double-check tent stakes.</p>
                            </div>
                            <div style={styles.alertMeta}>
                                <span style={styles.alertTag}>ACTIVE NOW</span>
                                <button style={styles.alertClose}>✕</button>
                            </div>
                        </div>
                    )}

                    {/* Stats */}
                    <div style={styles.statsRow}>
                        <StatBox label="Upcoming Trips" value={isDemoUser ? "2" : "0"} icon="📅" color="#f0fdf4" iconColor="#10a110" />
                        <StatBox label="Total Spent" value={isDemoUser ? "$1,240.00" : "$0.00"} icon="💵" color="#f0fff4" iconColor="#10a110" />
                        <StatBox label="Active Rentals" value={isDemoUser ? "4 items" : "No items"} icon="⛺" color="#fff7ed" iconColor="#f97316" />
                    </div>

                    <div style={styles.gridMain}>
                        <div style={styles.leftCol}>
                            <div style={styles.card}>
                                <div style={styles.cardHeader}>
                                    <h3 style={styles.cardTitle}>Manage Bookings</h3>
                                    <button style={styles.linkBtn}>View All</button>
                                </div>
                                <table style={styles.table}>
                                    <thead>
                                        <tr>
                                            <th style={styles.th}>CAMPSITE</th>
                                            <th style={styles.th}>DATES</th>
                                            <th style={styles.th}>STATUS</th>
                                            <th style={styles.th}>ACTION</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {isDemoUser ? (
                                            <>
                                                <BookingRow 
                                                    name="Pine Ridge Reserve" 
                                                    dates="Oct 12 - Oct 15" 
                                                    status="Confirmed" 
                                                    img="https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&q=80&w=100"
                                                />
                                                <BookingRow 
                                                    name="Silver Lake Basin" 
                                                    dates="Nov 02 - Nov 05" 
                                                    status="Pending" 
                                                    img="https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&w=100"
                                                />
                                            </>
                                        ) : (
                                            <tr>
                                                <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No active bookings found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div style={styles.rightCol}>
                            <div style={styles.card}>
                                <h3 style={styles.cardTitle}>Current Equipment</h3>
                                <div style={styles.equipmentStack}>
                                    {isDemoUser ? (
                                        <>
                                            <EquipmentItem 
                                                name="4-Person Tent" 
                                                due="Due in 4 days" 
                                                img="https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&q=80&w=100"
                                            />
                                            <EquipmentItem 
                                                name="Sleeping Bag" 
                                                due="Due in 5 days" 
                                                img="https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&w=100"
                                            />
                                        </>
                                    ) : (
                                        <p style={{ fontSize: '14px', color: '#94a3b8', padding: '10px 0' }}>No equipment rented currently.</p>
                                    )}
                                </div>
                                <button style={styles.rentBtn}>Rent More Gear</button>
                            </div>

                            <div style={styles.guideBox}>
                                <h3 style={styles.guideHead}>My Guide</h3>
                                {isDemoUser ? (
                                    <div style={styles.guideInfo}>
                                        <img 
                                            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100" 
                                            alt="Guide" 
                                            style={styles.guideAvatar} 
                                        />
                                        <div>
                                            <p style={styles.guideName}>Sarah Miller</p>
                                            <p style={styles.guideSub}>Assigned to Pine Ridge</p>
                                        </div>
                                    </div>
                                ) : (
                                    <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>No guide assigned to your current trip.</p>
                                )}
                            </div>
                        </div>
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

const NavItem = ({ label, icon, active, onClick }) => (
    <div 
        style={{
            ...styles.navItem,
            ...(active ? styles.navItemActive : {})
        }} 
        onClick={onClick}
    >
        <span style={styles.navIcon}>{icon}</span>
        <span style={styles.navLabel}>{label}</span>
        {active && <div style={styles.navIndicator} />}
    </div>
);

const StatBox = ({ label, value, icon, color, iconColor }) => (
    <div style={styles.statBox}>
        <div style={{ ...styles.statIconWrap, background: color, color: iconColor }}>{icon}</div>
        <div>
            <p style={styles.statLabel}>{label}</p>
            <p style={styles.statVal}>{value}</p>
        </div>
    </div>
);

const BookingRow = ({ name, dates, status, img }) => (
    <tr style={styles.tr}>
        <td style={styles.td}>
            <div style={styles.cellMain}>
                <img src={img} alt={name} style={styles.bookingImg} />
                <p style={styles.bookingName}>{name}</p>
            </div>
        </td>
        <td style={styles.td}>{dates}</td>
        <td style={styles.td}>
            <span style={status === 'Confirmed' ? styles.pillGreen : styles.pillYellow}>{status}</span>
        </td>
        <td style={styles.td}>
            <div style={{ display: 'flex', gap: '8px' }}>
                <button style={styles.editBtn}>Edit</button>
                <button style={styles.deleteBtn}>Delete</button>
            </div>
        </td>
    </tr>
);

const EquipmentItem = ({ name, due, img }) => (
    <div style={styles.eqItem}>
        <img src={img} alt={name} style={styles.eqImg} />
        <div style={{ flex: 1 }}>
            <p style={styles.eqName}>{name}</p>
            <p style={styles.eqDue}>{due}</p>
        </div>
        <button style={styles.infoIcon}>ⓘ</button>
    </div>
);

const styles = {
    container: {
        display: 'flex',
        height: '100vh',
        background: '#f8fafc',
        fontFamily: "'Inter', sans-serif",
    },
    spinner: {
        width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #10a110', borderRadius: '50%',
        animation: 'spin 1s linear infinite'
    },
    loadingScreen: { height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fff' },
    sidebar: {
        width: '260px',
        background: '#fff',
        borderRight: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
    },
    logoArea: {
        padding: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '10px'
    },
    logoSquare: {
        width: '42px', height: '42px', background: '#10a110', borderRadius: '12px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 10px rgba(16, 161, 16, 0.2)'
    },
    logoText: { fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: 0 },
    logoSubtext: { fontSize: '10px', color: '#64748b', margin: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' },
    navMenu: { flex: 1, padding: '10px 16px' },
    navItem: {
        display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '10px',
        cursor: 'pointer', marginBottom: '6px', transition: 'all 0.2s', color: '#64748b', fontWeight: 600, fontSize: '14px',
        position: 'relative'
    },
    navItemActive: { background: '#f0fdf4', color: '#10a110' },
    navIcon: { fontSize: '18px' },
    navIndicator: {
        position: 'absolute', right: '0', top: '15%', height: '70%', width: '4px',
        background: '#10a110', borderRadius: '4px 0 0 4px'
    },
    sidebarFooter: { padding: '20px', borderTop: '1px solid #f1f5f9' },
    userCard: {
        display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', padding: '10px', borderRadius: '14px'
    },
    avatar: { width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' },
    userDetails: { flex: 1 },
    userName: { fontSize: '13px', fontWeight: 700, color: '#1e293b', margin: 0 },
    userRole: { fontSize: '11px', color: '#64748b', margin: 0, fontWeight: 500 },
    logoutBtn: { 
        background: '#fff', border: '1px solid #fee2e2', cursor: 'pointer', 
        padding: '6px 10px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px',
        transition: 'all 0.2s',
        ':hover': { background: '#fef2f2' }
    },
    logoutText: { fontSize: '11px', fontWeight: 700, color: '#ef4444' },
    deleteAccountBtn: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '10px',
        borderRadius: '10px',
        background: '#fef2f2',
        color: '#dc2626',
        border: '1px solid #fee2e2',
        fontSize: '13px',
        fontWeight: 700,
        cursor: 'pointer',
        transition: 'all 0.2s',
        ':hover': {
            background: '#fee2e2'
        }
    },
    
    content: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
    topHeader: {
        height: '70px', background: '#fff', borderBottom: '1px solid #e2e8f0',
        display: 'flex', alignItems: 'center', justifyBetween: 'space-between', padding: '0 32px', flexShrink: 0,
        justifyContent: 'space-between'
    },
    headerTitle: { fontSize: '20px', fontWeight: 800, color: '#1e293b', margin: 0 },
    headerRight: { display: 'flex', alignItems: 'center', gap: '16px' },
    searchBox: {
        background: '#f1f5f9', borderRadius: '10px', padding: '0 12px', display: 'flex', alignItems: 'center', gap: '8px', width: '280px'
    },
    searchField: { background: 'none', border: 'none', padding: '10px 0', fontSize: '13px', outline: 'none', width: '100%', color: '#1e293b' },
    topIconBtn: {
        background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', width: '38px', height: '38px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '16px'
    },
    
    scrollArea: { flex: 1, overflowY: 'auto', padding: '32px' },
    hero: { marginBottom: '24px' },
    updateDetailsBtn: {
        background: '#f0fdf4',
        color: '#10a110',
        border: '1px solid #dcfce7',
        padding: '10px 18px',
        borderRadius: '12px',
        fontSize: '13px',
        fontWeight: 700,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'all 0.2s',
        ':hover': {
            background: '#dcfce7',
            transform: 'translateY(-1px)'
        }
    },
    welcomeMsg: { fontSize: '28px', fontWeight: 800, color: '#1e293b', margin: '0 0 8px 0' },
    welcomeSub: { fontSize: '15px', color: '#64748b', margin: 0 },
    
    alert: {
        background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '14px', padding: '16px 20px',
        display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px', position: 'relative'
    },
    alertIconBg: {
        width: '40px', height: '40px', background: '#fef3c7', borderRadius: '10px',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
    },
    alertInfo: { flex: 1 },
    alertHeader: { fontSize: '15px', fontWeight: 700, color: '#92400e', margin: '0 0 4px 0' },
    alertBody: { fontSize: '13px', color: '#b45309', margin: 0, opacity: 0.8 },
    alertMeta: { display: 'flex', alignItems: 'center', gap: '12px' },
    alertTag: { fontSize: '10px', fontWeight: 800, color: '#b45309', letterSpacing: '0.5px' },
    alertClose: { background: 'none', border: 'none', color: '#b45309', cursor: 'pointer', fontSize: '16px', opacity: 0.5 },
    
    statsRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '32px' },
    statBox: {
        background: '#fff', padding: '24px', borderRadius: '18px', display: 'flex', alignItems: 'center', gap: '20px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
    },
    statIconWrap: {
        width: '52px', height: '52px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px'
    },
    statLabel: { fontSize: '13px', fontWeight: 600, color: '#64748b', margin: '0 0 4px 0' },
    statVal: { fontSize: '24px', fontWeight: 800, color: '#1e293b', margin: 0 },
    
    gridMain: { display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px' },
    leftCol: { display: 'flex', flexDirection: 'column' },
    card: {
        background: '#fff', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        marginBottom: '24px'
    },
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    cardTitle: { fontSize: '17px', fontWeight: 800, color: '#1e293b', margin: 0 },
    linkBtn: { background: 'none', border: 'none', color: '#10a110', fontWeight: 700, fontSize: '14px', cursor: 'pointer' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', padding: '12px', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', borderBottom: '1px solid #f1f5f9' },
    td: { padding: '16px 12px', fontSize: '14px', color: '#475569', borderBottom: '1px solid #f1f5f9' },
    cellMain: { display: 'flex', alignItems: 'center', gap: '12px' },
    bookingImg: { width: '44px', height: '44px', borderRadius: '10px', objectFit: 'cover' },
    bookingName: { fontWeight: 700, color: '#1e293b', margin: 0 },
    pillGreen: { padding: '6px 14px', borderRadius: '99px', fontSize: '12px', fontWeight: 700, background: '#f0fdf4', color: '#10a110' },
    pillYellow: { padding: '6px 14px', borderRadius: '99px', fontSize: '12px', fontWeight: 700, background: '#fffbeb', color: '#d97706' },
    editBtn: { background: '#f0fdf4', color: '#10a110', border: '1px solid #dcfce7', padding: '8px 16px', borderRadius: '10px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s' },
    deleteBtn: { background: '#fef2f2', color: '#ef4444', border: '1px solid #fee2e2', padding: '8px 16px', borderRadius: '10px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s' },
    
    rightCol: { display: 'flex', flexDirection: 'column', gap: '24px' },
    equipmentStack: { marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' },
    eqItem: { display: 'flex', alignItems: 'center', gap: '14px', padding: '14px', background: '#f8fafc', borderRadius: '16px' },
    eqImg: { width: '56px', height: '56px', background: '#fff', borderRadius: '12px', objectFit: 'cover' },
    eqName: { fontSize: '15px', fontWeight: 700, color: '#1e293b', margin: 0 },
    eqDue: { fontSize: '12px', color: '#94a3b8', margin: 0 },
    infoIcon: { background: 'none', border: 'none', color: '#cbd5e1', fontSize: '20px', cursor: 'pointer' },
    rentBtn: {
        width: '100%', marginTop: '16px', background: '#fff', border: '1px solid #e2e8f0', padding: '14px', borderRadius: '12px',
        color: '#10a110', fontWeight: 700, fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s'
    },
    
    guideBox: { background: '#10a110', borderRadius: '20px', padding: '24px', color: '#fff' },
    guideHead: { fontSize: '17px', fontWeight: 800, margin: '0 0 20px 0' },
    guideInfo: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' },
    guideAvatar: { width: '52px', height: '52px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)' },
    guideName: { fontWeight: 700, fontSize: '16px', margin: 0 },
    guideSub: { fontSize: '12px', color: 'rgba(255,255,255,0.8)', margin: 0 },
    chatBtn: {
        width: '100%', background: '#fff', border: 'none', padding: '14px', borderRadius: '12px',
        color: '#10a110', fontWeight: 700, fontSize: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
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

export default CamperDashboard;
