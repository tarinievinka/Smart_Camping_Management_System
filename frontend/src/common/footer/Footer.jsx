import React from "react";
import { Globe, Mail, Share2, Send } from "lucide-react";

/**
 * Footer component for the Smart Camping Management System.
 * Matches the design with branding, project details, quick links, and newsletter.
 */
const Footer = () => {
    return (
        <footer className="bg-gray-50 border-t border-gray-200 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

                    {/* Column 1: Branding */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                            <div className="bg-green-700 p-1.5 rounded-lg">
                                <svg
                                    className="w-6 h-6 text-white"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
                                </svg>
                            </div>
                            <span className="text-xl font-bold text-gray-900">Smart Camping</span>
                        </div>
                        <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
                            A modern solution for outdoor management. Built with passion for the Great Outdoors.
                        </p>
                        <div className="flex gap-4">
                            {[Globe, Mail, Share2].map((Icon, index) => (
                                <button
                                    key={index}
                                    className="p-2.5 rounded-full border border-gray-200 text-gray-400 hover:text-green-700 hover:border-green-200 hover:bg-green-50 transition-all duration-200"
                                >
                                    <Icon size={18} />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Column 2: Project Details */}
                    <div>
                        <h3 className="text-gray-900 font-bold mb-6"> Contact us</h3>
                        <ul className="space-y-4 text-sm">
                            <li className="flex gap-2">
                                
                                <span className="text-gray-600">facebook</span>
                            </li>
                            
                            <li className="flex gap-2">
                                
                                <span className="text-gray-600">instagram</span>
                            </li>
                            <li className="flex gap-2">
                                
                                <span className="text-gray-600">whatsapp</span>
                            </li>
                            
                        </ul>
                    </div>

                    {/* Column 3: Quick Links */}
                    <div>
                        <h3 className="text-gray-900 font-bold mb-6">Quick Links</h3>
                        <ul className="space-y-4 text-sm">
                            {["Find a Campsite", "Equipment Catalog", "Our Guides", "User Dashboard"].map((link) => (
                                <li key={link}>
                                    <a href={`/${link.toLowerCase().replace(/\s+/g, '-')}`} className="text-gray-600 hover:text-green-700 transition-colors">
                                        {link}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 4: Newsletter */}
                    <div>
                        <h3 className="text-gray-900 font-bold mb-6">Newsletter</h3>
                        <p className="text-gray-500 text-sm mb-6">
                            Get the latest trail updates and gear reviews.
                        </p>
                        <div className="relative group">
                            <input
                                type="email"
                                placeholder="Email"
                                className="w-full bg-slate-100/50 border-none rounded-xl py-3 pl-4 pr-12 text-sm focus:ring-2 focus:ring-green-500 transition-all outline-none"
                            />
                            <button className="absolute right-1 top-1 bottom-1 bg-green-600 hover:bg-green-700 text-white px-3 rounded-lg flex items-center justify-center transition-colors">
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-gray-100 text-center">
                    <p className="text-gray-400 text-sm">
                        © 2024 Smart Camping Management System. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
