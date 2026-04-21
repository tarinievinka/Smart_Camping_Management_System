import React from "react";
import { MapPin, Sun, Cloud, CloudRain, ChevronRight } from "lucide-react";

/**
 * Data for available camping sites.
 * In a real app, this would come from an API.
 */
const sites = [
    {
        id: 1,
        name: "Pine Ridge Sanctuary",
        location: "Oregon, USA",
        price: 45,
        image: "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?q=80&w=2070&auto=format&fit=crop",
        status: "LIVE AVAILABILITY",
        statusType: "success",
        weather: { icon: Sun, label: "Sunny", temp: 24 }
    },
    {
        id: 2,
        name: "Emerald Lake Basecamp",
        location: "British Columbia, CA",
        price: 60,
        image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=2070&auto=format&fit=crop",
        status: "2 SPOTS LEFT",
        statusType: "warning",
        weather: { icon: Cloud, label: "Partly Cloudy", temp: 18 }
    },
    {
        id: 3,
        name: "Mist Valley Retreat",
        location: "Scottish Highlands",
        price: 35,
        image: "https://images.unsplash.com/photo-1476041800959-2f6bb412c8ce?q=80&w=2070&auto=format&fit=crop",
        status: "LIVE AVAILABILITY",
        statusType: "success",
        weather: { icon: CloudRain, label: "Misty Rain", temp: 14 }
    }
];

const Section3 = () => {
    return (
        <section className="py-24 bg-gray-50/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <div className="space-y-2">
                        <h2 className="text-4xl font-bold text-gray-900 tracking-tight">
                            Discover Available Sites
                        </h2>
                        <p className="text-gray-500 font-medium">
                            Real-time availability for the best nature spots.
                        </p>
                    </div>
                    <a href="/all-sites" className="flex items-center gap-1 text-green-700 font-bold hover:gap-2 transition-all group">
                        View all <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </a>
                </div>

                {/* Sites Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {sites.map((site) => (
                        <div
                            key={site.id}
                            className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full"
                        >
                            {/* Image Container */}
                            <div className="relative h-64 overflow-hidden">
                                <img
                                    src={site.image}
                                    alt={site.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute top-4 left-4">
                                    <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black tracking-wider uppercase ${site.statusType === 'success'
                                        ? 'bg-green-600 text-white'
                                        : 'bg-green-900 text-white'
                                        }`}>
                                        {site.statusType === 'success' ? (
                                            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                        ) : (
                                            <span className="text-xs">⚠️</span>
                                        )}
                                        {site.status}
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 flex flex-col flex-grow">
                                <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">
                                    {site.name}
                                </h3>
                                <div className="flex items-center gap-1 text-gray-400 text-sm mb-6">
                                    <MapPin size={14} />
                                    <span>{site.location}</span>
                                </div>

                                {/* Weather Forecast Banner */}
                                <div className="bg-green-50/50 border border-green-100 rounded-xl p-3 flex items-center gap-3 mb-8">
                                    <div className="bg-white p-2 rounded-lg text-green-600 shadow-sm">
                                        <site.weather.icon size={18} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Forecast</span>
                                        <span className="text-sm font-bold text-gray-700">
                                            {site.weather.label}, {site.weather.temp}°C
                                        </span>
                                    </div>
                                </div>

                                {/* Footer / Price & CTA */}
                                <div className="mt-auto flex items-center justify-between">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-2xl font-black text-green-700">LKR {site.price}</span>
                                        <span className="text-gray-400 text-sm font-medium">/night</span>
                                    </div>
                                    <button className="px-6 py-2.5 bg-green-100 hover:bg-green-200 text-green-800 font-bold rounded-xl transition-colors">
                                        Book Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Section3;
