import React, { useState } from 'react';
import { Play, MapPin, User, Clock, Search, Filter, PlayCircle, Eye, Share2 } from 'lucide-react';
import Navbar from '../../common/navbar/Navbar';

const dummyBlogs = [
    {
        id: 1,
        title: "Discovering Hidden Trails in the Rockies",
        camperName: "Alex Rivers",
        location: "Rocky Mountain National Park",
        date: "Oct 12, 2023",
        duration: "12:45",
        views: "1.2k",
        thumbnail: "https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&q=80&w=800",
        avatar: "https://ui-avatars.com/api/?name=Alex+Rivers&background=166534&color=fff"
    },
    {
        id: 2,
        title: "Weekend Getaway at the Whispering Pines",
        camperName: "Sarah M.",
        location: "Whispering Pines Campground",
        date: "Nov 05, 2023",
        duration: "08:30",
        views: "856",
        thumbnail: "https://images.unsplash.com/photo-1504280327315-5679d04b68bb?auto=format&fit=crop&q=80&w=800",
        avatar: "https://ui-avatars.com/api/?name=Sarah+M&background=166534&color=fff"
    },
    {
        id: 3,
        title: "Lakeside Campfire & Star Gazing",
        camperName: "The Nomad Family",
        location: "Crater Lake",
        date: "Dec 21, 2023",
        duration: "15:20",
        views: "3.4k",
        thumbnail: "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&q=80&w=800",
        avatar: "https://ui-avatars.com/api/?name=Nomad+Family&background=166534&color=fff"
    },
    {
        id: 4,
        title: "Survival Skills: Cooking in the Wild",
        camperName: "David Survivalist",
        location: "Denali National Park",
        date: "Jan 14, 2024",
        duration: "21:10",
        views: "5.1k",
        thumbnail: "https://images.unsplash.com/photo-1517824806704-9040b037703b?auto=format&fit=crop&q=80&w=800",
        avatar: "https://ui-avatars.com/api/?name=David+S&background=166534&color=fff"
    },
    {
        id: 5,
        title: "Sunrise Hike to Angels Landing",
        camperName: "Elena V.",
        location: "Zion National Park",
        date: "Feb 02, 2024",
        duration: "14:05",
        views: "2.8k",
        thumbnail: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800",
        avatar: "https://ui-avatars.com/api/?name=Elena+V&background=166534&color=fff"
    },
    {
        id: 6,
        title: "Best Gear For Winter Camping",
        camperName: "Tech & Trails",
        location: "Mount Rainier",
        date: "Mar 10, 2024",
        duration: "18:45",
        views: "4.2k",
        thumbnail: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&q=80&w=800",
        avatar: "https://ui-avatars.com/api/?name=Tech+Trails&background=166534&color=fff"
    }
];

const Blogs = () => {
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            {/* Hero Section */}
            <div className="relative py-24 px-6 sm:px-12 lg:px-24">
                {/* Background Photo */}
                <div 
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&q=80&w=2000")' }}
                ></div>
                
                {/* Dark Overlay for Readability */}
                <div className="absolute inset-0 bg-black/50"></div>

                {/* Abstract Background Pattern */}
                <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
                
                <div className="relative z-10 max-w-7xl mx-auto flex flex-col items-center text-center">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight mb-6 mt-4">
                        Camper <span className="text-green-300">Video Blogs</span>
                    </h1>
                    <p className="text-lg md:text-xl text-green-50 max-w-2xl mb-10 leading-relaxed">
                        Immerse yourself in authentic camping experiences. Watch scenic trails, gear reviews, and campfire stories shared by our diverse community of campers.
                    </p>

                    {/* Search and Filter */}
                    <div className="w-full max-w-3xl flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input 
                                type="text"
                                placeholder="Search places, campers, or videos..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 border-0 ring-1 ring-inset ring-gray-200 shadow-xl focus:ring-2 focus:ring-[#166534] transition-all bg-white"
                            />
                        </div>
                        <button className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm transition-all shadow-xl font-semibold">
                            <Filter className="w-5 h-5" />
                            Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Video Grid Section */}
            <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Trending Now</h2>
                    <div className="flex gap-2">
                        <button className="text-sm font-semibold text-[#166534] bg-[#166534]/10 px-4 py-2 rounded-full hover:bg-[#166534]/20 transition-colors">Latest</button>
                        <button className="text-sm font-semibold text-gray-600 hover:text-[#166534] px-4 py-2 transition-colors">Popular</button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {dummyBlogs.map((blog) => (
                        <div key={blog.id} className="group flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                            
                            {/* Card Video Thumbnail Container */}
                            <div className="relative h-60 w-full overflow-hidden bg-gray-900">
                                <img 
                                    src={blog.thumbnail} 
                                    alt={blog.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                                    loading="lazy"
                                />
                                {/* Play Button Overlay */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-[#166534]/90 group-hover:scale-110 transition-all duration-300 shadow-xl cursor-pointer">
                                        <Play className="w-8 h-8 text-white ml-1" fill="currentColor" />
                                    </div>
                                </div>
                                {/* Duration Badge */}
                                <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded text-xs font-bold text-white flex items-center gap-1">
                                    {blog.duration}
                                </div>
                            </div>

                            {/* Card Content */}
                            <div className="p-6 flex flex-col flex-1">
                                {/* Title */}
                                <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-[#166534] transition-colors cursor-pointer">
                                    {blog.title}
                                </h3>

                                {/* Location Details */}
                                <div className="flex items-center gap-1.5 text-gray-600 mb-4 text-sm font-medium">
                                    <MapPin className="w-4 h-4 text-[#166534]" />
                                    <span className="truncate">{blog.location}</span>
                                </div>

                                {/* Divider */}
                                <div className="h-px w-full bg-gray-100 my-4 mt-auto"></div>

                                {/* Footer (Camper info and metrics) */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 cursor-pointer">
                                        <img 
                                            src={blog.avatar} 
                                            alt={blog.camperName} 
                                            className="w-8 h-8 rounded-full border border-gray-200" 
                                        />
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-gray-900 leading-tight">{blog.camperName}</span>
                                            <span className="text-xs text-gray-500 font-medium">{blog.date}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 text-gray-400">
                                        <div className="flex items-center gap-1 hover:text-[#166534] transition-colors cursor-pointer">
                                            <Eye className="w-4 h-4" />
                                            <span className="text-xs font-semibold">{blog.views}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Load More Button */}
                <div className="w-full flex justify-center mt-12">
                    <button className="flex items-center gap-2 px-8 py-3 rounded-full bg-white border-2 border-gray-200 text-gray-700 font-bold hover:border-[#166534] hover:text-[#166534] transition-all duration-200 shadow-sm hover:shadow-md">
                        Load More Videos
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Blogs;
