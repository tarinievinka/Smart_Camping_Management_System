import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
<<<<<<< HEAD
import { Search, SlidersHorizontal, LayoutGrid, Heart, ChevronDown, Star } from "lucide-react";
=======
import { Search, SlidersHorizontal, LayoutGrid, Calendar, Heart, LogOut, ChevronDown, Star } from "lucide-react";
>>>>>>> 72d49f97b953854ffc2cce76cb28c3b75c102fd7
import axios from "axios";
import { resolveMediaUrl } from "../../../utils/resolveMediaUrl";
import { getGuideDailyRate } from "../../../utils/guidePricing";
import { isGuideDoubleLocked, formatAvailableAgainLabel } from "../../../utils/guideAvailability";
import { useToast } from "../../../context/ToastContext";
import { useAuth } from "../../../context/AuthContext";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const NOTIFY_STORAGE_KEY = "guide_notify_interest";

function rememberNotifyInterest(guideId) {
  if (!guideId) return;
  try {
    const raw = localStorage.getItem(NOTIFY_STORAGE_KEY);
    const arr = raw ? JSON.parse(raw) : [];  
    const list = Array.isArray(arr) ? arr : [];
    const id = String(guideId);
    if (!list.includes(id)) {
      list.push(id);
      localStorage.setItem(NOTIFY_STORAGE_KEY, JSON.stringify(list));
    }
  } catch {
    /* ignore */
  }
}

const SPECIALTIES = [
  "Wildlife Photography",
  "Survival Skills",
  "Family Camping",
  "Night Hiking",
  "Mountain Climbing",
];

const SPECIALTY_TAGS = {
  "Wildlife Photography": ["WILDLIFE", "PHOTOGRAPHY"],
  "Survival Skills": ["SURVIVAL", "BUSHCRAFT"],
  "Family Camping": ["FAMILY", "SAFETY"],
  "Night Hiking": ["NIGHT HIKING", "STARGAZING"],
  "Mountain Climbing": ["MOUNTAINS", "CLIMBING"],
};

export const enrichGuide = (guide, index) => {
  const specialty =
    Array.isArray(guide.specialties) && guide.specialties.length > 0
      ? guide.specialties[0]
      : SPECIALTIES[index % SPECIALTIES.length];
  const skillTags =
    Array.isArray(guide.specialties) && guide.specialties.length > 0
      ? guide.specialties.slice(0, 4).map((s) => String(s).toUpperCase().slice(0, 14))
      : SPECIALTY_TAGS[specialty] || [String(guide.language || "Guide").toUpperCase(), "CAMPING"];
  return {
    ...guide,
    specialty,
    pricePerDay: getGuideDailyRate(guide),
    skillTags,
  };
};

