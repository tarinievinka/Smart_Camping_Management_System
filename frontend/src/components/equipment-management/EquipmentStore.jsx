import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API = process.env.REACT_APP_API_URL + '/api/equipment';

const CATEGORY_IMAGES = {
  'Tents':         'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&h=250&fit=crop',
  'Sleeping Bags': 'https://images.unsplash.com/photo-1510672981848-a1c4f1cb5ccf?w=400&h=250&fit=crop',
  'Backpacks':     'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=250&fit=crop',
  'Cooking Gear':  'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=400&h=250&fit=crop',
  'Lighting':      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop',
  'Other':         'https://images.unsplash.com/photo-1533240332313-0db49b459ad6?w=400&h=250&fit=crop',
};

const CATEGORIES = ['All Gear', 'Tents', 'Sleeping Bags', 'Backpacks', 'Cooking Gear', 'Lighting', 'Other'];

const CATEGORY_ICONS = {
  'All Gear':      '⛺',
  'Tents':         '🏕️',
  'Sleeping Bags': '🛏️',
  'Backpacks':     '🎒',
  'Cooking Gear':  '🍳',
  'Lighting':      '🔦',
  'Other':         '📦',
};

// ── Star Rating ──────────────────────────────────────────────
const StarRating = ({ condition }) => {
  const count = condition === 'New' ? 5 : condition === 'Good' ? 4 : condition === 'Fair' ? 3 : 2;
  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= count ? '#f59e0b' : '#d1d5db', fontSize: '13px' }}>★</span>
      ))}
    </div>
  );
};

