import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Search, SlidersHorizontal, LayoutGrid, Calendar, Heart, LogOut, ChevronDown } from "lucide-react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

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

// Enrich guide with display data for the WildGuide UI
const enrichGuide = (guide, index) => {
  const specialty = SPECIALTIES[index % SPECIALTIES.length];
  const rating = (4.5 + (guide.experience % 5) * 0.1).toFixed(1);
  const pricePerDay = 80 + guide.experience * 15;
  const skillTags = SPECIALTY_TAGS[specialty] || [guide.language?.toUpperCase(), "CAMPING"];
  return { ...guide, specialty, rating, pricePerDay, skillTags };
};

// Fallback sample guides when API returns empty
const SAMPLE_GUIDES = [
  { _id: "sample-1", name: "Alex Rivers", language: "English", experience: 8, description: "Specializing in capturing the rare moments of Northern wildlife.", availability: true },
  { _id: "sample-2", name: "Sam Night", language: "English", experience: 5, description: "Expert in night hiking and stargazing expeditions.", availability: true },
  { _id: "sample-3", name: "Jordan Peak", language: "English", experience: 12, description: "Mountain survival specialist with decade of experience.", availability: true },
];

// Guide Card Sub-component (receives pre-enriched guide)
const GuideCard = ({ guide, isFavourite, onToggleFavourite }) => {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);
  const imageUrl = `https://picsum.photos/seed/${guide._id || guide.name}/400/280`;

  return (
    <div
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group cursor-pointer"
      onClick={() => navigate(`/guides/${guide._id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") navigate(`/guides/${guide._id}`);
      }}
    >
      {/* Guide image with rating badge */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-green-500 to-emerald-600">
        {!imgError ? (
          <img
            src={imageUrl}
            alt={guide.name}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white text-4xl font-bold">
            {guide.name?.charAt(0)?.toUpperCase() || "?"}
          </div>
        )}
        <div className="absolute top-3 right-3 bg-green-600 text-white px-2.5 py-1 rounded-full text-xs font-bold">
          {guide.rating}
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-900">{guide.name}</h3>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
          {guide.specialty} Expert
        </p>
        {guide.description && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-4">
            {guide.description}
          </p>
        )}

        {/* Skill tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {guide.skillTags?.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 bg-green-50 text-[10px] font-bold text-green-700 rounded uppercase tracking-tighter"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex justify-between items-center gap-3 mt-1">
          <span className="text-sm text-gray-600">
            From <span className="font-bold text-green-600">${guide.pricePerDay}/day</span>
          </span>

          <div className="flex items-center gap-2">
            {/* Favourite */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation(); // don't open profile when favouriting
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

            {/* Hire */}
            <button
              onClick={(e) => {
                e.stopPropagation(); // avoid double navigation when clicking the button
                navigate(`/guides/${guide._id}`);
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-bold text-sm transition-colors"
            >
              Hire Guide
            </button>
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
        // ignore storage errors
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

  const enrichedGuides = useMemo(
    () => guides.map((g, i) => enrichGuide(g, i)),
    [guides]
  );

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
        const res = await axios.get(`${API_URL}/api/guides/display`);
        const data = Array.isArray(res.data) ? res.data : res.data?.guides || res.data?.data || [];
        setGuides(data.length > 0 ? data : SAMPLE_GUIDES);
        setError(null);
      } catch (err) {
        setGuides(SAMPLE_GUIDES);
        setError(null);
        console.error("Guides API error, showing sample data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchGuides();
  }, []);

  const visibleGuides = filteredGuides.slice(0, displayCount);
  const hasMore = filteredGuides.length > displayCount;

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar - WildGuide branding */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col p-6 shrink-0 hidden lg:flex">
        {/* Brand */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white text-lg font-bold shrink-0">
            P
          </div>
          <div>
            <h2 className="text-gray-900 font-bold text-lg">WildGuide</h2>
            <p className="text-gray-500 text-xs">Adventure awaits</p>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 space-y-1">
          {[
            { icon: LayoutGrid, label: "Browse Guides", path: "/guides" },
            { icon: Calendar, label: "My Bookings", path: "/guides/bookings" },
            { icon: Heart, label: "Favorites", path: "/guides/favourites" },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                location.pathname === item.path
                  ? "bg-green-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <item.icon size={18} /> {item.label}
            </button>
          ))}
        </nav>

        <button className="flex items-center gap-3 px-4 py-3 text-red-500 text-sm font-medium hover:bg-red-50 rounded-xl transition-colors mt-auto">
          <LogOut size={18} className="rotate-180" /> Sign Out
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-6xl mx-auto">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Professional Camping Guides
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Discover expert guides for your next wilderness expedition
              </p>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by specialty (e.g. Night Hiking)"
                  className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm w-72 bg-white focus:ring-2 focus:ring-green-500 outline-none focus:border-green-500"
                />
              </div>
              <button className="p-2.5 border border-gray-200 rounded-xl hover:bg-white bg-white transition-colors">
                <SlidersHorizontal size={18} className="text-gray-500" />
              </button>
            </div>
          </header>

          {/* Category Filters */}
          <div className="flex gap-3 overflow-x-auto pb-4 mb-8 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
                <p className="text-sm text-gray-500 font-medium">
                  Loading guides...
                </p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm mb-6">
              {error}
            </div>
          )}

          {/* Empty */}
          {!loading && !error && filteredGuides.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-500 mb-2">No guides found</p>
              <button
                onClick={() => navigate("/guides/add")}
                className="text-green-600 text-sm font-semibold hover:underline"
              >
                Add a new guide →
              </button>
            </div>
          )}

          {/* Guide Cards Grid - 4 columns on xl */}
          {!loading && !error && filteredGuides.length > 0 && (
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
