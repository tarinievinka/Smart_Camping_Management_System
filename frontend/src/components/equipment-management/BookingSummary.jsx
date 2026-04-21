import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_URL;
const EQUIP_API = process.env.REACT_APP_API_URL + '/api/equipment';

// ── No CATEGORY_IMAGES — only admin-uploaded photos shown ──

// Grey placeholder for items with no photo
const NoPhoto = ({ size = '72px' }) => (
  <div style={{
    width: size, height: size, borderRadius: '8px', flexShrink: 0,
    background: '#f3f4f6', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: '4px',
  }}>
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  </div>
);

const BookingSummary = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { items } = location.state || {};

  const today = new Date();
  const returnDefault = new Date(today);
  returnDefault.setDate(today.getDate() + 4);
  const fmt = (d) => d.toISOString().split('T')[0];

  const [pickupDate, setPickupDate] = useState(fmt(today));
  const [returnDate, setReturnDate] = useState(fmt(returnDefault));
  const [pickupTime, setPickupTime] = useState('09:00');
  const [returnTime, setReturnTime] = useState('17:00');
  const [processing, setProcessing] = useState(false);

  const [itemStates, setItemStates] = useState(
    (items || []).reduce((acc, item) => {
      acc[item._id + item.mode] = { quantity: 1, removed: false };
      return acc;
    }, {})
  );

  if (!items || items.length === 0) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
        <p style={{ color: '#6b7280', marginBottom: '16px', fontSize: '16px' }}>No equipment selected.</p>
        <button onClick={() => navigate('/equipment-store')} style={{
          background: '#16a34a', color: '#fff', border: 'none',
          padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600',
        }}>← Browse Equipment</button>
      </div>
    );
  }

  const ms = new Date(returnDate) - new Date(pickupDate);
  const days = Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
  const nights = Math.max(0, days - 1);

  const key = (item) => item._id + item.mode;

  const updateQty = (item, delta) => {
    setItemStates(prev => {
      const k = key(item);
      const currentQty = prev[k]?.quantity || 1;
      const maxStock = item.stockQuantity || 999; // Fallback if stockQuantity is missing
      const newQty = Math.min(maxStock, Math.max(1, currentQty + delta));
      return { ...prev, [k]: { ...prev[k], quantity: newQty } };
    });
  };

  const removeItem = (item) =>
    setItemStates(prev => ({ ...prev, [key(item)]: { ...prev[key(item)], removed: true } }));

  const undoRemove = (item) =>
    setItemStates(prev => ({ ...prev, [key(item)]: { ...prev[key(item)], removed: false } }));

  const activeItems = items.filter(i => !itemStates[key(i)]?.removed);

  const itemsTotal = activeItems.reduce((sum, item) => {
    const state = itemStates[key(item)] || { quantity: 1 };
    if (item.mode === 'buy') return sum + item.salePrice * state.quantity;
    return sum + item.rentalPrice * state.quantity * days;
  }, 0);

  const serviceFee = parseFloat((itemsTotal * 0.05).toFixed(2));
  const totalAmount = (itemsTotal + serviceFee).toFixed(2);

  const handleProceed = async () => {
    if (activeItems.length === 0) return;
    setProcessing(true);
    try {
      // Stock reduction will now be handled ONLY after successful payment confirmation
      navigate('/payment-checkout', {
        state: {
          amount: parseFloat(totalAmount),
          bookingType: 'EquipmentBooking',
          title: 'Equipment Booking',
          dates: `${pickupDate} to ${returnDate}`,
          stay: activeItems.some(i => i.mode === 'rent') ? `${nights} Night${nights !== 1 ? 's' : ''} / ${days} Day${days !== 1 ? 's' : ''}` : 'Purchase',
          guests: `${activeItems.length} Item${activeItems.length !== 1 ? 's' : ''}`,
          image: activeItems.length > 0 && activeItems[0].imageUrl ? `${API_BASE}${activeItems[0].imageUrl}` : 'https://images.unsplash.com/photo-1504280741562-60234eb0fded?w=150&h=150&fit=crop',
          equipmentItems: activeItems.map(item => ({
            _id: item._id,
            quantity: (itemStates[key(item)] || { quantity: 1 }).quantity,
            mode: item.mode
          })),
          equipmentBookingDraft: {
            pickupDate,
            returnDate,
            days,
            totalAmount: parseFloat(totalAmount),
            items: activeItems.map(item => {
              const quantity = (itemStates[key(item)] || { quantity: 1 }).quantity;
              const unitPrice = item.mode === 'buy' ? item.salePrice : item.rentalPrice;
              const lineTotal = item.mode === 'buy'
                ? unitPrice * quantity
                : unitPrice * quantity * days;
              return {
                _id: item._id,
                name: item.name,
                mode: item.mode,
                quantity,
                unitPrice,
                imageUrl: item.imageUrl || '',
                lineTotal
              };
            })
          }
        }
      });
    } catch {
      alert('Failed to process booking. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div style={{ background: '#f9fafb', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>

      {/* Header */}
      <div style={{
        background: '#fff', padding: '16px 32px', borderBottom: '1px solid #e5e7eb',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => navigate(-1)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#374151' }}>←</button>
          <span style={{ fontSize: '16px', fontWeight: '700', color: '#111827' }}>Review Your Booking</span>
        </div>
        <button style={{
          background: '#16a34a', color: '#fff', border: 'none',
          padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600',
        }}>Need Help?</button>
      </div>

      {/* Body */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
        <h1 style={{ margin: '0 0 4px', fontSize: '26px', fontWeight: '800', color: '#111827' }}>Booking Summary</h1>
        <p style={{ margin: '0 0 28px', color: '#6b7280', fontSize: '14px' }}>
          Please review your selected gear and rental duration before confirming your adventure.
        </p>

        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>

          {/* Left column */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Rental Duration */}
            {activeItems.some(i => i.mode === 'rent') && (
              <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '24px' }}>
                <h2 style={{ margin: '0 0 20px', fontSize: '15px', fontWeight: '700', color: '#111827' }}>📅 Rental Duration</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                  <div style={{ flex: 1, background: '#f9fafb', borderRadius: '10px', padding: '16px', border: '1px solid #e5e7eb' }}>
                    <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pick Up</div>
                    <input type="date" value={pickupDate} onChange={e => setPickupDate(e.target.value)}
                      style={{ border: 'none', background: 'transparent', fontSize: '15px', fontWeight: '700', color: '#111827', cursor: 'pointer', width: '100%' }} />
                    <input type="time" value={pickupTime} onChange={e => setPickupTime(e.target.value)}
                      style={{ border: 'none', background: 'transparent', fontSize: '13px', color: '#6b7280', cursor: 'pointer', marginTop: '4px', width: '100%' }} />
                  </div>
                  <div style={{ fontSize: '20px', color: '#16a34a' }}>→</div>
                  <div style={{ flex: 1, background: '#f9fafb', borderRadius: '10px', padding: '16px', border: '1px solid #e5e7eb' }}>
                    <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Return</div>
                    <input type="date" value={returnDate} onChange={e => setReturnDate(e.target.value)}
                      style={{ border: 'none', background: 'transparent', fontSize: '15px', fontWeight: '700', color: '#111827', cursor: 'pointer', width: '100%' }} />
                    <input type="time" value={returnTime} onChange={e => setReturnTime(e.target.value)}
                      style={{ border: 'none', background: 'transparent', fontSize: '13px', color: '#6b7280', cursor: 'pointer', marginTop: '4px', width: '100%' }} />
                  </div>
                </div>
                <div style={{ textAlign: 'center', color: '#16a34a', fontWeight: '600', fontSize: '13px' }}>
                  Total: {nights} Night{nights !== 1 ? 's' : ''} / {days} Day{days !== 1 ? 's' : ''}
                </div>
              </div>
            )}

            {/* Selected Gear */}
            <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#111827' }}>🎒 Selected Gear</h2>
                <span style={{ fontSize: '13px', color: '#16a34a', fontWeight: '600' }}>
                  {activeItems.length} Item{activeItems.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {items.map(item => {
                  const state = itemStates[key(item)] || { quantity: 1, removed: false };
                  // ── Only show admin-uploaded photo ──
                  const imgSrc = item.imageUrl ? `${API_BASE}${item.imageUrl}` : null;
                  const lineTotal = item.mode === 'buy'
                    ? item.salePrice * state.quantity
                    : item.rentalPrice * state.quantity * days;

                  if (state.removed) {
                    return (
                      <div key={key(item)} style={{
                        padding: '14px 16px', background: '#fef2f2', borderRadius: '10px',
                        border: '1px dashed #fca5a5', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      }}>
                        <span style={{ fontSize: '13px', color: '#9ca3af' }}>"{item.name}" ({item.mode}) removed</span>
                        <button onClick={() => undoRemove(item)}
                          style={{ background: 'none', border: 'none', color: '#16a34a', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                          Undo
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div key={key(item)} style={{
                      display: 'flex', alignItems: 'center', gap: '16px',
                      padding: '16px', background: '#f9fafb', borderRadius: '10px', border: '1px solid #e5e7eb',
                    }}>
                      {/* ── Photo or grey placeholder ── */}
                      {imgSrc ? (
                        <img src={imgSrc} alt={item.name}
                          style={{ width: '72px', height: '72px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} />
                      ) : (
                        <NoPhoto size="72px" />
                      )}

                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontWeight: '700', fontSize: '15px', color: '#111827' }}>{item.name}</span>
                          <span style={{
                            fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px',
                            background: item.mode === 'buy' ? '#dbeafe' : '#dcfce7',
                            color: item.mode === 'buy' ? '#1d4ed8' : '#15803d',
                          }}>
                            {item.mode === 'buy' ? '🏷️ PURCHASE' : '🔄 RENTAL'}
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
                          {item.category} · {item.condition} condition
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                          <span style={{ fontSize: '12px', color: '#374151' }}>Qty:</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button
                              onClick={() => updateQty(item, -1)}
                              style={{
                                width: '24px', height: '24px', borderRadius: '50%',
                                border: '1px solid #d1d5db', background: '#fff',
                                cursor: 'pointer', fontWeight: '700', fontSize: '14px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                              }}
                            >−</button>
                            <span style={{ fontWeight: '700', fontSize: '14px', minWidth: '20px', textAlign: 'center' }}>
                              {state.quantity}
                            </span>
                            <button
                              onClick={() => updateQty(item, 1)}
                              style={{
                                width: '24px', height: '24px', borderRadius: '50%',
                                border: '1px solid #d1d5db', background: '#fff',
                                cursor: 'pointer', fontWeight: '700', fontSize: '14px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                              }}
                            >+</button>
                          </div>
                          <span style={{ fontSize: '12px', color: '#6b7280', marginLeft: '4px' }}>
                            {item.mode === 'buy'
                              ? `Rs ${item.salePrice.toLocaleString()} each`
                              : `Rs ${item.rentalPrice.toLocaleString()}/day`}
                          </span>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontWeight: '700', fontSize: '15px', color: '#111827', marginBottom: '6px' }}>
                          Rs {lineTotal.toLocaleString()}
                        </div>
                        {item.mode === 'rent' && (
                          <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>
                            {state.quantity} × Rs {item.rentalPrice} × {days}d
                          </div>
                        )}
                        <button onClick={() => removeItem(item)}
                          style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Payment sidebar */}
          <div style={{
            width: '300px', flexShrink: 0, background: '#fff',
            borderRadius: '12px', border: '1px solid #e5e7eb', padding: '24px',
            position: 'sticky', top: '24px',
          }}>
            <h2 style={{ margin: '0 0 20px', fontSize: '15px', fontWeight: '700', color: '#111827' }}>💳 Payment Details</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
              {activeItems.map(item => {
                const state = itemStates[key(item)] || { quantity: 1 };
                const lineTotal = item.mode === 'buy'
                  ? item.salePrice * state.quantity
                  : item.rentalPrice * state.quantity * days;
                return (
                  <div key={key(item)} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#374151' }}>
                    <span>
                      {item.name}{' '}
                      <span style={{
                        fontSize: '10px', fontWeight: '700', padding: '1px 5px', borderRadius: '3px',
                        background: item.mode === 'buy' ? '#dbeafe' : '#dcfce7',
                        color: item.mode === 'buy' ? '#1d4ed8' : '#15803d',
                      }}>
                        {item.mode === 'buy' ? 'buy' : `${days}d`}
                      </span>
                    </span>
                    <span style={{ fontWeight: '600' }}>Rs {lineTotal.toLocaleString()}</span>
                  </div>
                );
              })}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#374151' }}>
                <span>Service Fee (5%)</span>
                <span style={{ fontWeight: '600' }}>Rs {serviceFee.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#374151' }}>
                <span>Insurance (Optional)</span>
                <span style={{ fontWeight: '600', color: '#16a34a' }}>Rs 0.00</span>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px', marginBottom: '20px' }}>
              <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Total Amount</div>
              <div style={{ fontSize: '28px', fontWeight: '800', color: '#111827' }}>
                Rs {parseFloat(totalAmount).toLocaleString()}
              </div>
              {activeItems.some(i => i.mode === 'rent') && (
                <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
                  Rental total for {days} day{days !== 1 ? 's' : ''}
                </div>
              )}
            </div>

            <button
              onClick={handleProceed}
              disabled={activeItems.length === 0 || processing}
              style={{
                width: '100%', padding: '14px',
                background: activeItems.length === 0 || processing ? '#9ca3af' : '#16a34a',
                color: '#fff', border: 'none', borderRadius: '10px',
                fontSize: '14px', fontWeight: '700',
                cursor: activeItems.length === 0 || processing ? 'not-allowed' : 'pointer',
                marginBottom: '12px', transition: 'background 0.2s',
              }}
              onMouseEnter={e => { if (activeItems.length > 0 && !processing) e.target.style.background = '#15803d'; }}
              onMouseLeave={e => { if (activeItems.length > 0 && !processing) e.target.style.background = '#16a34a'; }}
            >
              {processing ? '⏳ Processing...' : 'Pay Now'}
            </button>

            <p style={{ fontSize: '11px', color: '#9ca3af', textAlign: 'center', margin: 0 }}>
              By clicking proceed, you agree to the Rental Terms & Conditions
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default BookingSummary;