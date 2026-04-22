import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import { Star, MapPin, Calendar, CreditCard, Package, Compass, Trash2, LogOut, ChevronRight, MessageSquare, PenSquare, Clock, User } from 'lucide-react';
import { getEquipmentBookings } from '../../../utils/equipmentBookings';

const CamperDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user: authUser, setUser: setAuthUser, logout: authLogout } = useAuth();
    const [user, setUser] = useState(authUser);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Dashboard');
    const [activeBookingTab, setActiveBookingTab] = useState('All Bookings');
    const [isDeleted, setIsDeleted] = useState(false);
    
    // Data states
    const [equipmentBookings, setEquipmentBookings] = useState([]);
    const [guideBookings, setGuideBookings] = useState([]);
    const [guides, setGuides] = useState([]);
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
<<<<<<< HEAD
        if (authUser) {
            setUser(authUser);
        } else {
            const stored = localStorage.getItem('userInfo');
            if (stored) {
                const userInfo = JSON.parse(stored);
                setUser(userInfo);
            } else {
                navigate('/login');
            }
        }
    }, [authUser, navigate]);

    useEffect(() => {
        const userInfo = authUser || JSON.parse(localStorage.getItem('userInfo') || '{}');
        
        // Handle delete account trigger from Navbar
        if (location.state?.triggerDelete) {
            handleDeleteAccount();
        }

        const fetchData = async () => {
            try {
                // Fetch Equipment Bookings from localStorage
                const eqBookings = getEquipmentBookings();
                setEquipmentBookings(eqBookings);

                // Fetch Guide Bookings
                const guideRes = await axios.get('http://localhost:5000/api/guide-bookings/display');
                const allGuideBookings = guideRes.data || [];
                const myGuideBookings = allGuideBookings.filter(b => {
                    const bUserId = String(b.userId || "").trim();
                    const currentId = String(userInfo._id || userInfo.id || "").trim();
                    
                    if (bUserId && currentId) {
                        return bUserId === currentId;
                    }
                    
                    // Backward compatibility for bookings without userId
                    const bName = String(b.customerName || "").trim().toLowerCase();
                    const uName = String(userInfo.name || "").trim().toLowerCase();
                    return bName === uName && uName !== "";
                });
                setGuideBookings(myGuideBookings);

                // Fetch Guides for mapping IDs to names
                const guidesRes = await axios.get('http://localhost:5000/api/guides/display');
                setGuides(guidesRes.data || []);

                // Fetch Reviews
                const reviewRes = await axios.get('http://localhost:5000/api/feedback/display');
                const allReviews = reviewRes.data || [];
                const myReviews = allReviews.filter(r => String(r.userId || "") === String(userInfo._id || userInfo.id));
                setReviews(myReviews);

            } catch (err) {
                console.error("Error fetching dashboard data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate, location.state, authUser]);



    const handleLogout = () => {
        authLogout();
=======
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
>>>>>>> 72d49f97b953854ffc2cce76cb28c3b75c102fd7
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


    const allBookings = useMemo(() => {
        const eq = equipmentBookings.map(b => ({
            id: b.bookingId,
            type: 'Equipment',
            name: b.items.map(i => i.name).join(', '),
            date: new Date(b.bookedAt).toLocaleDateString(),
            status: b.status,
            total: `LKR ${b.totalAmount || 0}`,
            rawDate: b.bookedAt,
            image: b.items?.[0]?.imageUrl 
                ? `http://localhost:5000${b.items[0].imageUrl}` 
                : "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&w=1000"
        }));
        const gd = guideBookings.map(b => {
            const gid = typeof b.guideId === 'object' ? b.guideId?._id : b.guideId;
            let guide = (typeof b.guideId === 'object' ? b.guideId : null) || guides.find(g => String(g._id) === String(gid));
            if (!guide) {
                guide = guides.find(g => String(g.userId) === String(gid));
            }

            return {
                id: b._id,
                type: 'Guide',
                name: guide?.name || b.guideId?.name || b.guideName || 'Local Guide',
                date: b.startDate ? new Date(b.startDate).toLocaleDateString() : new Date(b.bookedAt).toLocaleDateString(),
                status: b.status,
                total: `LKR ${b.amount || 0}`,
                rawDate: b.startDate || b.bookedAt,
                image: guide?.profilePhoto 
                    ? `http://localhost:5000${guide.profilePhoto}` 
                    : (guide?.profilePicture ? `http://localhost:5000${guide.profilePicture}` : "https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&q=80&w=1000")
            };
        });
        return [...eq, ...gd].sort((a, b) => new Date(b.rawDate) - new Date(a.rawDate));
    }, [equipmentBookings, guideBookings, guides]);

    const stats = useMemo(() => {
        const upcoming = allBookings.filter(b => b.status.toLowerCase() === 'pending' || b.status.toLowerCase() === 'confirmed' || b.status.toLowerCase() === 'paid').length;
        const totalSpent = allBookings.reduce((sum, b) => sum + parseFloat(b.total.replace('LKR ', '').replace('$', '')), 0);
        const activeRentals = equipmentBookings.filter(b => b.status.toLowerCase() === 'paid').length;
        return {
            upcoming: upcoming,
            spent: `LKR ${totalSpent.toLocaleString()}`,
            rentals: `${activeRentals} bookings`
        };
    }, [allBookings, equipmentBookings]);

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
<<<<<<< HEAD
=======
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
>>>>>>> 72d49f97b953854ffc2cce76cb28c3b75c102fd7
            <main style={styles.content}>
                <div style={styles.scrollArea}>
<<<<<<< HEAD
                    <div style={styles.centeredContainer}>
                        {/* Header Section */}
                        <section style={styles.hero}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h2 style={styles.welcomeMsg}>Welcome, {user?.name?.split(' ')[0] || 'Explorer'}!</h2>
=======
                    <section style={styles.hero}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                            <div>
                                <h2 style={styles.welcomeMsg}>Welcome, {user?.name?.split(' ')[0] || 'Explorer'}!</h2>
                                {isDemoUser ? (
                                    <p style={styles.welcomeSub}>Your next adventure at <span style={{ color: '#10a110', fontWeight: 700 }}>Pine Ridge Reserve</span> starts in 3 days.</p>
                                ) : (
>>>>>>> 72d49f97b953854ffc2cce76cb28c3b75c102fd7
                                    <p style={styles.welcomeSub}>Ready for your next camping trip?</p>
                                </div>
                                <button style={styles.updateDetailsBtn} onClick={() => navigate('/edit-profile')}>
                                    <PenSquare size={16} /> Update Personal Details
                                </button>
                            </div>
                        </section>

                        {/* Summary Cards */}
                        <div style={styles.statsRow}>
                            <StatBox label="Upcoming Trips" value={stats.upcoming} icon={<Calendar size={24} />} color="#f0fdf4" iconColor="#10a110" />
                            <StatBox label="Total Spent" value={stats.spent} icon={<CreditCard size={24} />} color="#f0fff4" iconColor="#10a110" />
                            <StatBox label="Active Rentals" value={stats.rentals} icon={<Package size={24} />} color="#fff7ed" iconColor="#f97316" />
                        </div>

                        {/* Main Grid: Bookings + Reviews */}
                        <div style={styles.gridMain}>
                            {/* Left Column: My Bookings */}
                            <div style={styles.card}>
                                <div style={styles.cardHeader}>
                                    <h3 style={styles.cardTitle}>My Bookings</h3>
                                    <div style={styles.tabGroup}>
                                        {['All Bookings', 'Equipment Rentals', 'Guide Bookings'].map(tab => (
                                            <button 
                                                key={tab}
                                                style={{
                                                    ...styles.tabBtn,
                                                    ...(activeBookingTab === tab ? styles.tabBtnActive : {})
                                                }}
                                                onClick={() => setActiveBookingTab(tab)}
                                            >
                                                {tab}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div style={styles.bookingsList}>
                                    {allBookings
                                        .filter(b => {
                                            if (activeBookingTab === 'Equipment Rentals') return b.type === 'Equipment';
                                            if (activeBookingTab === 'Guide Bookings') return b.type === 'Guide';
                                            return true;
                                        })
                                        .map((booking, index) => (
                                            <div key={`${booking.type}-${booking.id}-${index}`} style={styles.bookingCard}>
                                                <div style={styles.bookingImageWrap}>
                                                    <img src={booking.image} alt={booking.name} style={styles.bookingImage} />
                                                </div>
                                                <div style={styles.bookingContent}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                        <div style={styles.bookingMeta}>
                                                            <span style={{ 
                                                                ...styles.bookingTypeBadge,
                                                                background: booking.type === 'Equipment' ? '#f0fdf4' : '#eff6ff',
                                                                color: booking.type === 'Equipment' ? '#10a110' : '#3b82f6',
                                                                border: `1px solid ${booking.type === 'Equipment' ? '#dcfce7' : '#dbeafe'}`
                                                            }}>
                                                                {booking.type === 'Equipment' ? <Package size={12} /> : <Compass size={12} />}
                                                                {booking.type}
                                                            </span>
                                                            <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>#{booking.id?.slice(-6) || 'N/A'}</span>
                                                        </div>
                                                        <button 
                                                            style={styles.viewDetailsBtn}
                                                            onClick={() => navigate(booking.type === 'Equipment' ? '/equipment-bookings' : '/guides/bookings')}
                                                        >
                                                            <PenSquare size={14} /> View Details
                                                        </button>
                                                    </div>

                                                    <h4 style={styles.bookingName}>{booking.name}</h4>
                                                    
                                                    <div style={styles.bookingDetailsRow}>
                                                        <div style={styles.bookingDetailItem}>
                                                            <div style={{ padding: '6px', background: '#f8fafc', borderRadius: '8px', color: '#10a110' }}>
                                                                <Calendar size={14} />
                                                            </div>
                                                            <span style={{ fontWeight: 600 }}>{booking.date}</span>
                                                        </div>
                                                        <div style={styles.bookingDetailItem}>
                                                            <div style={{ padding: '6px', background: '#f8fafc', borderRadius: '8px', color: '#10a110' }}>
                                                                <CreditCard size={14} />
                                                            </div>
                                                            <span style={{ fontWeight: 700, color: '#10a110' }}>{booking.total}</span>
                                                        </div>
                                                        <div style={styles.bookingDetailItem}>
                                                            <span style={(booking.status?.toLowerCase() === 'confirmed' || booking.status?.toLowerCase() === 'paid') ? styles.pillGreen : styles.pillYellow}>
                                                                <Clock size={12} style={{ marginRight: '4px' }} />
                                                                {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1).toLowerCase()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    {allBookings.length === 0 && (
                                        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#f8fafc', borderRadius: '20px' }}>
                                            <p style={{ color: '#94a3b8', fontSize: '15px', margin: 0 }}>No bookings found.</p>
                                        </div>
                                    )}
                                </div>

                            </div>

                            {/* Right Column: My Reviews */}
                            <div style={styles.card}>
                                <div style={styles.cardHeader}>
                                    <h3 style={styles.cardTitle}>My Reviews</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f1f5f9', padding: '4px', borderRadius: '12px' }}>
                                        <button 
                                            style={{ ...styles.tabBtn, background: 'none' }} 
                                            onClick={() => navigate('/feedback')}
                                        >
                                            <PenSquare size={14} /> Submit Review
                                        </button>
                                        <button 
                                            style={{ ...styles.tabBtn, ...styles.tabBtnActive }}
                                            onClick={() => navigate('/my-reviews')}
                                        >
                                            <User size={14} /> My Reviews
                                        </button>
                                    </div>
                                </div>
                                <div 
                                    style={{ ...styles.reviewsList, cursor: 'pointer' }}
                                    onClick={() => navigate('/my-reviews')}
                                >
                                    {reviews.map((review, index) => (
                                        <div key={review._id || index} style={styles.reviewItem}>
                                            <div style={{ display: 'flex', gap: '12px' }}>
                                                <div style={{ width: '60px', height: '60px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0 }}>
                                                    <img 
                                                        src={review.image || "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&q=80&w=200"} 
                                                        alt="" 
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                                    />
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                        <h4 style={styles.reviewTarget}>{review.targetName || review.targetType}</h4>
                                                        <span style={styles.reviewDate}>{new Date(review.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '2px', marginBottom: '8px' }}>
                                                        {[1, 2, 3, 4, 5].map(star => (
                                                            <Star 
                                                                key={star} 
                                                                size={12} 
                                                                fill={star <= review.rating ? "#fbbf24" : "none"} 
                                                                color={star <= review.rating ? "#fbbf24" : "#cbd5e1"} 
                                                            />
                                                        ))}
                                                    </div>
                                                    <p style={{ ...styles.reviewText, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                        {review.comment || review.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {reviews.length === 0 && (
                                        <p style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>
                                            No reviews yet.
                                        </p>
                                    )}
                                </div>
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

const StatBox = ({ label, value, icon, color, iconColor }) => (
    <div style={styles.statBox}>
        <div style={{ ...styles.statIconWrap, background: color, color: iconColor }}>{icon}</div>
        <div>
            <p style={styles.statLabel}>{label}</p>
            <p style={styles.statVal}>{value}</p>
        </div>
    </div>
);

const styles = {
    container: {
        minHeight: '100vh',
        background: '#f8fafc',
        fontFamily: "'Inter', sans-serif",
    },
    content: { flex: 1, display: 'flex', flexDirection: 'column' },
    scrollArea: { flex: 1, padding: '40px 20px' },
    centeredContainer: {
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%',
    },
    hero: { marginBottom: '32px' },
    welcomeMsg: { fontSize: '32px', fontWeight: 800, color: '#1e293b', margin: '0 0 8px 0' },
    welcomeSub: { fontSize: '16px', color: '#64748b', margin: 0 },
    updateDetailsBtn: {
        background: '#fff',
        color: '#1e293b',
        border: '1px solid #e2e8f0',
        padding: '10px 20px',
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: 600,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'all 0.2s',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        ':hover': { background: '#f8fafc' }
    },
    statsRow: { 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '24px', 
        marginBottom: '40px' 
    },
    statBox: {
        background: '#fff', padding: '24px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '20px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        border: '1px solid #f1f5f9'
    },
    statIconWrap: {
        width: '56px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center'
    },
    statLabel: { fontSize: '14px', fontWeight: 600, color: '#64748b', margin: '0 0 4px 0' },
    statVal: { fontSize: '26px', fontWeight: 800, color: '#1e293b', margin: 0 },
    
    gridMain: { 
        display: 'grid', 
        gridTemplateColumns: '1fr 380px', 
        gap: '32px',
        alignItems: 'start'
    },
    
    card: {
        background: '#fff', borderRadius: '24px', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        marginBottom: '32px', border: '1px solid #f1f5f9'
    },
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' },
    cardTitle: { fontSize: '20px', fontWeight: 800, color: '#1e293b', margin: 0 },
    
    tabGroup: { display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '12px' },
    tabBtn: { 
        padding: '8px 16px', border: 'none', background: 'none', cursor: 'pointer', 
        fontSize: '13px', fontWeight: 600, color: '#64748b', borderRadius: '10px', transition: 'all 0.2s' 
    },
    tabBtnActive: { background: '#fff', color: '#10a110', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },

    table: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', padding: '12px', fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', borderBottom: '1px solid #f1f5f9' },
    td: { padding: '16px 12px', fontSize: '14px', color: '#475569', borderBottom: '1px solid #f1f5f9' },
    tr: { transition: 'background 0.2s', ':hover': { background: '#f8fafc' } },
    
    pillGreen: { padding: '6px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: 700, background: '#f0fdf4', color: '#10a110' },
    pillYellow: { padding: '6px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: 700, background: '#fffbeb', color: '#d97706' },
    
    viewDetailsBtn: { 
        background: '#fff', border: '1px solid #e2e8f0', color: '#1e293b', 
        padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
        display: 'flex', alignItems: 'center', gap: '6px'
    },

    bookingsList: { display: 'flex', flexDirection: 'column', gap: '16px' },
    bookingCard: {
        display: 'flex', gap: '20px', padding: '16px', borderRadius: '20px', background: '#fff',
        border: '1px solid #f1f5f9', transition: 'all 0.3s',
        ':hover': { boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)', borderColor: '#e2e8f0' }
    },
    bookingImageWrap: { width: '180px', height: '120px', borderRadius: '16px', overflow: 'hidden', flexShrink: 0 },
    bookingImage: { width: '100%', height: '100%', objectFit: 'cover' },
    bookingContent: { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' },
    bookingMeta: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' },
    bookingTypeBadge: { 
        padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, 
        textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px'
    },
    bookingName: { fontSize: '18px', fontWeight: 800, color: '#1e293b', marginBottom: '8px' },
    bookingDetailsRow: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '16px', color: '#64748b', fontSize: '13px' },
    bookingDetailItem: { display: 'flex', alignItems: 'center', gap: '6px' },

    writeReviewBtn: {
        display: 'flex', alignItems: 'center', gap: '8px', background: '#10a110', color: '#fff',
        border: 'none', padding: '10px 18px', borderRadius: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer'
    },
    reviewsList: { display: 'flex', flexDirection: 'column', gap: '20px' },
    reviewItem: { padding: '20px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #f1f5f9' },
    reviewTarget: { fontSize: '16px', fontWeight: 700, color: '#1e293b', margin: 0 },
    reviewDate: { fontSize: '12px', color: '#94a3b8' },
    reviewText: { fontSize: '14px', color: '#475569', lineHeight: '1.6', margin: 0 },

    spinner: {
        width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #10a110', borderRadius: '50%',
        animation: 'spin 1s linear infinite'
    },
    loadingScreen: { height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fff' },
    
    deleteOverlay: {
        position: 'fixed', inset: 0, zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)',
    },
    deleteCard: {
        background: '#fff', padding: '40px', borderRadius: '24px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
        maxWidth: '400px', width: '90%', textAlign: 'center',
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
    },


};

export default CamperDashboard;
