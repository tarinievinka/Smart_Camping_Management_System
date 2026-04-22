import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  LayoutGrid, Heart, LogOut, SlidersHorizontal,
  Search, Bell, Settings, ArrowRight, Star, Map, ChevronDown
} from "lucide-react";
import { GuideCard, enrichGuide } from "./GuideBooking";

const CATEGORIES = ["All Experts", "Mountaineering", "Photography", "Survivalists"];
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const Favourites = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("All Experts");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favouriteGuides, setFavouriteGuides] = useState([]);

  useEffect(() => {
    const fetchFavourites = async () => {
      try {
        setLoading(true);
        setError(null);

        const raw = localStorage.getItem("guide_favourites");
        const parsed = raw ? JSON.parse(raw) : [];
        const guideIds = new Set(Array.isArray(parsed) ? parsed : []);

        if (guideIds.size === 0) {
          setFavouriteGuides([]);
          return;
        }

        const res = await axios.get(`${API_URL}/api/guides/display`);
        const guides = Array.isArray(res.data) ? res.data : res.data?.guides || res.data?.data || [];

        setFavouriteGuides(guides.filter((g) => guideIds.has(g._id)));
      } catch {
        setError("Failed to load favourites.");
        setFavouriteGuides([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFavourites();
  }, []);

  const removeFavourite = (guideId) => {
    try {
      const raw = localStorage.getItem("guide_favourites");
      const parsed = raw ? JSON.parse(raw) : [];
      const existing = Array.isArray(parsed) ? parsed : [];

      const next = existing.filter((id) => id !== guideId);
      localStorage.setItem("guide_favourites", JSON.stringify(next));
      setFavouriteGuides((prev) => prev.filter((g) => g._id !== guideId));
    } catch {
      // ignore storage errors
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("auth_session");
    localStorage.removeItem("role");
    navigate("/guides");
  };

  const navItems = [
    { icon: LayoutGrid, label: "Browse Guides", path: "/guides" },
    { icon: Heart, label: "Favorites", path: "/guides/favourites" },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FB] font-sans text-gray-900">
      <main className="py-10 px-4 sm:px-6 lg:px-8 overflow-y-auto relative">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="mb-10">
            <h1 className="text-5xl font-black text-gray-900 tracking-tight mb-2">Saved Expeditions</h1>
            <p className="text-gray-500 font-medium tracking-wide">Your curated collection of wilderness experts.</p>
          </div>

          {/* Modern Tab Navigation & Search Bar Integrated */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12 p-1.5 bg-gray-200/50 rounded-[24px] w-full">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              {navItems.map(item => (
                <button 
                  key={item.label} 
                  onClick={() => navigate(item.path)} 
                  className={`flex items-center gap-2.5 px-6 py-3 rounded-[18px] text-sm font-bold transition-all duration-200 whitespace-nowrap ${
                    location.pathname === item.path 
                      ? "bg-white text-[#166534] shadow-sm scale-[1.02]" 
                      : "text-gray-500 hover:text-gray-900 hover:bg-white/50"
                  }`}
                >
                  <item.icon size={18} /> 
                  {item.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 px-2 shrink-0">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search guides..."
                  className="pl-12 pr-4 py-2.5 border border-transparent rounded-[18px] text-sm w-full md:w-64 bg-white/80 outline-none focus:bg-white focus:ring-2 focus:ring-[#166534]/20 transition-all"
                />
              </div>
              <button type="button" className="p-2.5 bg-white/80 hover:bg-white rounded-[16px] transition-colors shadow-sm">
                <SlidersHorizontal size={18} className="text-gray-500" />
              </button>
            </div>
          </div>

          {/* Filters & Sort */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveTab(cat)}
                  className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
                    activeTab === cat
                      ? "text-white shadow-sm"
                      : "bg-[#DFE5EE] text-[#6B7C93] hover:bg-[#d0d7e3]"
                  }`}
                  style={activeTab === cat ? { backgroundColor: '#166534' } : {}}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 tracking-wider">
              SORT BY: <span className="flex items-center gap-1 cursor-pointer" style={{ color: '#166534' }}>Rating <ChevronDown size={14} /></span>
            </div>
          </div>

          {/* Loading / Empty States */}
          {loading && (
            <div className="py-20 text-center text-gray-400 font-extrabold text-xl animate-pulse">
              Loading Favorites...
            </div>
          )}
          {error && (
            <div className="py-20 text-center text-red-500 font-bold text-lg">
              {error}
            </div>
          )}
          {!loading && !error && favouriteGuides.length === 0 && (
            <div className="py-20 text-center">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart size={32} className="text-gray-400" />
              </div>
              <p className="text-gray-500 font-bold text-lg">No saved experts yet.</p>
              <button onClick={() => navigate('/guides')} className="font-bold mt-2 hover:underline" style={{ color: '#166534' }}>
                Browse Guides
              </button>
            </div>
          )}

          {/* Guide Cards Grid */}
          {!loading && !error && favouriteGuides.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {favouriteGuides.map((guide, idx) => (
                <GuideCard
                  key={guide._id}
                  guide={enrichGuide(guide, idx)}
                  isFavourite={true}
                  onToggleFavourite={() => removeFavourite(guide._id)}
                />
              ))}
            </div>
          )}

        </div>

        {/* Floating Map Icon */}
        <button className="fixed bottom-8 right-8 w-14 h-14 rounded-full flex items-center justify-center hover:-translate-y-1 transition-transform z-50" style={{ backgroundColor: '#166534', boxShadow: '0 8px 20px rgba(22,101,52,0.3)' }}>
          <Map size={24} className="text-white" />
        </button>

      </main>
    </div>
  );
};

export default Favourites;