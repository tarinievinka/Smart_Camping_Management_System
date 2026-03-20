import React, { useEffect, useState } from "react";
import axios from "axios";
import { Search, TrendingUp, Star, Award, ShieldAlert, MessageSquare } from "lucide-react";

const AdminFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Analytics State
  const [analytics, setAnalytics] = useState({
    average: 0,
    topRated: []
  });

  // Search State
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [feedbackRes, avgRes, topRes] = await Promise.all([
        axios.get("http://localhost:5000/api/feedback/display"),
        axios.get("http://localhost:5000/api/feedback/analytics/average").catch(() => ({ data: { average: 0 }})),
        axios.get("http://localhost:5000/api/feedback/analytics/top").catch(() => ({ data: [] }))
      ]);
      
      const avgData = avgRes.data;
      let avgVal = 0;
      if (Array.isArray(avgData) && avgData.length > 0) {
        avgVal = avgData[0].averageRating || 0;
      } else if (avgData && typeof avgData === 'object' && avgData.averageRating) {
        avgVal = avgData.averageRating;
      } else if (typeof avgData === 'number') {
        avgVal = avgData;
      }

      setFeedbacks(feedbackRes.data);
      setAnalytics({
        average: avgVal,
        topRated: Array.isArray(topRes.data) ? topRes.data : []
      });
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredFeedbacks = feedbacks.filter(f => {
    const targetType = String(f.targetType || '').toLowerCase();
    const commentDesc = String(f.comment || f.description || '').toLowerCase();
    const term = searchTerm.toLowerCase();
    return targetType.includes(term) || commentDesc.includes(term);
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-sans">
      
      {/* Sidebar Focus (Minimalist & Modern) */}
      <aside className="w-20 lg:w-64 bg-slate-900 text-slate-300 hidden md:flex flex-col shadow-2xl transition-all duration-300">
        <div className="h-20 flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-800">
          <ShieldAlert className="w-8 h-8 text-emerald-400" />
          <span className="ml-3 text-xl font-bold text-white hidden lg:block tracking-wide">AdminCore</span>
        </div>
        <nav className="flex-1 py-6">
          <ul className="space-y-2">
            <li className="px-4 lg:px-6 py-3 bg-emerald-500/10 border-l-4 border-emerald-400 text-emerald-400 font-medium flex items-center justify-center lg:justify-start gap-4 cursor-pointer">
              <Star size={20} /> <span className="hidden lg:block">Feedback Desk</span>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto h-screen relative">
        
        {/* Top Header */}
        <header className="bg-white/70 backdrop-blur-lg sticky top-0 z-10 border-b border-slate-200 px-8 py-5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800">Moderation Hub</h1>
            <p className="text-sm text-slate-500 font-medium">Manage community feedback and ratings</p>
          </div>
          <div className="relative w-full sm:w-80 group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search comments or types..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-100/50 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:bg-white transition-all shadow-sm"
            />
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto space-y-8">
          
          {/* Aesthetic KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-3xl p-6 text-white shadow-xl shadow-emerald-500/20 flex flex-col justify-between overflow-hidden relative group">
              <div className="absolute -right-6 -top-6 bg-white/10 w-32 h-32 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500" />
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-emerald-100 font-medium text-sm tracking-wider uppercase mb-1">Total Feedbacks</p>
                  <h3 className="text-5xl font-black">{feedbacks.length}</h3>
                </div>
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <TrendingUp size={28} className="text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col justify-between group hover:-translate-y-1 transition-transform duration-300">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-400 font-medium text-sm tracking-wider uppercase mb-1">Average Rating</p>
                  <div className="flex items-baseline gap-1">
                    <h3 className="text-5xl font-black text-slate-800">
                      {typeof analytics.average === 'number' ? analytics.average.toFixed(1) : analytics.average}
                    </h3>
                    <span className="text-lg font-bold text-slate-400">/5</span>
                  </div>
                </div>
                <div className="p-3 bg-amber-50 rounded-2xl">
                  <Star size={28} className="text-amber-500 fill-amber-500" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col justify-between group hover:-translate-y-1 transition-transform duration-300">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-400 font-medium text-sm tracking-wider uppercase mb-1">Top Category</p>
                  <h3 className="text-3xl font-bold text-slate-800 capitalize mt-2 break-all">
                    {analytics.topRated && analytics.topRated.length > 0 && analytics.topRated[0]?._id ? analytics.topRated[0]._id : 'N/A'}
                  </h3>
                </div>
                <div className="p-3 bg-blue-50 rounded-2xl">
                  <Award size={28} className="text-blue-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Attractive Masonry Grid or Cards for Feedback instead of plain table */}
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <MessageSquare size={20} className="text-emerald-500" /> User Feedback Stream
            </h2>
            
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1,2,3].map(i => <div key={i} className="h-48 bg-slate-200 animate-pulse rounded-3xl" />)}
              </div>
            ) : filteredFeedbacks.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
                <ShieldAlert className="mx-auto w-12 h-12 text-slate-300 mb-4" />
                <p className="text-lg text-slate-500 font-medium" >No feedback matched your search.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFeedbacks.map(review => (
                  <div key={review._id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-lg shadow-slate-200/20 flex flex-col relative group">
                    <div className="flex justify-between items-start mb-4">
                      <span className="bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                        {review.targetType || 'Campsite'}
                      </span>
                    </div>
                    
                    <div className="flex gap-1 mb-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={16}
                          className={`${
                            star <= (review.rating || 5)
                              ? 'fill-amber-400 text-amber-400'
                              : 'fill-slate-100 text-slate-200'
                          }`}
                        />
                      ))}
                    </div>

                    <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-grow line-clamp-4 hover:line-clamp-none transition-all">
                      "{review.comment || review.description}"
                    </p>

                    <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center">
                      <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                        {new Date(review.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold">
                        {review.userId ? String(review.userId).substring(0,2).toUpperCase() : 'U'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

    </div>
  );
};

export default AdminFeedback;
