import React, { useState } from "react";

const navLinks = [
    { label: "Home", href: "/" },
    { label: "Campsites", href: "/campsites" },
    { label: "Equipment", href: "/equipment" },
    { label: "Guides", href: "/guides" },
    { label: "Dashboard", href: "/dashboard" },
];

const Navbar = () => {
    const [activeLink, setActiveLink] = useState("Home");
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <nav className="w-full bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <a href="/" className="flex items-center gap-2 shrink-0">
                        <svg
                            className="w-9 h-9"
                            viewBox="0 0 40 40"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <rect width="40" height="40" rx="8" fill="#166534" />
                            <path
                                d="M20 8L30 28H10L20 8Z"
                                fill="#22c55e"
                                stroke="white"
                                strokeWidth="1"
                            />
                            <path
                                d="M14 16L22 28H6L14 16Z"
                                fill="#15803d"
                                stroke="white"
                                strokeWidth="1"
                            />
                            <rect
                                x="18"
                                y="24"
                                width="4"
                                height="4"
                                rx="0.5"
                                fill="white"
                            />
                        </svg>
                        <span className="text-xl font-bold text-gray-900 tracking-tight">
                            Smart Camping
                        </span>
                    </a>

                    {/* Desktop nav links */}
                    <div className="hidden md:flex items-center gap-8 ml-10">
                        {navLinks.map((link) => (
                            <a
                                key={link.label}
                                href={link.href}
                                onClick={(e) => {
                                    e.preventDefault();
                                    setActiveLink(link.label);
                                }}
                                className={`text-sm font-medium transition-colors duration-200 pb-0.5 ${activeLink === link.label
                                        ? "text-green-700 border-b-2 border-green-700"
                                        : "text-gray-600 hover:text-green-700"
                                    }`}
                            >
                                {link.label}
                            </a>
                        ))}
                    </div>

                    {/* Right side — search + CTA */}
                    <div className="hidden md:flex items-center gap-4 ml-auto pl-8">
                        {/* Search icon */}
                        <button
                            className="p-2 rounded-full text-gray-500 hover:text-green-700 hover:bg-green-50 transition-colors duration-200"
                            aria-label="Search"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-5 h-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
                                />
                            </svg>
                        </button>

                        {/* CTA */}
                        <a
                            href="/plan"
                            className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-white bg-green-700 rounded-full hover:bg-green-800 active:bg-green-900 shadow-md hover:shadow-lg transition-all duration-200"
                        >
                            Plan Your Adventure
                        </a>
                    </div>

                    {/* Mobile hamburger */}
                    <button
                        className="md:hidden p-2 rounded-md text-gray-600 hover:text-green-700 hover:bg-green-50 transition-colors"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        aria-label="Toggle menu"
                    >
                        {mobileOpen ? (
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        ) : (
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            </svg>
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileOpen && (
                <div className="md:hidden border-t border-gray-100 bg-white">
                    <div className="px-4 py-3 space-y-2">
                        {navLinks.map((link) => (
                            <a
                                key={link.label}
                                href={link.href}
                                onClick={(e) => {
                                    e.preventDefault();
                                    setActiveLink(link.label);
                                    setMobileOpen(false);
                                }}
                                className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${activeLink === link.label
                                        ? "text-green-700 bg-green-50"
                                        : "text-gray-600 hover:text-green-700 hover:bg-green-50"
                                    }`}
                            >
                                {link.label}
                            </a>
                        ))}
                        <div className="pt-2 border-t border-gray-100">
                            <a
                                href="/plan"
                                className="block w-full text-center px-5 py-2.5 text-sm font-semibold text-white bg-green-700 rounded-full hover:bg-green-800 transition-all duration-200"
                            >
                                Plan Your Adventure
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