export const GuideCard = ({ guide, isFavourite, onToggleFavourite }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuth();
  const [imgError, setImgError] = useState(false);
  const src = resolveMediaUrl(guide.coverPhoto) || resolveMediaUrl(guide.profilePhoto);
  const locked = isGuideDoubleLocked(guide);
  const backOn = formatAvailableAgainLabel(guide);

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all group cursor-pointer ${
        locked ? "opacity-95" : "hover:shadow-md"
      }`}
      onClick={() => navigate(`/guides/${guide._id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") navigate(`/guides/${guide._id}`);
      }}
    >
      <div
        className="relative h-48 overflow-hidden"
        style={{ background: "linear-gradient(to bottom right, #166534, #14532d)" }}
      >
        {src && !imgError ? (
          <img
            src={src}
            alt={guide.name}
            className={`w-full h-full object-cover ${locked ? "grayscale-[0.35]" : ""}`}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white text-4xl font-bold">
            {guide.name?.charAt(0)?.toUpperCase() || "?"}
          </div>
        )}
        {locked && (
          <div className="absolute inset-0 bg-gray-900/45 backdrop-blur-[1px] flex flex-col items-center justify-center gap-1 px-3 text-center z-[5]">
            <span className="text-white text-xs font-black uppercase tracking-[0.2em]">Unavailable</span>
            {backOn ? (
              <span className="text-white/90 text-[11px] font-semibold">Back from {backOn}</span>
            ) : (
              <span className="text-white/80 text-[11px] font-medium">Not taking bookings</span>
            )}
          </div>
        )}
        <div
          className="absolute top-3 right-3 text-white px-2.5 py-1 rounded-full text-xs font-bold z-[6]"
          style={{ backgroundColor: "#166534" }}
        >
          {guide.experience ?? 0}+ yrs
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-900">{guide.name}</h3>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">{guide.specialty} Expert</p>
        
        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex text-[#fbbf24] gap-0.5">
             {[...Array(5)].map((_, i) => (
               <Star key={i} size={14} fill={i < Math.round(guide.averageRating || 0) ? "currentColor" : "none"} strokeWidth={2.5} />
             ))}
          </div>
          <span className="text-[12px] font-black text-slate-400 uppercase tracking-wide mt-0.5">
             {guide.averageRating ? guide.averageRating.toFixed(1) : "0.0"} ({guide.reviewCount || 0} REVIEWS)
          </span>
        </div>
        {guide.description && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-4">{guide.description}</p>
        )}

        <div className="flex flex-wrap gap-1.5 mb-4">
          {guide.skillTags?.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-tighter"
              style={{ backgroundColor: "#f0fdf4", color: "#166534" }}
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex justify-between items-center gap-3 mt-1">
          <span className="text-sm text-gray-600">
            From{" "}
            <span className="font-bold" style={{ color: "#166534" }}>
              LKR {guide.pricePerDay}/day
            </span>
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavourite?.();
              }}
              className={`p-2 rounded-xl border transition-colors ${
                isFavourite
                  ? "bg-red-50 border-red-200 text-red-600"
                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
              aria-label={isFavourite ? "Remove from favourites" : "Add to favourites"}
              title={isFavourite ? "Remove from favourites" : "Add to favourites"}
            >
              <Heart size={18} fill={isFavourite ? "currentColor" : "transparent"} />
            </button>

            {locked ? (
              <div className="flex flex-col items-end gap-2 shrink-0">
                <button
                  type="button"
                  disabled
                  className="px-4 py-2 rounded-xl font-bold text-sm bg-gray-200 text-gray-500 cursor-not-allowed border border-gray-200"
                >
                  Check back soon
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    rememberNotifyInterest(guide._id);
                    showToast("We’ll flag this guide for you — check back or watch your favourites.", {
                      variant: "success",
                      duration: 6000,
                    });
                  }}
                  className="text-xs font-bold text-green-700 hover:text-green-900 underline-offset-2 hover:underline"
                >
                  Notify me
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/guides/${guide._id}`);
                }}
                className="text-white px-4 py-2 rounded-xl font-bold text-sm transition-colors"
                style={{ backgroundColor: "#166534" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#14532d")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#166534")}
              >
                Hire Guide
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const GuideMarketplace = () => {
  const [guides, setGuides] = useState([]);
  const [displayCount, setDisplayCount] = useState(8);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Guides");
  const navigate = useNavigate();
  const location = useLocation();

  const [favourites, setFavourites] = useState(() => {
    try {
      const raw = localStorage.getItem("guide_favourites");
      const parsed = raw ? JSON.parse(raw) : [];
      return new Set(Array.isArray(parsed) ? parsed : []);
    } catch {
      return new Set();
    }
  });

  const toggleFavourite = (guideId) => {
    if (!guideId) return;
    setFavourites((prev) => {
      const next = new Set(prev);
      if (next.has(guideId)) next.delete(guideId);
      else next.add(guideId);
      try {
        localStorage.setItem("guide_favourites", JSON.stringify(Array.from(next)));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const categories = [
    "All Guides",
    "Wildlife Photography",
    "Survival Skills",
    "Family Camping",
    "Night Hiking",
    "Mountain Climbing",
  ];

  const enrichedGuides = useMemo(() => guides.map((g, i) => enrichGuide(g, i)), [guides]);

  const filteredGuides = useMemo(() => {
    let result = [...enrichedGuides];
    if (activeCategory !== "All Guides") {
      result = result.filter((g) => g.specialty === activeCategory);
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (g) =>
          g.name?.toLowerCase().includes(term) ||
          g.language?.toLowerCase().includes(term) ||
          g.description?.toLowerCase().includes(term) ||
          g.specialty?.toLowerCase().includes(term)
      );
    }
    return result;
  }, [enrichedGuides, activeCategory, searchTerm]);

  useEffect(() => {
    const fetchGuides = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(`${API_URL}/api/guides/display`);
        const data = Array.isArray(res.data) ? res.data : res.data?.guides || res.data?.data || [];
        setGuides(data);
      } catch (err) {
        console.error("Guides API error:", err);
        setGuides([]);
        setError("Could not load guides. Check that the server is running.");
      } finally {
        setLoading(false);
      }
    };
    fetchGuides();
  }, []);

  const visibleGuides = filteredGuides.slice(0, displayCount);
  const hasMore = filteredGuides.length > displayCount;

  const navItems = [
    { icon: LayoutGrid, label: "Browse Guides", path: "/guides" },
    { icon: Heart, label: "Favorites", path: "/guides/favourites" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          
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
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search guides..."
                  className="pl-12 pr-4 py-2.5 border border-transparent rounded-[18px] text-sm w-full md:w-64 bg-white/80 outline-none focus:bg-white focus:ring-2 focus:ring-[#166534]/20 transition-all"
                />
              </div>
              <button type="button" className="p-2.5 bg-white/80 hover:bg-white rounded-[16px] transition-colors shadow-sm">
                <SlidersHorizontal size={18} className="text-gray-500" />
              </button>
            </div>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-4 mb-8 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  activeCategory === cat ? "text-white" : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                }`}
                style={activeCategory === cat ? { backgroundColor: "#166534" } : {}}
              >
                {cat}
              </button>
            ))}
          </div>

          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <div
                  className="w-8 h-8 border-4 border-gray-200 rounded-full animate-spin"
                  style={{ borderTopColor: "#166534" }}
                />
                <p className="text-sm text-gray-500 font-medium">Loading guides...</p>
              </div>
            </div>
          )}

          {error && !loading && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm mb-6">{error}</div>
          )}

          {!loading && !error && filteredGuides.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-500 mb-2">No guides found</p>
              <button
                type="button"
                onClick={() => navigate("/guides/add")}
                className="text-sm font-semibold hover:underline"
                style={{ color: "#166534" }}
              >
                Add a new guide →
              </button>
            </div>
          )}

          {!loading && filteredGuides.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {visibleGuides.map((g, idx) => (
                  <GuideCard
                    key={g._id || `guide-${idx}`}
                    guide={g}
                    isFavourite={favourites.has(g._id)}
                    onToggleFavourite={() => toggleFavourite(g._id)}
                  />
                ))}
              </div>
              {hasMore && (
                <div className="flex justify-center mt-8">
                  <button
                    type="button"
                    onClick={() => setDisplayCount((c) => c + 8)}
                    className="inline-flex items-center gap-2 px-6 py-3 border-2 border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Show More Guides <ChevronDown size={18} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default GuideMarketplace;
