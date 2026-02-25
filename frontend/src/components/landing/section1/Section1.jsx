import React from "react";
import { Sun } from "lucide-react";

/**
 * Section1: Landing Page Hero Component
 * Features a cinematic background, rich typography, a custom weather status banner, 
 * and primary call-to-action buttons.
 */
const Section1 = () => {
    return (
        <section className="relative h-screen min-h-[700px] w-full flex items-center justify-center overflow-hidden">
            {/* Background Image with Overlay */}
            <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
                style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=2070&auto=format&fit=crop')`,
                }}
            >
                <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"></div>
            </div>

            {/* Content Container */}
            <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">

                {/* Main Headline */}
                <div className="relative inline-block mb-6">
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-tight tracking-tighter">
                        Your Gateway to the
                        <span className="block text-green-500 mt-2">Great Outdoors</span>
                    </h1>

    
                </div>

                {/* Weather Forecast Banner */}
                <div className="flex justify-center mb-10">
                    <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 px-6 py-2.5 rounded-full text-white/90 transform hover:scale-105 transition-all cursor-default">
                        <div className="flex items-center gap-2">
                            <span className="text-green-500 font-black tracking-widest text-sm">PARTLY_</span>
                            <Sun size={18} className="text-yellow-400 animate-pulse" />
                        </div>
                        <div className="w-[1px] h-4 bg-white/20"></div>
                        <span className="text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase">
                            AI-Powered Weather Forecasting Enabled
                        </span>
                    </div>
                </div>

                {/* Subtext */}
                <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
                    Manage, book, and explore with the <span className="text-white font-bold">Smart Camping Management System</span>.
                    A professional MERN stack solution for modern adventurers.
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button className="w-full sm:w-auto px-10 py-4 bg-green-600 hover:bg-green-500 text-white font-black rounded-2xl shadow-[0_10px_30px_-10px_rgba(22,163,74,0.5)] transition-all hover:-translate-y-1 active:scale-95 text-lg">
                        Start Exploration
                    </button>
                    <button className="w-full sm:w-auto px-10 py-4 bg-gray-900/80 hover:bg-gray-900 text-white font-black rounded-2xl border border-white/10 backdrop-blur-sm transition-all hover:-translate-y-1 active:scale-95 text-lg">
                        View Demo
                    </button>
                </div>
            </div>

            {/* Decorative Gradient Bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent"></div>
        </section>
    );
};

export default Section1;
