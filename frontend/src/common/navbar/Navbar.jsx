import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { User, CreditCard, LogOut, ChevronDown } from "lucide-react";

const navLinks = [
    { label: "Home", href: "/" },
    { label: "Campsites", href: "/campsites" },
    { label: "Equipment", href: "/equipment" },
    { label: "Guides", href: "/guides" },
    { label: "Blogs", href: "/blogs" },
];

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const profileRef = useRef(null);

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
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <nav className="w-full bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2.5 shrink-0">
                        <svg className="w-10 h-10" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 32 C4 23 11 16 20 16 C29 16 36 23 36 32 Z" fill="#4ade80" />
                            <path d="M23 32 C 23 25, 15 26, 17 21 C 18 19, 21.5 17, 20 15" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                        </svg>
                        <div className="flex flex-col justify-center">
                            <span className="text-[1.35rem] font-black text-[#166534] tracking-widest uppercase leading-none">CAMPTRAIL</span>
                            <span className="text-[0.95rem] font-bold text-[#166534] tracking-[0.3em] leading-none mt-1">360</span>
                        </div>
                    </Link>

                    {/* Desktop Nav Links */}
                    <div className="hidden md:flex items-center gap-8 ml-10">
                        {navLinks.map((link) => (
                            <Link
                                key={link.label}
                                to={link.href}
                                onClick={() => setMobileOpen(false)}
                                className={`text-sm font-medium transition-colors duration-200 pb-0.5 ${isActive(link.href)
                                        ? "text-[#166534] border-b-2 border-[#166534]"
                                        : "text-gray-600 hover:text-[#166534]"
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Right Side — Search + CTA + Profile */}
                    <div className="hidden md:flex items-center gap-4 ml-auto pl-8">

                        {/* Search Icon */}
                        <button
                            className="p-2 rounded-full text-gray-500 hover:text-[#166534] hover:bg-[#166534]/10 transition-colors duration-200"
                            aria-label="Search"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
                            </svg>
                        </button>

                        {/* Auth Buttons */}
                        <div className="flex items-center gap-3 mr-2">
                            <Link
                                to="/login"
                                className="text-sm font-medium text-gray-600 hover:text-[#166534] transition-colors duration-200"
                            >
                                Sign In
                            </Link>
                            <Link
                                to="/register"
                                className="text-sm font-medium text-[#166534] bg-[#166534]/10 px-4 py-2 rounded-full hover:bg-[#166534]/20 transition-colors duration-200"
                            >
                                Sign Up
                            </Link>
                        </div>



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
                                        <p className="text-sm font-semibold text-gray-900">My Account</p>
                                        <p className="text-xs text-gray-500">user@smartcamping.com</p>
                                    </div>

                                    <button
                                        onClick={() => { setProfileOpen(false); navigate("/profile"); }}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#166534]/10 hover:text-[#166534] transition-colors duration-150"
                                    >
                                        <User className="w-4 h-4" />
                                        Profile
                                    </button>

                                    <button
                                        onClick={() => { setProfileOpen(false); navigate("/payment-history"); }}
                                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-150 ${isActive("/payment-history")
                                                ? "text-[#166534] bg-[#166534]/10 font-semibold"
                                                : "text-gray-700 hover:bg-[#166534]/10 hover:text-[#166534]"
                                            }`}
                                    >
                                        <CreditCard className="w-4 h-4" />
                                        Payment
                                    </button>

                                    <div className="border-t border-gray-100 mt-1 pt-1">
                                        <button
                                            onClick={() => setProfileOpen(false)}
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
                                to="/register"
                                onClick={() => setMobileOpen(false)}
                                className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-[#166534] bg-[#166534]/10 hover:bg-[#166534]/20 transition-colors"
                            >
                                Sign Up
                            </Link>
                        </div>

                        {/* Mobile profile links */}
                        <div className="pt-2 border-t border-gray-100 space-y-1">
                            <Link
                                to="/profile"
                                onClick={() => setMobileOpen(false)}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:text-[#166534] hover:bg-[#166534]/10 transition-colors"
                            >
                                <User className="w-4 h-4" />
                                Profile
                            </Link>
                            <Link
                                to="/payment-history"
                                onClick={() => setMobileOpen(false)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive("/payment-history")
                                        ? "text-[#166534] bg-[#166534]/10"
                                        : "text-gray-600 hover:text-[#166534] hover:bg-[#166534]/10"
                                    }`}
                            >
                                <CreditCard className="w-4 h-4" />
                                Payment
                            </Link>
                        </div>


                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
