import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Star, ChevronDown, MapPin, ArrowLeft } from "lucide-react";
import ReviewSidebar from "../ReviewSidebar";

const AdminAllReviews = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("all");

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/api/feedback/display");
      setReviews(response.data || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      alert("Failed to load reviews. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const filteredReviews = useMemo(() => {
    const typeFiltered = reviews.filter((review) => {
      if (typeFilter === "all") return true;
      return String(review.targetType || "").toLowerCase() === typeFilter;
    });

    return [...typeFiltered].sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA; // Always newest first
    });
  }, [reviews, typeFilter]);

  const renderStars = (value) => {
    const ratingValue = Number(value || 0);
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={18}
            className={star <= ratingValue ? "fill-amber-400 text-amber-400" : "text-slate-300"}
          />
        ))}
      </div>
    );
  };

  const getDefaultImage = (type) => {
    switch (type?.toLowerCase()) {
      case "guide":
        return "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&q=80&w=2070";
      case "equipment":
        return "https://images.unsplash.com/photo-1508873696983-2dfd5898f08b?auto=format&fit=crop&q=80&w=2070";
      case "campsite":
      default:
        return "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&w=2070";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <ReviewSidebar />

      <div className="flex-1 h-screen overflow-y-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">All System Reviews</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate("/admin/feedback")}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-700 font-bold text-sm border border-slate-200 hover:bg-slate-50 transition-all shadow-sm hover:shadow"
              >
                <ArrowLeft size={16} />
                Return to Ratings Dashboard
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="appearance-none bg-white border border-slate-200 rounded-lg px-4 py-2.5 pr-10 text-sm font-semibold min-w-[170px] focus:outline-none focus:ring-2 focus:ring-slate-300"
              >
                <option value="all">All Types</option>
                <option value="campsite">Locations</option>
                <option value="guide">Guides</option>
                <option value="equipment">Equipment</option>
              </select>
              <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 border-t-transparent mb-4"></div>
              <p className="text-slate-500 font-medium">Loading reviews...</p>
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm max-w-2xl mx-auto my-10">
              <h3 className="text-2xl font-bold text-slate-900 mb-3">No Reviews Found</h3>
              <p className="text-slate-500 text-base max-w-sm mx-auto mb-8">
                There are currently no reviews matching this filter.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {filteredReviews.map((review) => {
                return (
                  <div key={review._id} className="group border border-slate-200 rounded-2xl p-4 bg-white shadow-sm hover:shadow-md transition-all duration-300 hover:border-slate-300">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Image Gallery */}
                      <div className="flex gap-3 overflow-x-auto sm:w-64 shrink-0 pb-3 sleek-scrollbar snap-x">
                        {(review.imageUrls && review.imageUrls.length > 0 
                          ? review.imageUrls.map(url => `http://localhost:5000${url}`) 
                          : [review.imageUrl ? `http://localhost:5000${review.imageUrl}` : review.image || getDefaultImage(review.targetType)]
                        ).map((src, i) => (
                          <img
                            key={i}
                            className="w-full sm:w-48 sm:h-32 rounded-xl object-cover border border-slate-200 shadow-sm hover:shadow-md transition-shadow shrink-0 snap-center"
                            src={src}
                            alt={`${review.title || review.targetType} ${i + 1}`}
                          />
                        ))}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            {review.targetType && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-50 border border-slate-200 text-xs font-semibold">
                                <MapPin size={12} />
                                {review.targetType}
                              </span>
                            )}
                          </div>
                        </div>

                        <h3 className="text-2xl font-bold text-slate-900 leading-tight mb-2 group-hover:text-green-600 transition-colors">
                          {review.targetName || review.title || "Feedback Review"}
                        </h3>
                        <div className="flex items-center gap-3 mb-2">
                          {renderStars(review.rating)}
                          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                          <span className="text-slate-500 font-medium text-sm">
                            By <span className="text-slate-700 font-bold">{review.userName || review.userId?.name || "Anonymous"}</span>
                          </span>
                          {review.createdAt && (
                            <>
                              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                              <span className="text-slate-500 font-medium text-sm">
                                {new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                              </span>
                            </>
                          )}
                        </div>
                        {review.title && review.title !== review.targetName && (
                          <h4 className="text-xl font-semibold text-slate-900 mb-1">
                            {review.title}
                          </h4>
                        )}
                        <p className="text-slate-700 text-lg leading-relaxed mb-2">
                          {review.comment || review.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAllReviews;
