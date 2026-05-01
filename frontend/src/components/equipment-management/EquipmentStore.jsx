import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Search, SlidersHorizontal, LayoutGrid, ShoppingCart, Heart, LogOut, ChevronDown, Calendar, Star } from "lucide-react";
import EquipmentDetail from './EquipmentDetail';
import axios from "axios";
import { resolveMediaUrl } from '../../utils/resolveMediaUrl';

const API = (process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/api/equipment';

const CATEGORIES = ['All Gear', 'Tents', 'Sleeping Bags', 'Backpacks', 'Cooking Gear', 'Lighting', 'Other'];

const CATEGORY_ICONS = {
  'All Gear':      '⛺',
  'Tent':         '🏕️',
  'Sleeping Bags': '🛏️',
  'Backpacks':     '🎒',
  'Cooking Gear':  '🍳',
  'Lighting':      '🔦',
  'Other':         '📦',
};

// ── Notify Me Modal ──────────────────────────────────────────
const NotifyModal = ({ item, onClose }) => {
  const [email, setEmail]         = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) { setError('Please enter your email address.'); return; }
    if (!email.includes('@') || !email.includes('.')) { setError('Please enter a valid email address.'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/notify/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), itemId: item._id, itemName: item.name, category: item.category }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong.');
      setSubmitted(true);
    } catch (err) {
      if (err.message === 'This email is already registered for this item') {
        setError('✓ You are already on the notify list for this item!');
      } else {
        setError(err.message || 'Failed to save. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/45 flex items-center justify-center z-[1000] p-4 backdrop-blur-sm">
      <div onClick={e => e.stopPropagation()} className="bg-white rounded-2xl w-full max-w-[400px] p-8 shadow-2xl">
        {submitted ? (
          <div className="text-center">
            <div className="text-[52px] mb-4">✅</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">You're on the list!</h3>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              We'll email <strong className="text-gray-900">{email}</strong> as soon as <strong className="text-gray-900">"{item.name}"</strong> is back in stock.
            </p>
            <button onClick={onClose} className="w-full py-3 bg-[#166534] hover:bg-[#14532d] text-white rounded-xl text-sm font-bold transition-colors">
              Done ✓
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-start mb-5">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">🔔 Notify Me</h3>
                <p className="text-[13px] text-gray-500">Get notified when this item is back in stock</p>
              </div>
              <button onClick={onClose} className="bg-gray-100 hover:bg-gray-200 text-gray-500 w-8 h-8 rounded-full flex items-center justify-center transition-colors">
                ✕
              </button>
            </div>
            <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-xl mb-5">
              <span className="text-2xl">📦</span>
              <div>
                <div className="font-bold text-[14px] text-gray-900 line-clamp-1">{item.name}</div>
                <div className="text-[12px] font-semibold text-red-500">Currently Out of Stock</div>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                Your Email Address
              </label>
              <input
                type="email" placeholder="e.g. camper@wilderness.com" value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && !loading && handleSubmit()}
                disabled={loading}
                className={`w-full p-3 border rounded-xl text-sm outline-none transition-colors ${error ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-[#166534]'}`}
                style={{ backgroundColor: loading ? '#f9fafb' : '#fff' }}
              />
              {error && (
                <p className={`mt-1.5 text-[12px] font-medium ${error.startsWith('✓') ? 'text-[#16a34a]' : 'text-red-500'}`}>
                  {error}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <button 
                onClick={onClose} disabled={loading} 
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmit} disabled={loading} 
                className="flex-[2] py-3 bg-[#166534] hover:bg-[#14532d] text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50 disabled:bg-green-300"
              >
                {loading ? '⏳ Saving...' : '🔔 Notify Me'}
              </button>
            </div>
            <p className="mt-4 text-[11px] text-gray-400 text-center font-medium">
              We'll only email you once when restocked. No spam ever.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

// ── Equipment Card ───────────────────────────────────────────
const EquipmentCard = ({ item, cart, onAddToCart, onRemoveFromCart, onShowNotify, isLiked, onToggleFavorite, onClick }) => {
  const [mode, setMode]             = useState('rent');

  const isUnavailable = item.availabilityStatus === 'Out of Stock' || item.availabilityStatus === 'Deactivated' || item.stockQuantity === 0;
  const isLowStock    = item.stockQuantity > 0 && item.stockQuantity <= 3;
  const inCart        = cart.some(c => c._id === item._id && c.mode === mode);

  const imgSrc = resolveMediaUrl(item.imageUrl);
  const backOn = item.availabilityStatus === 'Out of Stock' ? "soon" : null;

  return (
    <div
      onClick={() => onClick(item)}
      className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all group cursor-pointer ${
        isUnavailable ? "opacity-95" : inCart ? "border-[#16a34a] shadow-md ring-1 ring-[#16a34a]" : "hover:shadow-md"
      }`}
    >
      <div
        className="relative h-48 overflow-hidden"
        style={{ background: "linear-gradient(to bottom right, #166534, #14532d)" }}
      >
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={item.name}
            className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${isUnavailable ? "grayscale-[0.35]" : ""}`}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white text-4xl font-bold">
            {item.name?.charAt(0)?.toUpperCase() || "?"}
          </div>
        )}

        {isUnavailable && (
          <div className="absolute inset-0 bg-gray-900/45 backdrop-blur-[1px] flex flex-col items-center justify-center gap-1 px-3 text-center z-[5]">
             <span className="text-white text-xs font-black uppercase tracking-[0.2em]">Unavailable</span>
             <span className="text-white/90 text-[11px] font-semibold">Back {backOn}</span>
          </div>
        )}

        <div
          className="absolute top-3 right-3 text-white px-2.5 py-1 rounded-full text-[10px] font-bold z-[6] tracking-wider"
          style={{ backgroundColor: isUnavailable ? '#ef4444' : isLowStock ? '#f59e0b' : '#166534' }}
        >
          {isUnavailable ? 'SOLD OUT' : isLowStock ? `ONLY ${item.stockQuantity} LEFT` : 'AVAILABLE'}
        </div>

        {inCart && (
           <div className="absolute top-3 left-3 bg-[#16a34a] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-lg z-[6]">
             ✓
           </div>
        )}
      </div>

      <div className="p-5 flex flex-col h-[240px]">
        <h3 className="text-lg font-bold text-gray-900 truncate">{item.name}</h3>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
          {item.category} • {item.condition}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex text-[#fbbf24] gap-0.5">
             {[...Array(5)].map((_, i) => (
               <Star key={i} size={14} fill={i < Math.round(item.averageRating || 0) ? "currentColor" : "none"} strokeWidth={2.5} />
             ))}
          </div>
          <span className="text-[12px] font-black text-slate-400 uppercase tracking-wide mt-0.5">
             {item.averageRating ? item.averageRating.toFixed(1) : "0.0"} ({item.reviewCount || 0} REVIEWS)
          </span>
        </div>

        {/* Mode Toggle */}
        <div className="flex bg-gray-100 rounded-lg p-1.5 mb-3">
           {['rent', 'buy'].map((m) => (
             <button key={m} onClick={(e) => { e.stopPropagation(); setMode(m); }} className={`flex-1 py-1.5 text-[11px] font-bold rounded-md transition-all ${mode === m ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:bg-gray-200'}`}>
               {m === 'rent' ? '🔄 Rent/day' : '🏷️ Buy'}
             </button>
           ))}
        </div>

        <div className="flex-1"></div>

        <div className="flex justify-between items-end gap-3 mt-1">
          <div className="flex flex-col">
             <span className="text-[11px] text-gray-500 font-semibold mb-0.5">{mode === 'rent' ? 'Daily Rate' : 'Total Price'}</span>
             <span className="font-black text-lg leading-none" style={{ color: mode === 'buy' ? "#1d4ed8" : "#166534" }}>
                LKR {mode === 'rent' ? item.rentalPrice : item.salePrice}
             </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(item._id);
              }}
              className={`p-2 rounded-xl border transition-colors ${
                isLiked
                  ? "bg-red-50 border-red-200 text-red-600"
                  : "bg-white border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Heart size={18} fill={isLiked ? "currentColor" : "transparent"} />
            </button>

            {isUnavailable ? (
              <div className="flex flex-col items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onShowNotify(item); }}
                  className="px-4 py-2 rounded-xl font-bold text-[13px] bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors border border-amber-200"
                >
                  🔔 Notify Me
                </button>
              </div>
            ) : inCart ? (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onRemoveFromCart(item._id, mode); }}
                  className="px-4 py-2 rounded-xl font-bold text-[13px] border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition-colors shrink-0"
                >
                  Remove
                </button>
            ) : (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onAddToCart({ ...item, mode, price: mode === 'rent' ? item.rentalPrice : item.salePrice }); }}
                  className="text-white px-4 py-2 rounded-xl font-bold text-[13px] transition-colors shrink-0 shadow-sm"
                  style={{ backgroundColor: mode === 'buy' ? '#1d4ed8' : '#166534' }}
                >
                  {mode === 'buy' ? 'Buy Now' : 'Add to Cart'}
                </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main Store Component ─────────────────────────────────────
const EquipmentStore = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Dynamic Key: 'equipment_cart_guest' or 'equipment_cart_USERID'
  const userId = user?._id || 'guest';
  const cartKey = useMemo(() => `equipment_cart_${userId}`, [userId]);
  const favKey = useMemo(() => `equipment_favorites_${userId}`, [userId]);

  const [equipment, setEquipment]               = useState([]);
  const [loading, setLoading]                   = useState(true);
  const [error, setError]                       = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All Gear');
  const [searchQuery, setSearchQuery]           = useState('');
  const [showFavorites, setShowFavorites]       = useState(false);
  const [displayCount, setDisplayCount]         = useState(8);
  const [notifyItem, setNotifyItem]             = useState(null);
  const [selectedItem, setSelectedItem]         = useState(null);

  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem(cartKey);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem(favKey);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });


  // Keep storage in sync
  useEffect(() => {
    localStorage.setItem(cartKey, JSON.stringify(cart));
  }, [cart, cartKey]);

  // Sync favorites to localStorage
  useEffect(() => {
    localStorage.setItem(favKey, JSON.stringify(favorites));
  }, [favorites, favKey]);
  // Migration Logic: If guest cart has items and user just logged in, move them.

  useEffect(() => {
    if (user?._id) {
      const guestCartJson = localStorage.getItem('equipment_cart_guest');
      if (guestCartJson) {
        try {
          const guestCart = JSON.parse(guestCartJson);
          if (guestCart.length > 0) {
            setCart(prev => {
              const merged = [...prev];
              guestCart.forEach(gItem => {
                if (!merged.some(m => m._id === gItem._id && m.mode === gItem.mode)) {
                  merged.push(gItem);
                }
              });
              return merged;
            });
            localStorage.removeItem('equipment_cart_guest');
          }
        } catch (e) { console.error("Migration failed:", e); }
      }
    }
  }, [user?._id]);

  useEffect(() => {
    fetch(`${API}/display`)
      .then(res => res.json())
      .then(data => { setEquipment(data); setLoading(false); })
      .catch(err => { 
        console.error("Fetch failed:", err);
        setError("Failed to load equipment. Please try again later.");
        setLoading(false);
      });
  }, []);

  const addToCart = (product) => {
    setCart(prev => {
      if (prev.some(i => i._id === product._id && i.mode === product.mode)) return prev;
      return [...prev, product];
    });
  };

  const removeFromCart = (id, mode) => {
    setCart(prev => prev.filter(i => !(i._id === id && i.mode === mode)));
  };

  const onToggleFavorite = (id) => {
    setFavorites(prev => {
      if (prev.includes(id)) return prev.filter(i => i !== id);
      return [...prev, id];
    });
  };

  const filtered = useMemo(() => {
    return (equipment || []).filter(item => {
      const matchCat    = selectedCategory === 'All Gear' || item.category === selectedCategory;
      const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchFav    = !showFavorites || favorites.includes(item._id);
      return matchCat && matchSearch && matchFav;
    });
  }, [equipment, selectedCategory, searchQuery, showFavorites, favorites]);

  const visibleEquipment = filtered.slice(0, displayCount);
  const hasMore = filtered.length > displayCount;

  const handleBookNow = () => {
    if (cart.length === 0) { alert('Please add at least one item to your cart first!'); return; }
    navigate('/booking-summary', { state: { items: cart } });
  };

  const navItems = [
    { icon: LayoutGrid, label: "Browse Gear", active: !showFavorites, action: () => setShowFavorites(false) },
    { icon: ShoppingCart, label: `My Cart (${cart.length})`, action: handleBookNow, highlight: cart.length > 0 }, 
    { icon: Calendar, label: "My Bookings", path: "/equipment-bookings" },
    { icon: Heart, label: "Favorites", active: showFavorites, action: () => setShowFavorites(true) },
  ];


  return (
    <div className="min-h-screen bg-gray-50">
      {notifyItem && <NotifyModal item={notifyItem} onClose={() => setNotifyItem(null)} />}
      {selectedItem && (
        <EquipmentDetail 
          item={selectedItem} 
          onClose={() => setSelectedItem(null)} 
          onAddToCart={(item) => { addToCart(item); setSelectedItem(null); }}
          cart={cart}
        />
      )}

      <main className="py-10 px-4 sm:px-6 lg:px-8">

        <div className="max-w-6xl mx-auto">
          
          <div className="mb-10">
            <h1 className="text-5xl font-black text-gray-900 tracking-tight mb-2">Premium Gear Rental</h1>
            <p className="text-gray-500 font-medium tracking-wide">Professional grade equipment for your wilderness journey.</p>
          </div>

          {/* Modern Tab Navigation & Search Bar Integrated */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12 p-1.5 bg-gray-200/50 rounded-[24px] w-full">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              {navItems.map((item, idx) => (
                <button 
                  key={idx} 
                  onClick={() => {
                    if (item.action) item.action();
                    else if (item.path) navigate(item.path);
                  }} 
                  className={`flex items-center gap-2.5 px-6 py-3 rounded-[18px] text-sm font-bold transition-all duration-200 whitespace-nowrap ${
                    item.active 
                      ? "bg-white text-[#166534] shadow-sm scale-[1.02]" 
                      : item.highlight
                        ? "text-[#16a34a] bg-[#f0fdf4] hover:bg-[#dcfce7]"
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
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search gear..."
                  className="pl-12 pr-4 py-2.5 border border-transparent rounded-[18px] text-sm w-full md:w-64 bg-white/80 outline-none focus:bg-white focus:ring-2 focus:ring-[#166534]/20 transition-all"
                />
              </div>
              <button type="button" className="p-2.5 bg-white/80 hover:bg-white rounded-[16px] transition-colors shadow-sm">
                <SlidersHorizontal size={18} className="text-gray-500" />
              </button>
            </div>
          </div>
          
          {cart.length > 0 && (
             <div className="mb-8 bg-[#f0fdf4] border border-[#bbf7d0] rounded-2xl p-4 lg:hidden flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                <div className="text-sm text-[#15803d] font-bold flex items-center gap-3">
                   <ShoppingCart size={20} />
                   <span>
                     {cart.length} item{cart.length > 1 ? 's' : ''} in cart: <span className="font-medium text-gray-700">{cart.map(c => c.name).join(', ')}</span>
                   </span>
                </div>
                <button onClick={handleBookNow} className="w-full sm:w-auto bg-[#16a34a] hover:bg-[#15803d] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors cursor-pointer whitespace-nowrap">
                   Checkout →
                </button>
             </div>
          )}



          <div className="flex gap-3 overflow-x-auto pb-4 mb-8 no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => { setSelectedCategory(cat); setDisplayCount(8); }}
                className={`px-4 py-2 flex items-center gap-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat ? "text-white shadow-sm" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                }`}
                style={selectedCategory === cat ? { backgroundColor: "#166534", borderColor: "#166534" } : {}}
              >
                <span>{CATEGORY_ICONS[cat]}</span>
                {cat}
              </button>
            ))}
          </div>

          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-gray-200 rounded-full animate-spin" style={{ borderTopColor: "#166534" }} />
                <p className="text-sm text-gray-500 font-medium">Loading gear...</p>
              </div>
            </div>
          )}

          {error && !loading && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm mb-6">{error}</div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="text-center py-20">
              <div className="text-4xl mb-3">⛺</div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">No items found</h3>
              <p className="text-gray-500 text-sm mb-4">Try adjusting your category or search term.</p>
              <button onClick={() => { setSearchQuery(''); setSelectedCategory('All Gear'); }} className="text-sm font-semibold text-[#166534] hover:underline">
                Clear all filters
              </button>
            </div>
          )}

          {!loading && filtered.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {visibleEquipment.map((item) => (
                  <EquipmentCard 
                    key={item._id} 
                    item={item} 
                    cart={cart} 
                    onAddToCart={addToCart} 
                    onRemoveFromCart={removeFromCart} 
                    onShowNotify={setNotifyItem}
                    isLiked={favorites.includes(item._id)}
                    onToggleFavorite={onToggleFavorite}
                    onClick={setSelectedItem}
                  />
                ))}
              </div>
              {hasMore && (
                <div className="flex justify-center mt-10">
                  <button
                    type="button"
                    onClick={() => setDisplayCount((c) => c + 8)}
                    className="inline-flex items-center gap-2 px-6 py-3 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                  >
                    Show More Gear <ChevronDown size={18} />
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

export default EquipmentStore;