// ── Notify Me Modal ──────────────────────────────────────────
const NotifyModal = ({ item, onClose }) => {
  const [email, setEmail]         = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false); // ← NEW: loading state while saving

  // ✅ UPDATED handleSubmit — saves email to MongoDB via backend
  const handleSubmit = async () => {
    // Basic validation
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/notify/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email:    email.trim(),
          itemId:   item._id,
          itemName: item.name,
          category: item.category,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Backend returned an error (e.g. already registered)
        throw new Error(data.error || 'Something went wrong.');
      }

      // ✅ Success — show success message
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
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: '16px', padding: '32px',
          width: '100%', maxWidth: '400px', margin: '0 16px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        }}
      >
        {submitted ? (
          // ── Success state ──
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '52px', marginBottom: '16px' }}>✅</div>
            <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: '700', color: '#111827' }}>
              You're on the list!
            </h3>
            <p style={{ margin: '0 0 24px', fontSize: '14px', color: '#6b7280', lineHeight: '1.6' }}>
              We'll email <strong>{email}</strong> as soon as{' '}
              <strong>"{item.name}"</strong> is back in stock.
            </p>
            <button
              onClick={onClose}
              style={{
                width: '100%', padding: '12px', borderRadius: '8px',
                background: '#16a34a', color: '#fff', border: 'none',
                fontSize: '14px', fontWeight: '700', cursor: 'pointer',
              }}
            >Done ✓</button>
          </div>
        ) : (
          // ── Form state ──
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <h3 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: '700', color: '#111827' }}>
                  🔔 Notify Me
                </h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
                  Get notified when this item is back in stock
                </p>
              </div>
              <button
                onClick={onClose}
                style={{
                  background: '#f3f4f6', border: 'none', borderRadius: '50%',
                  width: '32px', height: '32px', cursor: 'pointer',
                  fontSize: '14px', color: '#6b7280',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >✕</button>
            </div>

            {/* Item info */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '12px', background: '#fef2f2', borderRadius: '10px',
              border: '1px solid #fecaca', marginBottom: '20px',
            }}>
              <span style={{ fontSize: '24px' }}>📦</span>
              <div>
                <div style={{ fontWeight: '700', fontSize: '14px', color: '#111827' }}>{item.name}</div>
                <div style={{ fontSize: '12px', color: '#ef4444', fontWeight: '600' }}>
                  Currently Out of Stock
                </div>
              </div>
            </div>

            {/* Email input */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block', fontSize: '13px', fontWeight: '600',
                color: '#374151', marginBottom: '6px',
              }}>
                Your Email Address
              </label>
              <input
                type="email"
                placeholder="e.g. john@example.com"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && !loading && handleSubmit()}
                disabled={loading}
                style={{
                  width: '100%', padding: '10px 12px',
                  border: `1px solid ${error ? '#ef4444' : '#d1d5db'}`,
                  borderRadius: '8px', fontSize: '14px', color: '#111827',
                  outline: 'none', boxSizing: 'border-box',
                  background: loading ? '#f9fafb' : '#fff',
                }}
                onFocus={e => e.target.style.borderColor = '#16a34a'}
                onBlur={e => e.target.style.borderColor = error ? '#ef4444' : '#d1d5db'}
              />
              {error && (
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: error.startsWith('✓') ? '#16a34a' : '#ef4444' }}>
                  {error}
                </p>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={onClose}
                disabled={loading}
                style={{
                  flex: 1, padding: '11px', borderRadius: '8px',
                  background: '#f3f4f6', color: '#374151', border: 'none',
                  fontSize: '14px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >Cancel</button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  flex: 2, padding: '11px', borderRadius: '8px',
                  background: loading ? '#86efac' : '#16a34a',
                  color: '#fff', border: 'none',
                  fontSize: '14px', fontWeight: '700',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => { if (!loading) e.target.style.background = '#15803d'; }}
                onMouseLeave={e => { if (!loading) e.target.style.background = '#16a34a'; }}
              >
                {loading ? '⏳ Saving...' : '🔔 Notify Me When Available'}
              </button>
            </div>

            <p style={{ margin: '12px 0 0', fontSize: '11px', color: '#9ca3af', textAlign: 'center' }}>
              We'll only email you once when restocked. No spam ever.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

// ── Equipment Card ───────────────────────────────────────────
const EquipmentCard = ({ item, cart, onAddToCart, onRemoveFromCart }) => {
  const [liked, setLiked]           = useState(false);
  const [mode, setMode]             = useState('rent');
  const [showNotify, setShowNotify] = useState(false);

  const isUnavailable = item.availabilityStatus === 'Out of Stock' || item.availabilityStatus === 'Deactivated';
  const isLowStock    = item.stockQuantity > 0 && item.stockQuantity <= 3;
  const inCart        = cart.some(c => c._id === item._id && c.mode === mode);

  const imgSrc = item.imageUrl
    ? `${process.env.REACT_APP_API_URL}${item.imageUrl}`
    : (CATEGORY_IMAGES[item.category] || CATEGORY_IMAGES['Other']);

  const getBadge = () => {
    if (item.availabilityStatus === 'Out of Stock') return { text: 'SOLD OUT',                        bg: '#ef4444' };
    if (item.availabilityStatus === 'Deactivated')  return { text: 'UNAVAILABLE',                     bg: '#6b7280' };
    if (isLowStock)                                  return { text: `ONLY ${item.stockQuantity} LEFT`, bg: '#f59e0b' };
    return                                                  { text: 'AVAILABLE',                       bg: '#16a34a' };
  };
  const badge      = getBadge();
  const stockColor = item.stockQuantity === 0 ? '#ef4444' : item.stockQuantity <= 3 ? '#f59e0b' : '#16a34a';
  const stockPct   = Math.min(100, (item.stockQuantity / 20) * 100);

  return (
    <>
      {showNotify && <NotifyModal item={item} onClose={() => setShowNotify(false)} />}

      <div
        style={{
          background: '#fff', borderRadius: '12px', overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: inCart ? '2px solid #16a34a' : '1px solid #e5e7eb',
          display: 'flex', flexDirection: 'column', transition: 'box-shadow 0.2s, border 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)'}
        onMouseLeave={e => e.currentTarget.style.boxShadow = inCart ? '0 4px 16px rgba(0,0,0,0.15)' : '0 1px 3px rgba(0,0,0,0.1)'}
      >
        {/* Image */}
        <div style={{ position: 'relative' }}>
          <img
            src={imgSrc} alt={item.name}
            style={{ width: '100%', height: '200px', objectFit: 'cover', display: 'block' }}
            onError={e => { e.target.src = CATEGORY_IMAGES['Other']; }}
          />
          <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
            <span style={{
              background: badge.bg, color: '#fff', padding: '3px 10px',
              borderRadius: '4px', fontSize: '11px', fontWeight: '700', letterSpacing: '0.5px',
            }}>{badge.text}</span>
          </div>
          {inCart && (
            <div style={{
              position: 'absolute', top: '10px', right: '42px',
              background: '#16a34a', color: '#fff', borderRadius: '50%',
              width: '24px', height: '24px', display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700',
            }}>✓</div>
          )}
          {/* Clean SVG heart */}
          <button
            onClick={() => setLiked(!liked)}
            title={liked ? 'Remove from wishlist' : 'Add to wishlist'}
            style={{
              position: 'absolute', top: '10px', right: '10px',
              background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%',
              width: '32px', height: '32px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'transform 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.15)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24"
              fill={liked ? '#ef4444' : 'none'}
              stroke={liked ? '#ef4444' : '#9ca3af'}
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
        </div>

        {/* Card body */}
        <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#111827', flex: 1, lineHeight: '1.3' }}>
              {item.name}
            </h3>
            <span style={{
              color: mode === 'buy' ? '#1d4ed8' : '#16a34a',
              fontWeight: '700', fontSize: '15px', whiteSpace: 'nowrap', marginLeft: '8px',
            }}>
              Rs {mode === 'rent' ? item.rentalPrice : item.salePrice}
              <span style={{ fontSize: '12px', fontWeight: '400', color: '#6b7280' }}>
                {mode === 'rent' ? '/day' : ' total'}
              </span>
            </span>
          </div>

          <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
            {item.category} · {item.condition} condition
            {isLowStock && <span style={{ color: '#f59e0b', fontWeight: '600' }}> · ⚠ Low stock</span>}
          </p>

          <StarRating condition={item.condition} />

          {/* Rent / Buy toggle */}
          <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: '8px', padding: '3px', gap: '2px' }}>
            {['rent','buy'].map(m => (
              <button key={m} onClick={() => setMode(m)} style={{
                flex: 1, padding: '7px', border: 'none', borderRadius: '6px', cursor: 'pointer',
                background: mode === m ? '#fff' : 'transparent',
                color:      mode === m ? '#111827' : '#6b7280',
                fontWeight: mode === m ? '700' : '400',
                fontSize: '12px',
                boxShadow: mode === m ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s',
              }}>
                {m === 'rent' ? '🔄 Rent/day' : '🏷️ Buy'}
              </button>
            ))}
          </div>

          <div style={{ fontSize: '11px', color: '#9ca3af', textAlign: 'center' }}>
            {mode === 'rent'
              ? `Buy outright: Rs ${item.salePrice.toLocaleString()} (own it forever)`
              : `Rent from Rs ${item.rentalPrice.toLocaleString()}/day (flexible)`}
          </div>

          <div style={{ flex: 1 }} />

          {/* Stock bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>
              <span>Stock availability</span>
              <span style={{ fontWeight: '600', color: stockColor }}>{item.stockQuantity} units</span>
            </div>
            <div style={{ background: '#e5e7eb', borderRadius: '99px', height: '5px' }}>
              <div style={{ height: '5px', borderRadius: '99px', width: `${stockPct}%`, background: stockColor, transition: 'width 0.3s' }} />
            </div>
          </div>

          {/* Action button */}
          {isUnavailable ? (
            <button
              onClick={() => setShowNotify(true)}
              style={{
                width: '100%', padding: '10px', borderRadius: '8px',
                background: '#fff', color: '#374151',
                border: '1px solid #d1d5db',
                fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background  = '#fef9c3';
                e.currentTarget.style.borderColor = '#f59e0b';
                e.currentTarget.style.color       = '#a16207';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background  = '#fff';
                e.currentTarget.style.borderColor = '#d1d5db';
                e.currentTarget.style.color       = '#374151';
              }}
            >🔔 Notify Me</button>

          ) : inCart ? (
            <button
              onClick={() => onRemoveFromCart(item._id, mode)}
              style={{
                width: '100%', padding: '10px', borderRadius: '8px',
                background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5',
                fontSize: '14px', fontWeight: '600', cursor: 'pointer',
              }}
            >✕ Remove from Cart</button>

          ) : (
            <button
              onClick={() => onAddToCart({ ...item, mode, price: mode === 'rent' ? item.rentalPrice : item.salePrice })}
              style={{
                width: '100%', padding: '10px', borderRadius: '8px',
                background: mode === 'buy' ? '#1d4ed8' : '#16a34a',
                color: '#fff', border: 'none',
                fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => e.target.style.background = mode === 'buy' ? '#1e40af' : '#15803d'}
              onMouseLeave={e => e.target.style.background = mode === 'buy' ? '#1d4ed8' : '#16a34a'}
            >
              {mode === 'buy' ? '🏷️ Buy Now' : '🛒 Add to Cart'}
            </button>
          )}
        </div>
      </div>
    </>
  );
};

// ── Main Store Component ─────────────────────────────────────
const EquipmentStore = () => {
  const navigate = useNavigate();

  const [equipment, setEquipment]               = useState([]);
  const [loading, setLoading]                   = useState(true);
  const [error, setError]                       = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All Gear');
  const [searchQuery, setSearchQuery]           = useState('');
  const [currentPage, setCurrentPage]           = useState(1);
  const [cart, setCart]                         = useState([]);
  const ITEMS_PER_PAGE = 6;

  useEffect(() => {
    fetch(`${API}/display`)
      .then(res => res.json())
      .then(data => { setEquipment(data); setLoading(false); })
      .catch(() => { setError('Failed to load equipment.'); setLoading(false); });
  }, []);

  const addToCart      = (item)     => setCart(prev => [...prev, item]);
  const removeFromCart = (id, mode) => setCart(prev => prev.filter(c => !(c._id === id && c.mode === mode)));

  const filtered = equipment?.filter(item => {
    const matchCat    = selectedCategory === 'All Gear' || item.category === selectedCategory;
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated  = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleCategoryChange = (cat) => { setSelectedCategory(cat); setCurrentPage(1); };
  const handleSearch         = (e)   => { setSearchQuery(e.target.value); setCurrentPage(1); };

  const handleBookNow = () => {
    if (cart.length === 0) { alert('Please add at least one item to your cart first!'); return; }
    navigate('/booking-summary', { state: { items: cart } });
  };

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', background: '#f9fafb', minHeight: '100vh' }}>

      {/* Hero header */}
      <div style={{ padding: '40px 40px 24px', background: '#fff', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ margin: '0 0 4px', fontSize: '32px', fontWeight: '800', color: '#111827' }}>
              Premium Gear Rental
            </h1>
            <p style={{ margin: '0 0 16px', color: '#6b7280', fontSize: '15px' }}>
              Professional grade equipment for your wilderness journey.
            </p>
          </div>
          <button
            onClick={handleBookNow}
            style={{
              position: 'relative', background: '#16a34a', color: '#fff',
              border: 'none', borderRadius: '10px', padding: '12px 20px',
              fontSize: '14px', fontWeight: '700', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px',
              transition: 'background 0.2s', flexShrink: 0,
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#15803d'}
            onMouseLeave={e => e.currentTarget.style.background = '#16a34a'}
          >
            🛒 Book Now
            {cart.length > 0 && (
              <span style={{
                background: '#fff', color: '#16a34a', borderRadius: '50%',
                width: '22px', height: '22px', fontSize: '12px', fontWeight: '800',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{cart.length}</span>
            )}
          </button>
        </div>
        <div style={{ position: 'relative', maxWidth: '360px' }}>
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>🔍</span>
          <input
            type="text" placeholder="Search equipment..." value={searchQuery} onChange={handleSearch}
            style={{
              width: '100%', padding: '10px 12px 10px 36px', border: '1px solid #d1d5db',
              borderRadius: '8px', fontSize: '14px', color: '#111827', outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      {/* Cart bar */}
      {cart.length > 0 && (
        <div style={{
          background: '#f0fdf4', borderBottom: '1px solid #bbf7d0',
          padding: '12px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ fontSize: '14px', color: '#15803d', fontWeight: '600' }}>
            🛒 {cart.length} item{cart.length > 1 ? 's' : ''} in cart:{' '}
            <span style={{ fontWeight: '400', color: '#374151' }}>
              {cart.map(c => `${c.name} (${c.mode})`).join(', ')}
            </span>
          </div>
          <button onClick={handleBookNow} style={{
            background: '#16a34a', color: '#fff', border: 'none',
            borderRadius: '8px', padding: '8px 20px', fontSize: '13px', fontWeight: '700', cursor: 'pointer',
          }}>Proceed to Booking →</button>
        </div>
      )}

      {/* Body */}
      <div style={{ display: 'flex', maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>

        {/* Sidebar */}
        <div style={{ width: '200px', flexShrink: 0, marginRight: '24px' }}>
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #e5e7eb' }}>
              <span style={{ fontSize: '14px', fontWeight: '700', color: '#111827' }}>☰ Categories</span>
            </div>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => handleCategoryChange(cat)} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                width: '100%', padding: '11px 16px', border: 'none', cursor: 'pointer',
                background: selectedCategory === cat ? '#16a34a' : 'transparent',
                color:      selectedCategory === cat ? '#fff' : '#374151',
                fontSize: '14px', fontWeight: selectedCategory === cat ? '600' : '400',
                textAlign: 'left', borderBottom: '1px solid #f3f4f6', transition: 'background 0.15s',
              }}
                onMouseEnter={e => { if (selectedCategory !== cat) e.currentTarget.style.background = '#f0fdf4'; }}
                onMouseLeave={e => { if (selectedCategory !== cat) e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{ fontSize: '16px' }}>{CATEGORY_ICONS[cat]}</span>{cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div style={{ flex: 1 }}>
          {loading && <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>Loading equipment...</div>}
          {error   && <div style={{ textAlign: 'center', padding: '60px', color: '#ef4444' }}>{error}</div>}

          {!loading && !error && (
            <>
              <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#6b7280' }}>
                Showing {paginated.length} of {filtered.length} items
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                {paginated.map(item => (
                  <EquipmentCard key={item._id} item={item} cart={cart} onAddToCart={addToCart} onRemoveFromCart={removeFromCart} />
                ))}
              </div>
              {paginated.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>No equipment found.</div>
              )}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '32px' }}>
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                    style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid #d1d5db', background: '#fff', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', color: '#374151', fontSize: '16px' }}>‹</button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button key={page} onClick={() => setCurrentPage(page)} style={{
                      width: '36px', height: '36px', borderRadius: '8px', border: '1px solid #d1d5db',
                      background: currentPage === page ? '#16a34a' : '#fff',
                      color: currentPage === page ? '#fff' : '#374151',
                      fontWeight: currentPage === page ? '700' : '400', cursor: 'pointer', fontSize: '14px',
                    }}>{page}</button>
                  ))}
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                    style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid #d1d5db', background: '#fff', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', color: '#374151', fontSize: '16px' }}>›</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EquipmentStore;