import React, { useState, useEffect } from 'react';
import { X, ShoppingCart, Star, MessageSquare, Tag, RefreshCw, ShieldCheck } from 'lucide-react';
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

const API_BASE = process.env.REACT_APP_API_URL;
const FEEDBACK_API = `${API_BASE}/api/feedback`;

const EquipmentDetail = ({ item, onClose, onAddToCart, cart }) => {
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [mode, setMode] = useState('rent');

  const inCart = cart.some(c => c._id === item._id && c.mode === mode);
  const isUnavailable = item.availabilityStatus === 'Out of Stock' || item.availabilityStatus === 'Deactivated' || item.stockQuantity === 0;

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(`${FEEDBACK_API}/display`);
        const data = await res.json();
        // Filter reviews for this specific equipment.
        // Prefer exact targetId match; fallback to equipment name for old entries.
        const filtered = data.filter((r) => {
          const typeMatch = String(r.targetType || "").toLowerCase() === "equipment";
          if (!typeMatch) return false;
          const idMatch = String(r.targetId || "") === String(item._id || "");
          const nameMatch =
            String(r.targetName || "").trim().toLowerCase() ===
            String(item.name || "").trim().toLowerCase();
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
  }, [item._id, item.name]);


  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 'New';

  const imgSrc = item.imageUrl ? `${API_BASE}${item.imageUrl}` : null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1100] p-4 animate-fadeIn" onClick={onClose}>
      <CustomStyles />
      <div 
        className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col md:flex-row relative animate-slideUp"
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/80 hover:bg-white rounded-full shadow-md text-gray-500 transition-all hover:scale-110"
        >
          <X size={20} />
        </button>

        {/* Left: Image Section */}
        <div className="w-full md:w-1/2 bg-gray-50 flex items-center justify-center p-8 relative min-h-[300px]">
          {imgSrc ? (
            <img 
              src={imgSrc} 
              alt={item.name} 
              className="max-w-full max-h-full object-contain drop-shadow-xl"
            />
          ) : (
            <div className="text-9xl font-bold text-gray-200 uppercase">{item.name.charAt(0)}</div>
          )}
          
          <div className="absolute top-6 left-6 flex flex-col gap-2">
            <span className="px-3 py-1 bg-white/90 backdrop-blur text-[10px] font-black uppercase tracking-widest rounded-full shadow-sm">
              {item.category}
            </span>
            <span className={`px-3 py-1 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-md ${isUnavailable ? 'bg-red-500' : 'bg-[#166534]'}`}>
              {isUnavailable ? 'Sold Out' : 'In Stock'}
            </span>
          </div>
        </div>

        {/* Right: Info Section */}
        <div className="w-full md:w-1/2 flex flex-col p-8 md:p-10 overflow-y-auto">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
               <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill={i < Math.round(averageRating) ? "currentColor" : "none"} />
                  ))}
               </div>
               <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">
                  {averageRating} ({reviews.length} Reviews)
               </span>
            </div>
            <h1 className="text-3xl font-black text-gray-900 leading-tight mb-2">{item.name}</h1>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              {item.description || "High-performance gear designed for professional campers and outdoor enthusiasts. Built with durable materials to withstand extreme weather conditions."}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${mode === 'rent' ? 'border-[#166534] bg-green-50' : 'border-gray-100 hover:border-gray-200'}`} onClick={() => setMode('rent')}>
                <div className="flex items-center gap-2 mb-1">
                  <RefreshCw size={14} className={mode === 'rent' ? 'text-[#166534]' : 'text-gray-400'} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Rental Price</span>
                </div>
                <div className="text-xl font-black text-gray-900">LKR {item.rentalPrice}<span className="text-xs font-bold text-gray-400 ml-1">/day</span></div>
              </div>
              <div className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${mode === 'buy' ? 'border-blue-600 bg-blue-50' : 'border-gray-100 hover:border-gray-200'}`} onClick={() => setMode('buy')}>
                <div className="flex items-center gap-2 mb-1">
                  <Tag size={14} className={mode === 'buy' ? 'text-blue-600' : 'text-gray-400'} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Purchase Price</span>
                </div>
                <div className="text-xl font-black text-gray-900">LKR {item.salePrice}</div>
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => onAddToCart({ ...item, mode, price: mode === 'rent' ? item.rentalPrice : item.salePrice })}
                disabled={isUnavailable || inCart}
                className={`flex-1 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg ${
                  inCart 
                    ? 'bg-gray-100 text-gray-400 cursor-default shadow-none' 
                    : isUnavailable
                      ? 'bg-red-50 text-red-300 cursor-not-allowed shadow-none'
                      : mode === 'rent'
                        ? 'bg-[#166534] hover:bg-[#14532d] text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {inCart ? '✓ Added to Cart' : isUnavailable ? 'Sold Out' : mode === 'rent' ? 'Rent Now' : 'Buy Now'}
                {!inCart && !isUnavailable && <ShoppingCart size={18} />}
              </button>
            </div>
            <div className="flex items-center gap-6 mt-4 px-2">
               <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 uppercase">
                 <ShieldCheck size={14} /> 2 Year Warranty
               </div>
               <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 uppercase">
                 <RefreshCw size={14} /> 30 Day Return
               </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-8 mt-4">
             <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                  <MessageSquare size={18} /> Feedback & Reviews
                </h3>
                <span className="text-xs font-bold text-[#166534] bg-green-50 px-3 py-1 rounded-full">
                  {reviews.length} Total
                </span>
             </div>

             {loadingReviews ? (
               <div className="py-10 text-center text-gray-400 animate-pulse text-sm font-bold">Loading experiences...</div>
             ) : reviews.length === 0 ? (
               <div className="py-10 bg-gray-50 rounded-2xl text-center flex flex-col items-center justify-center">
                  <div className="text-3xl mb-2">✨</div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No reviews yet for this gear.</p>
               </div>
             ) : (
               <div className="space-y-4 pr-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                 {reviews.map((rev, idx) => (
                   <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors">
                     <div className="flex justify-between items-start mb-2">
                       <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-[#166534]/10 flex items-center justify-center text-[#166534] font-black text-xs">
                           {rev.userName?.charAt(0) || 'U'}
                         </div>
                         <div>
                           <div className="text-[13px] font-black text-gray-900 leading-none mb-1">{rev.userName || 'Verified Camper'}</div>
                           <div className="flex text-amber-400 gap-0.5">
                             {[...Array(5)].map((_, i) => (
                               <Star key={i} size={10} fill={i < rev.rating ? "currentColor" : "none"} />
                             ))}
                           </div>
                         </div>
                       </div>
                       <span className="text-[10px] font-bold text-gray-400">{new Date(rev.createdAt).toLocaleDateString()}</span>
                     </div>
                     <p className="text-sm text-gray-600 leading-relaxed italic">"{rev.comment}"</p>
                     
                     {Array.isArray(rev.imageUrls) && rev.imageUrls.length > 0 && (
                       <div className="flex gap-2 overflow-x-auto mt-3 no-scrollbar pb-1">
                         {rev.imageUrls.map((img, idx) => {
                           const resolvedUrl = resolveMediaUrl(img);
                           return (
                             <a key={idx} href={resolvedUrl} target="_blank" rel="noreferrer" className="shrink-0 h-[60px] w-[80px] rounded-lg overflow-hidden border border-gray-100 block shadow-sm">
                               <img src={resolvedUrl} alt="Review photo" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                             </a>
                           );
                         })}
                       </div>
                     )}

                   </div>
                 ))}
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquipmentDetail;
