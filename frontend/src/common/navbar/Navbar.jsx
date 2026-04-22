import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
<<<<<<< HEAD
import { User, CreditCard, LogOut, ChevronDown, Trash2, Bell } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getCustomerBookingName } from "../../utils/customerIdentity";
=======
import { User, CreditCard, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
>>>>>>> 72d49f97b953854ffc2cce76cb28c3b75c102fd7

const navLinks = [
    { label: "Home", href: "/" },
    { label: "Campsites", href: "/campsites" },
    { label: "Equipment", href: "/equipment-store" },
    { label: "Guides", href: "/guides" },
    { label: "Safety", href: "/safety-analysis" },
    { label: "Blogs", href: "/blogs" },
];

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const profileRef = useRef(null);
    const notifRef = useRef(null);

    // Fetch notifications logic
    useEffect(() => {
        if (!user?.email) return;

        const fetchNotifications = async () => {
            try {
                // Fetch customer notifications (restocks, etc.)
                const customerRes = await fetch(`${process.env.REACT_APP_API_URL}/api/customer-notifications/user/${user.email}`);
                const customerData = await customerRes.json();
                
                // Fetch guide booking notifications
                const guideRes = await fetch(`${process.env.REACT_APP_API_URL}/api/guide-bookings/notifications?customerName=${getCustomerBookingName()}`);
                const guideData = await guideRes.json();

                let allNotifications = [];
                
                if (Array.isArray(customerData)) {
                    allNotifications = [...allNotifications, ...customerData.map(n => ({ ...n, type: 'customer' }))];
                }
                
                if (Array.isArray(guideData)) {
                    allNotifications = [...allNotifications, ...guideData.map(n => ({ ...n, type: 'guide' }))];
                }

                // Sort by date descending
                allNotifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                setNotifications(allNotifications);
                setUnreadCount(allNotifications.filter(n => !n.read).length);

                // Check for fresh restock notifications for alerts
                const newRestock = allNotifications.find(n => n.type === 'customer' && n.restocked && !n.alertSent);
                if (newRestock) {
                    alert(`🚀 RESTOCK ALERT: ${newRestock.title}\n\n${newRestock.body}`);
                    fetch(`${process.env.REACT_APP_API_URL}/api/customer-notifications/alert-sent/${newRestock._id}`, { method: 'PATCH' });
                }
            } catch (error) {
                console.error("Failed to fetch notifications:", error);
            }
        };

        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, [user?.email]);

    const markAsRead = async (id, type) => {
        try {
            const endpoint = type === 'guide'
                ? `${process.env.REACT_APP_API_URL}/api/guide-bookings/notifications/${id}/read`
                : `${process.env.REACT_APP_API_URL}/api/customer-notifications/read/${id}`;
            
            await fetch(endpoint, { method: 'PATCH' });
            
            setNotifications(prev => {
                const updated = prev.map(n => n._id === id ? { ...n, read: true } : n);
                setUnreadCount(updated.filter(n => !n.read).length);
                return updated;
            });
        } catch (error) {
            console.error("Failed to mark as read:", error);
        }
    };

    // Auto-detect active link from current URL
    const isActive = (href) => {
        if (href === "/") return location.pathname === "/";
        return location.pathname.startsWith(href);
    };

    // Close profile dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (profileRef.current && !profileRef.current.contains(e.target)) {
                setProfileOpen(false);
            }
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setNotifOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const getDashboardPath = () => {
        if (!user) return "/login";
        switch (user.role) {
            case "camper":
                return "/camper-dashboard";
            case "admin":
                return "/admin-dashboard";
            case "guide":
<<<<<<< HEAD
                return "/camper-dashboard";
=======
                return "/guides/owndashboard";
>>>>>>> 72d49f97b953854ffc2cce76cb28c3b75c102fd7
            case "owner":
                return "/owner-profile";
            default:
                return "/camper-dashboard";
        }
    };

<<<<<<< HEAD
=======

    const isOwnerDashboard = location.pathname === "/owner-profile";
>>>>>>> 72d49f97b953854ffc2cce76cb28c3b75c102fd7

    return (
        <nav className="w-full bg-gradient-to-r from-white/75 via-white/35 to-white/75 backdrop-blur-xl border-b border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.08)] sticky top-0 z-50 transition-all duration-300">
            <div className="w-full px-4 sm:px-6 lg:px-10">
                <div className="flex items-center w-full justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2.5 shrink-0">
                        <svg className="w-10 h-10" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="40" height="40" rx="8" fill="#166534" />
                            <path d="M20 8L30 28H10L20 8Z" fill="#22c55e" stroke="white" strokeWidth="1" />
                            <path d="M14 16L22 28H6L14 16Z" fill="#15803d" stroke="white" strokeWidth="1" />
                            <rect x="18" y="24" width="4" height="4" rx="0.5" fill="white" />
                        </svg>
                        <div className="flex flex-col justify-center">
                            <span className="text-[1.35rem] font-black text-[#166534] tracking-widest uppercase leading-none">CAMPTRAIL</span>
                            <span className="text-[0.95rem] font-bold text-[#166534] tracking-[0.3em] leading-none mt-1">360</span>
                        </div>
                    </Link>

                    {/* Desktop Nav Links - Hidden on Owner Dashboard */}
                    {!isOwnerDashboard && (
                        <div className="hidden md:flex items-center gap-10 lg:gap-14 ml-10">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.label}
                                    to={link.href}
                                    onClick={() => setMobileOpen(false)}
                                    className={`text-[15px] font-bold tracking-wide transition-colors duration-200 pb-0.5 ${isActive(link.href)
                                            ? "text-[#166534] border-b-2 border-[#166534]"
                                            : "text-gray-600 hover:text-[#166534]"
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                            {user?.role === "camper" && (
                                <Link
                                    to="/payment-history"
                                    className={`text-[15px] font-bold tracking-wide transition-colors duration-200 pb-0.5 ${isActive("/payment-history")
                                            ? "text-[#166534] border-b-2 border-[#166534]"
                                            : "text-gray-600 hover:text-[#166534]"
                                        }`}
                                >
                                    Payment
                                </Link>
                            )}
                        </div>
                    )}

                    {/* Right Side — Search + CTA + Profile */}
                    <div className="hidden md:flex items-center gap-4 ml-auto pl-8">

                        {!isOwnerDashboard && (
                            <>
                                {/* Search Icon */}
                                <button
                                    className="p-2 rounded-full text-gray-500 hover:text-[#166534] hover:bg-[#166534]/10 transition-colors duration-200"
                                    aria-label="Search"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
                                    </svg>
                                </button>

                                {/* CTA */}
                                <Link
                                    to="/guides"
                                    className="hidden lg:inline-flex items-center px-5 py-2.5 text-sm font-semibold text-white bg-[#166534] rounded-full hover:bg-[#155e2e] active:bg-[#14532d] shadow-md hover:shadow-lg transition-all duration-200 mr-2"
                                >
                                    Plan Your Adventure
                                </Link>
                            </>
                        )}

                        {/* Auth Buttons */}
                        {!user ? (
                            <div className="flex items-center gap-3 mr-2">
                                <Link
                                    to="/login"
                                    className="text-sm font-medium text-gray-600 hover:text-[#166534] transition-colors duration-200"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    to="/signup"
                                    className="text-sm font-medium text-[#166534] bg-[#166534]/10 px-4 py-2 rounded-full hover:bg-[#166534]/20 transition-colors duration-200"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        ) : null}



                        {/* Notification Bell */}
                        {user && (
                            <div className="relative" ref={notifRef}>
                                <button
                                    onClick={() => setNotifOpen(!notifOpen)}
                                    className="p-2 rounded-full text-gray-500 hover:text-[#166534] hover:bg-[#166534]/10 transition-colors duration-200 relative"
                                    aria-label="Notifications"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                    </svg>
                                    {unreadCount > 0 && (
                                        <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>

                                {/* Notifications Dropdown */}
                                {notifOpen && (
                                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Notifications</h3>
                                            {unreadCount > 0 && (
                                                <span className="text-[10px] bg-[#166534] text-white px-2 py-0.5 rounded-full font-bold">
                                                    {unreadCount} NEW
                                                </span>
                                            )}
                                        </div>
                                        <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                                            {notifications.length === 0 ? (
                                                <div className="p-10 text-center">
                                                    <div className="text-3xl mb-2">🔔</div>
                                                    <p className="text-xs text-gray-400 font-medium">No notifications yet</p>
                                                </div>
                                            ) : (
                                                notifications.map((n) => (
                                                    <div 
                                                        key={n._id} 
                                                        onClick={() => markAsRead(n._id, n.type)}
                                                        className={`p-4 border-b border-gray-50 cursor-pointer transition-colors hover:bg-gray-50 ${!n.read ? 'bg-[#166534]/5' : ''}`}
                                                    >
                                                        <div className="flex gap-3">
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                                                                n.type === 'guide' ? 'bg-amber-100 text-amber-600' :
                                                                n.restocked ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                                                            }`}>
                                                                {n.type === 'guide' ? '🏕️' : n.restocked ? '📦' : 'ℹ️'}
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex justify-between items-start gap-2">
                                                                    <p className={`text-[13px] leading-tight mb-1 ${!n.read ? 'font-bold text-gray-900' : 'text-gray-600'}`}>
                                                                        {n.title}
                                                                    </p>
                                                                    {n.type === 'guide' && (
                                                                        <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded leading-none shrink-0">GUIDE</span>
                                                                    )}
                                                                </div>
                                                                <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
                                                                    {n.body}
                                                                </p>
                                                                <p className="text-[9px] text-gray-400 mt-2 font-semibold uppercase tracking-wider">
                                                                    {new Date(n.createdAt).toLocaleDateString()} · {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </p>
                                                            </div>
                                                            {!n.read && (
                                                                <div className="w-2 h-2 bg-[#166534] rounded-full mt-1.5 shadow-sm shadow-green-200"></div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                        <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
                                            <button className="text-[11px] font-bold text-[#166534] hover:underline uppercase tracking-widest">
                                                Clear All
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Profile Dropdown */}
                        <div className="relative" ref={profileRef}>
                            <button
                                onClick={() => setProfileOpen(!profileOpen)}
                                className="flex items-center gap-1.5 p-1.5 rounded-full border-2 border-gray-200 hover:border-[#166534]/40 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#166534]/50"
                                aria-label="Profile menu"
                            >
                                <div className="w-8 h-8 rounded-full bg-[#166534] flex items-center justify-center">
                                    <User className="w-4 h-4 text-white" />
                                </div>
                                <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`} />
                            </button>

                            {/* Dropdown */}
                            {profileOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-50">
                                    <div className="px-4 py-2.5 border-b border-gray-100">
                                        <p className="text-sm font-semibold text-gray-900 truncate">{user?.name || "My Account"}</p>
                                        <p className="text-xs text-gray-500 truncate">{user?.email || "user@smartcamping.com"}</p>
                                    </div>

                                    <button
<<<<<<< HEAD
                                        onClick={() => { setProfileOpen(false); navigate(getDashboardPath()); }}
=======
                                        onClick={() => { 
                                            setProfileOpen(false); 
                                            const path = getDashboardPath();
                                            // If owner dashboard, append trigger param
                                            const target = user?.role === 'owner' ? `${path}?profile=open` : path;
                                            navigate(target); 
                                        }}
>>>>>>> 72d49f97b953854ffc2cce76cb28c3b75c102fd7
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#166534]/10 hover:text-[#166534] transition-colors duration-150"
                                    >
                                        <User className="w-4 h-4" />
                                        Profile
                                    </button>


                                    <div className="border-t border-gray-100 mt-1 pt-1">
                                        {(user?.role === "camper" || user?.role === "guide") && (
                                            <button
                                                onClick={() => {
                                                    setProfileOpen(false);
                                                    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
                                                        // We'll need to handle deletion. For now, redirect to dashboard where delete logic exists or implement here.
                                                        // Actually, CamperDashboard has the logic. We'll just navigate to dashboard and trigger it or just use the button there.
                                                        // But the user asked to place it neatly in profile dropdown.
                                                        navigate("/camper-dashboard", { state: { triggerDelete: true } });
                                                    }
                                                }}
                                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors duration-150"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Delete Account
                                            </button>
                                        )}
                                        <button
                                            onClick={() => {
                                                setProfileOpen(false);
                                                logout();
                                                navigate("/login");
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors duration-150"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mobile Hamburger */}
                    <button
                        className="md:hidden p-2 rounded-md text-gray-600 hover:text-[#166534] hover:bg-[#166534]/10 transition-colors"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        aria-label="Toggle menu"
                    >
                        {mobileOpen ? (
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div className="md:hidden border-t border-gray-100 bg-white">
                    <div className="px-4 py-3 space-y-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.label}
                                to={link.href}
                                onClick={() => setMobileOpen(false)}
                                className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${isActive(link.href)
                                        ? "text-[#166534] bg-[#166534]/10"
                                        : "text-gray-600 hover:text-[#166534] hover:bg-[#166534]/10"
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                        {user?.role === "camper" && (
                            <Link
                                to="/payment-history"
                                onClick={() => setMobileOpen(false)}
                                className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${isActive("/payment-history")
                                        ? "text-[#166534] bg-[#166534]/10"
                                        : "text-gray-600 hover:text-[#166534] hover:bg-[#166534]/10"
                                    }`}
                            >
                                Payment
                            </Link>
                        )}
                        {/* Mobile CTA */}
                        <div className="pt-2 border-t border-gray-100">
                            <Link
                                to="/guides"
                                onClick={() => setMobileOpen(false)}
                                className="block w-full text-center px-5 py-2.5 text-sm font-semibold text-white bg-[#166534] rounded-full hover:bg-[#14532d] transition-all duration-200"
                            >
                                Plan Your Adventure
                            </Link>
                        </div>
                        
                        {/* Mobile auth links */}
                        <div className="pt-2 border-t border-gray-100 space-y-1">
                            <Link
                                to="/login"
                                onClick={() => setMobileOpen(false)}
                                className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:text-[#166534] hover:bg-[#166534]/10 transition-colors"
                            >
                                Sign In
                            </Link>
                            <Link
                                to="/signup"
                                onClick={() => setMobileOpen(false)}
                                className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-[#166534] bg-[#166534]/10 hover:bg-[#166534]/20 transition-colors"
                            >
                                Sign Up
                            </Link>
                        </div>


                        {/* Mobile profile links */}
                        <div className="pt-2 border-t border-gray-100 space-y-1">
                            <Link
                                to={getDashboardPath()}
                                onClick={() => setMobileOpen(false)}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:text-[#166534] hover:bg-[#166534]/10 transition-colors"
                            >
                                <User className="w-4 h-4" />
                                Profile
                            </Link>

<<<<<<< HEAD
                            {(user?.role === "camper" || user?.role === "guide") && (
                                <button
                                    onClick={() => {
                                        setMobileOpen(false);
                                        if (window.confirm("Are you sure you want to delete your account?")) {
                                            navigate("/camper-dashboard", { state: { triggerDelete: true } });
                                        }
                                    }}
                                    className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete Account
                                </button>
                            )}

=======
>>>>>>> 72d49f97b953854ffc2cce76cb28c3b75c102fd7
                        </div>


                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
