import React, { useState, useEffect } from 'react';
import { X, Star, MessageSquare, MapPin, Users, Info, Calendar, CreditCard, Package } from 'lucide-react';
import { resolveMediaUrl } from '../../utils/resolveMediaUrl';

const CustomStyles = () => (
  <style>{`
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
    .animate-slideUp { animation: slideUp 0.4s ease-out; }
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #166534; border-radius: 10px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #14532d; }
  `}</style>
);

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const FEEDBACK_API = `${API_BASE}/api/feedback`;

const CampsiteDetail = ({ site, onClose, onBookNow }) => {
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(`${FEEDBACK_API}/display`);
        const data = await res.json();
        // Filter reviews for this specific campsite.
        const filtered = data.filter((r) => {
          const typeMatch = String(r.targetType || "").toLowerCase() === "campsite";
          if (!typeMatch) return false;
          const idMatch = String(r.targetId || "") === String(site._id || "");
          const nameMatch =
            String(r.targetName || "").trim().toLowerCase() ===
            String(site.name || "").trim().toLowerCase();
          return idMatch || nameMatch;
        });
        setReviews(filtered);
      } catch (err) {
        console.error('Failed to fetch reviews:', err);
      } finally {
        setLoadingReviews(false);
      }
    };
    fetchReviews();
  }, [site._id, site.name]);

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : site.averageRating ? site.averageRating.toFixed(1) : 'New';

  const imgSrc = resolveMediaUrl(site.image);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1100] p-4 animate-fadeIn" onClick={onClose}>
      <CustomStyles />
      <div 
        className="bg-white rounded-[32px] w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col md:flex-row relative animate-slideUp"
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-10 p-2.5 bg-white/90 hover:bg-white rounded-full shadow-lg text-gray-500 transition-all hover:scale-110 active:scale-95"
        >
          <X size={20} />
        </button>

        {/* Left: Image Section */}
        <div className="w-full md:w-1/2 bg-gray-50 relative min-h-[350px]">
          <img 
            src={imgSrc || "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=1200&q=80"} 
            alt={site.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          
          <div className="absolute bottom-8 left-8 right-8 text-white">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/30 text-[10px] font-black uppercase tracking-widest">
                Campsite
              </div>
              <div className="bg-[#fbbf24] text-gray-900 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                Top Rated
              </div>
            </div>
            <h2 className="text-4xl font-black mb-2 leading-tight tracking-tight">{site.name}</h2>
            <div className="flex items-center gap-2 text-white/90">
              <MapPin size={16} />
              <span className="font-semibold text-sm">{site.location}</span>
            </div>
          </div>

          <div className="absolute top-8 left-8">
            <div className="bg-white/95 backdrop-blur-sm px-5 py-2.5 rounded-2xl shadow-xl">
               <span className="text-[#166534] font-black text-xl">Rs {site.pricePerNight}</span>
               <span className="text-[#166534]/70 text-[12px] font-bold uppercase tracking-wider ml-1">/ Night</span>
            </div>
          </div>
        </div>

        {/* Right: Info & Reviews Section */}
        <div className="w-full md:w-1/2 flex flex-col h-full overflow-hidden">
          <div className="flex-1 overflow-y-auto custom-scrollbar p-8 pt-10">
            {/* Header / Stats */}
            <div className="flex items-center justify-between mb-8 pb-8 border-b border-gray-100">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-[#fbbf24]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={18} fill={i < Math.round(averageRating === 'New' ? 0 : averageRating) ? "currentColor" : "none"} strokeWidth={2.5} />
                  ))}
                  <span className="ml-1 text-gray-900 font-black text-xl">{averageRating}</span>
                </div>
                <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">{reviews.length} Customer Reviews</span>
              </div>
              
              <div className="flex gap-4">
                 <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-[#166534] mb-1">
                       <Users size={18} />
                    </div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Up to {site.capacity}</span>
                 </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-10">
              <h3 className="text-gray-900 font-black text-lg mb-4 flex items-center gap-2">
                <Info size={18} className="text-[#166534]" />
                About this Place
              </h3>
              <p className="text-gray-600 leading-relaxed font-medium">
                {site.description || "Welcome to " + site.name + ". Enjoy a serene camping experience in the heart of " + site.location + ". This site offers a perfect blend of natural beauty and essential comforts for your next adventure."}
              </p>
            </div>

            {/* Amenities */}
            {site.amenities && site.amenities.length > 0 && (
              <div className="mb-10">
                <h3 className="text-gray-900 font-black text-lg mb-4 flex items-center gap-2">
                  <Package size={18} className="text-[#166534]" />
                  Amenities
                </h3>
                <div className="flex flex-wrap gap-2">
                  {site.amenities.map((amenity, i) => (
                    <span key={i} className="px-4 py-2 bg-gray-50 text-gray-700 text-xs font-bold rounded-xl border border-gray-100 shadow-sm">
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews Section */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-gray-900 font-black text-xl flex items-center gap-2">
                  <MessageSquare size={22} className="text-[#166534]" />
                  Feedback & Reviews
                </h3>
                <span className="px-3 py-1 bg-green-50 text-[#166534] rounded-full text-[10px] font-black uppercase tracking-widest">
                  {reviews.length} Total
                </span>
              </div>

              {loadingReviews ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#166534] border-t-transparent" />
                </div>
              ) : reviews.length === 0 ? (
                <div className="bg-gray-50 rounded-2xl p-8 text-center border-2 border-dashed border-gray-200">
                  <p className="text-gray-400 font-bold text-sm">No reviews yet for this campsite.</p>
                  <p className="text-gray-300 text-[11px] uppercase tracking-wider mt-1">Be the first to share your experience!</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {reviews.map((review, i) => (
                    <div key={review._id || i} className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#166534]/10 flex items-center justify-center text-[#166534] font-black text-sm">
                            {review.userName?.charAt(0) || review.userId?.name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-gray-900">
                              {review.userName || review.userId?.name || "Verified Camper"}
                            </h4>
                            <div className="flex text-[#fbbf24] gap-0.5">
                              {[...Array(5)].map((_, si) => (
                                <Star key={si} size={10} fill={si < review.rating ? "currentColor" : "none"} strokeWidth={3} />
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-gray-400">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed font-medium italic">
                        "{review.comment || review.description}"
                      </p>
                      
                      {review.imageUrls && review.imageUrls.length > 0 && (
                        <div className="flex gap-2 mt-4 overflow-x-auto pb-2 custom-scrollbar">
                           {review.imageUrls.map((url, imgIdx) => (
                              <img 
                                key={imgIdx} 
                                src={resolveMediaUrl(url)} 
                                alt="Review" 
                                className="w-16 h-16 rounded-lg object-cover shadow-sm border border-gray-100"
                              />
                           ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Footer */}
          <div className="p-8 border-t border-gray-100 bg-gray-50/50 backdrop-blur-sm">
            <button 
              onClick={() => onBookNow(site._id)}
              className="w-full bg-[#166534] hover:bg-[#14532d] text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-green-900/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampsiteDetail;
