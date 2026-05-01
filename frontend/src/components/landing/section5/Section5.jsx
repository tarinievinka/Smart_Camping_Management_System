import React from "react";
import { useNavigate } from "react-router-dom";
import { Star, ShieldCheck, ChevronRight } from "lucide-react";

/**
 * Section5: Expert Guidance Component
 * Features value propositions for guides and a stylized image gallery.
 */
const Section5 = () => {
    const navigate = useNavigate();
    return (
        <section className="py-24 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 lg:items-center gap-16 lg:gap-24">

                    {/* Left Side: Content */}
                    <div className="space-y-8 max-w-xl">
                        <div className="space-y-4">
                            <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight">
                                Expert Guidance for Your Trek
                            </h2>
                            <p className="text-gray-500 text-lg font-medium leading-relaxed">
                                Don't go it alone. Our certified professional guides offer specialized expertise in wilderness survival, local flora, and the best hidden trails.
                            </p>
                        </div>

                        <div className="space-y-4">
                            {/* Benefit Card 1 */}
                            <div className="flex items-center gap-5 p-5 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex-shrink-0 w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
                                    <Star size={28} className="fill-green-600/10" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">Certified Professionals</h3>
                                    <p className="text-gray-400 font-medium">Over 10+ years of mountain experience</p>
                                </div>
                            </div>

                            {/* Benefit Card 2 */}
                            <div className="flex items-center gap-5 p-5 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex-shrink-0 w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
                                    <ShieldCheck size={28} className="fill-green-600/10" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">Safety First Protocols</h3>
                                    <p className="text-gray-400 font-medium">Fully insured and first-aid trained</p>
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={() => navigate('/guides')}
                            className="inline-flex items-center justify-center px-10 py-4 bg-green-600 hover:bg-green-700 text-white font-black rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-95 text-lg group">
                            Meet Our Guides
                            <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    {/* Right Side: Image Grid */}
                    <div className="relative">
                        {/* Background decorative element */}
                        <div className="absolute -inset-4 bg-green-50 rounded-[4rem] -rotate-2 z-0 opacity-50" />

                        <div className="relative z-10 grid grid-cols-2 gap-4">
                            {/* Image 1: Tall */}
                            <div className="space-y-4">
                                <div className="h-80 md:h-[400px] overflow-hidden rounded-3xl shadow-lg">
                                    <img
                                        src="https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=2070&auto=format&fit=crop"
                                        alt="Guide in mountains"
                                        className="w-full h-full object-cover transition-transform hover:scale-105 duration-700"
                                    />
                                </div>
                                {/* Image 3: Wide/Short */}
                                <div className="h-48 md:h-64 overflow-hidden rounded-3xl shadow-lg">
                                    <img
                                        src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070&auto=format&fit=crop"
                                        alt="Ridge trek"
                                        className="w-full h-full object-cover transition-transform hover:scale-105 duration-700"
                                    />
                                </div>
                            </div>

                            {/* Column 2 */}
                            <div className="space-y-4 pt-12">
                                {/* Image 2: Wide/Short */}
                                <div className="h-48 md:h-64 overflow-hidden rounded-3xl shadow-lg">
                                    <img
                                        src="https://images.unsplash.com/photo-1444491741275-3747c53c99b4?q=80&w=1974&auto=format&fit=crop"
                                        alt="Hiker in woods"
                                        className="w-full h-full object-cover transition-transform hover:scale-105 duration-700"
                                    />
                                </div>
                                {/* Image 4: Tall */}
                                <div className="h-80 md:h-[400px] overflow-hidden rounded-3xl shadow-lg">
                                    <img
                                        src="https://images.unsplash.com/photo-1501555088652-021faa106b9b?q=80&w=2073&auto=format&fit=crop"
                                        alt="Guide leading group"
                                        className="w-full h-full object-cover transition-transform hover:scale-105 duration-700"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default Section5;
