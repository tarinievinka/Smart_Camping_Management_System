import React, { useEffect, useState } from "react";
import axios from "axios";
import { Star, Calendar, User, Package, MapPin, ArrowLeft } from "lucide-react";
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, Cell
} from 'recharts';
import { useNavigate } from 'react-router-dom';


const TAB_CONFIG = {
  "Guides Ratings": {
    filter: "guide",
    icon: User,
    chartTitle: "Guides Rating Chart",
    chartSubtitle: "Visual representation of guide ratings",
    listTitle: "Top Rated Guides",
    listSubtitle: "Highest rated guides based on customer reviews",
  },
  "Equipment Ratings": {
    filter: "equipment",
    icon: Package,
    chartTitle: "Equipment Rating Chart",
    chartSubtitle: "Visual representation of equipment ratings",
    listTitle: "Top Rated Equipment",
    listSubtitle: "Highest rated equipment based on customer reviews",
  },
  "Locations Ratings": {
    filter: "campsite",
    icon: MapPin,
    chartTitle: "Locations Rating Chart",
    chartSubtitle: "Visual representation of location ratings",
    listTitle: "Top Rated Locations",
    listSubtitle: "Highest rated camping locations based on customer reviews",
  },
};

const AdminFeedback = () => {
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState([]);
  const [guides, setGuides] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [campsites, setCampsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Guides Ratings");

  const extractArray = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.results)) return payload.results;
    return [];
  };

  const getNumber = (value, fallback = 0) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : fallback;
  };

  const fetchData = () => {
    setLoading(true);
    const feedbackUrl = process.env.REACT_APP_FEEDBACK_API_URL || "http://localhost:5000/api/feedback/display";
    const guidesUrl = process.env.REACT_APP_GUIDES_API_URL || "http://localhost:5000/api/guides/display";
    const equipmentUrl = process.env.REACT_APP_EQUIPMENT_API_URL || "http://localhost:5000/api/equipment/display";
    const campsitesUrl = "http://localhost:5000/api/campsites";

    let fetchedCount = 0;
    const checkDone = () => {
      fetchedCount++;
      if (fetchedCount === 4) setLoading(false);
    };

    axios.get(feedbackUrl)
      .then(res => setFeedbacks(extractArray(res?.data)))
      .catch(err => { console.error("Error fetching feedback:", err); setFeedbacks([]); })
      .finally(checkDone);

    axios.get(guidesUrl)
      .then(res => setGuides(extractArray(res?.data)))
      .catch(err => { console.error("Error fetching guides:", err); setGuides([]); })
      .finally(checkDone);

    axios.get(equipmentUrl)
      .then(res => setEquipment(extractArray(res?.data)))
      .catch(err => { console.error("Error fetching equipment:", err); setEquipment([]); })
      .finally(checkDone);

    axios.get(campsitesUrl)
      .then(res => setCampsites(extractArray(res?.data)))
      .catch(err => { console.error("Error fetching campsites:", err); setCampsites([]); })
      .finally(checkDone);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const activeConfig = TAB_CONFIG[activeTab];
  const targetFilter = activeConfig.filter;

  const filteredFeedbacks = feedbacks.filter((f) =>
    String(f.targetType || '').toLowerCase().includes(targetFilter)
  );

  const guideEntities = guides.map((item, index) => ({
    subject: item.name || "Unknown Guide",
    rating: getNumber(item.averageRating || item.rating, 0),
    reviews: getNumber(item.reviewCount || item.totalReviews, 0),
  }));

  const equipmentEntities = equipment.map((item, index) => ({
    subject: item.name || "Unknown Equipment",
    rating: getNumber(item.averageRating || item.rating, 0),
    reviews: getNumber(item.reviewCount || item.totalReviews, 0),
  }));

  const campsiteEntities = campsites.map((item, index) => ({
    subject: item.name || "Unknown Campsite",
    rating: getNumber(item.averageRating || item.rating, 0),
    reviews: getNumber(item.reviewCount || item.totalReviews, 0),
  }));

  const feedbackEntities = Object.values(
    filteredFeedbacks.reduce((acc, item) => {
      const key = item.targetName || item.targetId || item._id || 'unknown';
      if (!acc[key]) {
        acc[key] = { ratings: [], reviews: 0, name: item.targetName || item.title || 'Unknown' };
      }
      acc[key].ratings.push(getNumber(item.rating, 0));
      acc[key].reviews += 1;
      return acc;
    }, {})
  ).map((entry) => {
    const avg = entry.ratings.length
      ? entry.ratings.reduce((sum, val) => sum + val, 0) / entry.ratings.length
      : 0;
    return {
      subject: entry.name,
      rating: Number(avg.toFixed(1)),
      reviews: entry.reviews,
    };
  });

  const rawEntities = activeTab === "Guides Ratings"
    ? (guideEntities.length ? guideEntities : feedbackEntities)
    : activeTab === "Equipment Ratings"
      ? (equipmentEntities.length ? equipmentEntities : feedbackEntities)
      : (campsiteEntities.length ? campsiteEntities : feedbackEntities);

  const sortedEntities = rawEntities
    .filter((item) => item.rating > 0)
    .sort((a, b) => b.rating - a.rating);

  const barChartData = sortedEntities.length
    ? sortedEntities.slice(0, 10).map((item) => ({ subject: item.subject || "Unknown", rating: item.rating }))
    : [];

  const topRatedData = sortedEntities.length
    ? sortedEntities.slice(0, 5).map((item, index) => ({
      rank: index + 1,
      name: item.subject || "Unknown",
      subtitle: "Customer Average",
      rating: item.rating,
      reviews: getNumber(item.reviews, 0),
    }))
    : [];

  const tabNames = Object.keys(TAB_CONFIG);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="p-4 md:p-8">
        <div className="max-w-[1280px] mx-auto bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">

          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-4xl font-extrabold text-[#0f172a] mb-1 leading-tight tracking-tight">Ratings Analysis Dashboard</h1>
              <p className="text-[#64748b] font-medium text-base">Smart Camping Management System Performance Overview</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/admin-dashboard")}
                className="flex items-center gap-2 text-[#64748b] hover:text-[#0f172a] font-bold transition-colors mr-4"
              >
                <ArrowLeft size={20} />
                Back
              </button>
              <button
                onClick={() => navigate("/admin/all-reviews")}
                className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 border border-transparent rounded-xl text-sm font-bold text-white shadow-sm hover:bg-slate-800 transition-colors"
              >
                View All Reviews
              </button>
            </div>
          </div>

          {/* Tabs Section */}
          <div className="bg-slate-100 p-1.5 rounded-2xl flex flex-col md:flex-row mb-8 border border-slate-200 shadow-inner">
            {tabNames.map((tabName) => {
              const Icon = TAB_CONFIG[tabName].icon;
              const isActive = activeTab === tabName;
              return (
                <button
                  key={tabName}
                  onClick={() => setActiveTab(tabName)}
                  className={`flex-1 flex flex-col items-center justify-center py-4 rounded-xl text-sm font-bold transition-all duration-300 ${isActive ? "bg-white text-slate-900 shadow-sm border border-slate-200 scale-100" : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50 scale-[0.98]"
                    }`}
                >
                  <Icon size={20} className={`mb-2 ${isActive ? 'text-green-600' : 'text-slate-400'}`} />
                  {tabName}
                </button>
              );
            })}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 h-[400px] flex flex-col shadow-sm">
              <div className="mb-4">
                <h3 className="text-slate-900 text-xl font-bold tracking-tight">{activeConfig.chartTitle}</h3>
                <p className="text-slate-500 text-sm font-medium">{activeConfig.chartSubtitle}</p>
              </div>
              <div className="flex-1 w-full mt-2 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData} margin={{ top: 20, right: 20, left: -20, bottom: 20 }}>
                    <defs>
                      <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.9} />
                        <stop offset="95%" stopColor="#34d399" stopOpacity={0.6} />
                      </linearGradient>
                      <linearGradient id="colorRatingTop" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#059669" stopOpacity={1} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.8} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="subject"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#64748b", fontSize: 13, fontWeight: 500 }}
                      dy={12}
                    />
                    <YAxis
                      domain={[0, 5]}
                      ticks={[0, 1, 2, 3, 4, 5]}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#64748b", fontSize: 13, fontWeight: 600 }}
                      dx={-10}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(241, 245, 249, 0.4)" }}
                      contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)", padding: "16px", backgroundColor: "rgba(255,255,255,0.95)" }}
                      itemStyle={{ color: "#0f172a", fontWeight: "900", fontSize: "16px" }}
                    />
                    <Bar
                      dataKey="rating"
                      radius={[8, 8, 8, 8]}
                      barSize={60}
                      animationDuration={1500}
                      label={{ position: 'top', fill: '#0f172a', fontSize: 14, fontWeight: 'bold', formatter: (val) => Number(val).toFixed(1), dy: -6 }}
                    >
                      {
                        barChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? "url(#colorRatingTop)" : "url(#colorRating)"} />
                        ))
                      }
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Top Rated List Section */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <div className="mb-5">
              <h3 className="text-slate-900 text-lg font-bold tracking-tight">{activeConfig.listTitle}</h3>
              <p className="text-slate-500 text-sm font-medium">{activeConfig.listSubtitle}</p>
            </div>
            <div className="flex flex-col gap-3">
              {topRatedData.map((item) => (
                <div
                  key={item.rank}
                  className="flex items-center justify-between px-5 py-4 rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-5">
                    <div className={`w-10 h-10 shrink-0 rounded-full font-bold flex items-center justify-center ${item.rank === 1 ? 'bg-[#fefce8] text-[#eab308] border border-[#fef08a]' : item.rank === 2 ? 'bg-slate-100 text-slate-600 border border-slate-200' : item.rank === 3 ? 'bg-orange-50 text-orange-700 border border-orange-200' : 'bg-blue-50 text-blue-700 border border-blue-100'}`}>
                      #{item.rank}
                    </div>
                    <div>
                      <h4 className="text-slate-900 font-bold text-base leading-tight mb-0.5">{item.name}</h4>
                      <p className="text-slate-500 text-sm font-medium">{item.subtitle}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center justify-end gap-1 mb-0.5">
                      <Star size={18} className="fill-[#facc15] text-[#facc15]" />
                      <span className="text-slate-900 font-bold text-lg leading-none">{Number(item.rating).toFixed(1)}</span>
                    </div>
                    <div className="text-slate-400 text-sm font-medium">{item.reviews} reviews</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminFeedback;
