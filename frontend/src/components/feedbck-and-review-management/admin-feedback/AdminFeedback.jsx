import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Star, TrendingUp, Calendar, User, Package, MapPin } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';

const AdminFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Locations Ratings');
  const navigate = useNavigate();
  
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/api/feedback/display");
      setFeedbacks(response.data);
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute metrics based on activeTab
  let targetFilter = '';
  if (activeTab === 'Guides Ratings') targetFilter = 'guide';
  if (activeTab === 'Equipment Ratings') targetFilter = 'equipment';
  if (activeTab === 'Locations Ratings') targetFilter = 'campsite';

  const filteredFeedbacks = feedbacks.filter(f => 
    String(f.targetType || '').toLowerCase().includes(targetFilter)
  );

  const totalReviews = filteredFeedbacks.length;

  const avgRatingRaw = totalReviews > 0 
    ? filteredFeedbacks.reduce((acc, curr) => acc + (curr.rating || 5), 0) / totalReviews 
    : 0;
  const averageRating = totalReviews > 0 ? avgRatingRaw.toFixed(1) : "0.0";

  const fiveStarReviews = filteredFeedbacks.filter(f => (f.rating || 5) >= 4.5).length;
  const fiveStarPercentage = totalReviews > 0 ? Math.round((fiveStarReviews / totalReviews) * 100) : 0;
  
  const ratingTrend = totalReviews > 0 ? `+${totalReviews}` : "0";

  const getChartData = () => {
    const categories = activeTab === 'Guides Ratings' ? ['Hiking', 'Wildlife', 'Climbing', 'Survival', 'Photography'] :
                       activeTab === 'Equipment Ratings' ? ['Tents', 'Sleep', 'Cooking', 'Lighting', 'Safety'] :
                       ['Parks', 'Lakeside', 'Desert', 'Forest', 'Mountain'];

    return categories.map(cat => {
      // Average the ratings of all feedbacks loosely matched, or just use the overall average if none precisely match
      const matches = filteredFeedbacks.filter(f => String(f.comment || '').toLowerCase().includes(cat.toLowerCase()));
      const items = matches.length > 0 ? matches : filteredFeedbacks;
      const catAvg = items.length > 0 ? items.reduce((sum, f) => sum + (f.rating || 5), 0) / items.length : 0;
      return { subject: cat, rating: parseFloat(catAvg.toFixed(1)) };
    });
  };

  const barChartData = getChartData();

  const getTabEntityName = () => {
    if (activeTab === 'Guides Ratings') return 'Guides';
    if (activeTab === 'Equipment Ratings') return 'Equipment';
    return 'Locations';
  };

  const getDynamicTopRated = () => {
    // Sort all live feedbacks by rating descending, take top 5
    const sorted = [...filteredFeedbacks].sort((a,b) => (b.rating || 5) - (a.rating || 5));
    return sorted.slice(0, 5).map((item, index) => {
      let dispName = "Anonymous User";
      if (item.comment) dispName = item.comment.length > 25 ? item.comment.substring(0, 25) + "..." : item.comment;
      
      return {
        rank: index + 1,
        name: dispName,
        subtitle: new Date(item.createdAt || Date.now()).toLocaleDateString(),
        rating: parseFloat(item.rating || 5).toFixed(1),
        reviews: 1
      };
    });
  };

  const topRatedData = getDynamicTopRated();

  return (
    <div className="min-h-screen bg-slate-50 font-sans p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-[32px] font-bold text-slate-900 mb-1 tracking-tight">Ratings Analysis Dashboard</h1>
            <p className="text-slate-500 text-[15px]">Smart Camping Management System - Rating Analytics</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors">
            <Calendar size={16} /> Last 6 Months
          </button>
        </div>

        {/* Tabs Section */}
        <div className="bg-slate-100 p-1.5 rounded-xl flex flex-col md:flex-row mb-8 shadow-inner border border-slate-200/60">
          <button 
            onClick={() => setActiveTab('Guides Ratings')}
            className={`flex-1 flex flex-col items-center justify-center py-4 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === 'Guides Ratings' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-600 hover:bg-slate-200/50'}`}
          >
            <User size={20} className="mb-2 text-slate-700" strokeWidth={1.5} /> Guides Ratings
          </button>
          
          <button 
            onClick={() => setActiveTab('Equipment Ratings')}
            className={`flex-1 flex flex-col items-center justify-center py-4 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === 'Equipment Ratings' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-600 hover:bg-slate-200/50'}`}
          >
            <Package size={20} className="mb-2 text-slate-700" strokeWidth={1.5} /> Equipment Ratings
          </button>
          
          <button 
            onClick={() => setActiveTab('Locations Ratings')}
            className={`flex-1 flex flex-col items-center justify-center py-4 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === 'Locations Ratings' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-600 hover:bg-slate-200/50'}`}
          >
            <MapPin size={20} className="mb-2 text-slate-700" strokeWidth={1.5} /> Locations Ratings
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Average Rating Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between h-40">
            <h3 className="text-slate-600 text-[15px] font-medium">Average Rating</h3>
            <div>
              <div className="text-[42px] font-semibold text-slate-800 leading-none mb-2">{averageRating}</div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={16}
                    className={`${star <= Math.round(Number(averageRating)) ? 'fill-[#facc15] text-[#facc15]' : 'fill-slate-100 text-slate-200'}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Total Reviews Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between h-40">
            <h3 className="text-slate-600 text-[15px] font-medium">Total Reviews</h3>
            <div>
              <div className="text-[42px] font-semibold text-slate-800 leading-none mb-2">{totalReviews}</div>
              <div className="text-slate-400 text-sm">Verified reviews</div>
            </div>
          </div>

          {/* 5-Star Reviews Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between h-40">
            <h3 className="text-slate-600 text-[15px] font-medium">5-Star Reviews</h3>
            <div>
              <div className="text-[42px] font-semibold text-slate-800 leading-none mb-2">{fiveStarReviews}</div>
              <div className="text-[#22c55e] text-sm font-medium">{fiveStarPercentage}% of all reviews</div>
            </div>
          </div>

          {/* Rating Trend Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between h-40">
            <h3 className="text-slate-600 text-[15px] font-medium">New Reviews</h3>
            <div>
              <div className="text-[42px] font-semibold text-[#22c55e] leading-none mb-2">{ratingTrend}</div>
              <div className="text-slate-400 text-sm flex items-center gap-1">
                <TrendingUp size={14} /> Recently Submitted
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 gap-6 mb-8">
          {/* Ratings by Category (Bar Chart) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] h-[400px] flex flex-col">
            <div className="mb-2">
              <h3 className="text-slate-800 text-[17px] font-bold mb-1">Ratings by Category</h3>
              <p className="text-slate-400 text-sm font-medium">Average ratings across {getTabEntityName().toLowerCase()} types</p>
            </div>
            <div className="flex-1 w-full relative -ml-4 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="subject" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13 }} dy={10} />
                  <YAxis domain={[0, 5]} ticks={[0, 2, 5]} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13 }} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }} 
                  />
                  <Legend 
                    iconType="square" 
                    wrapperStyle={{ paddingTop: '20px', fontSize: '14px', color: '#8b5cf6' }} 
                    formatter={(value) => <span style={{ color: '#8b5cf6', fontWeight: 500 }}>Average Rating</span>} 
                  />
                  <Bar dataKey="rating" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Top Rated List Section */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="mb-6">
            <h3 className="text-slate-800 text-[19px] font-bold mb-1">Top Rated {getTabEntityName()}</h3>
            <p className="text-slate-400 text-[15px] font-medium">Highest rated {getTabEntityName().toLowerCase()} based on customer reviews</p>
          </div>
          
          <div className="flex flex-col gap-4">
            {topRatedData.map((item) => (
              <div 
                key={item.rank} 
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-slate-300 hover:shadow-md transition-all bg-white gap-4 sm:gap-0"
              >
                <div className="flex items-center gap-4 sm:gap-6">
                  <div className="w-10 h-10 shrink-0 rounded-full bg-blue-100/60 flex items-center justify-center text-blue-600 font-bold text-sm">
                    #{item.rank}
                  </div>
                  <div>
                    <h4 className="text-slate-800 font-bold text-[16px] mb-0.5">{item.name}</h4>
                    <p className="text-slate-400 text-sm font-medium">{item.subtitle}</p>
                  </div>
                </div>
                
                <div className="flex flex-col items-start sm:items-end">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Star size={18} className="fill-[#facc15] text-[#facc15]" />
                    <span className="text-slate-800 font-bold text-[17px]">{item.rating}</span>
                  </div>
                  <div className="text-slate-400 text-[13px] font-medium">{item.reviews} reviews</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminFeedback;
