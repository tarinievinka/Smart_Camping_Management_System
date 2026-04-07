import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [editIn, setEditIn] = useState('');
  const [editOut, setEditOut] = useState('');
  const [msg, setMsg] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchBookings();
  }, [user, navigate]);

  const cfg = () => ({ headers: { Authorization: `Bearer ${user.token}` } });

  const fetchBookings = async () => {
    const { data } = await axios.get('/api/reservations/myreservations', cfg());
    setBookings(data);
    setLoading(false);
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    await axios.delete(`/api/reservations/${id}`, cfg());
    setBookings(b => b.filter(x => x._id !== id));
  };

  const handleEdit = (b) => {
    setEditId(b._id);
    setEditIn(b.checkInDate?.slice(0, 10) || '');
    setEditOut(b.checkOutDate?.slice(0, 10) || '');
    setMsg('');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      await axios.put(`/api/reservations/${editId}`, { checkInDate: editIn, checkOutDate: editOut }, cfg());
      setMsg('✅ Booking updated!');
      setEditId(null);
      fetchBookings();
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.message || 'Update failed'));
    }
  };

  const nights = (inDate, outDate) =>
    Math.max(1, Math.ceil((new Date(outDate) - new Date(inDate)) / 86400000));

  return (
    <div className="main-container">
      <div className="campsite-list-header">
        <h1>My Bookings</h1>
        <p className="breadcrumb">Manage your camping reservations</p>
      </div>

      {msg && <div className={`auth-${msg.startsWith('✅') ? '' : 'error'}`} style={{ marginBottom: '16px', padding: '12px 16px', borderRadius: '8px', background: msg.startsWith('✅') ? '#f0faf4' : '#fff5f5', color: msg.startsWith('✅') ? '#27ae60' : '#e53e3e', border: `1px solid ${msg.startsWith('✅') ? '#c6edd3' : '#fed7d7'}` }}>{msg}</div>}

      {loading ? (
        <div className="loading-state">Loading your bookings...</div>
      ) : bookings.length === 0 ? (
        <div className="loading-state">
          <p style={{ marginBottom: '16px' }}>You haven't made any bookings yet.</p>
          <Link to="/campsites" className="btn-host" style={{ textDecoration: 'none', display: 'inline-block' }}>Browse Campsites</Link>
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map(b => (
            <div key={b._id} className={`booking-card ${b.status === 'cancelled' ? 'cancelled' : ''}`}>
              <div className="booking-card-img">
                {b.campsite?.images?.[0]
                  ? <img src={b.campsite.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ fontSize: '48px' }}>⛺</span>}
              </div>
              <div className="booking-card-info">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3>{b.campsite?.title || 'Campsite'}</h3>
                    <p className="campsite-card-location">📍 {b.campsite?.location}</p>
                  </div>
                  <span className={`role-badge ${b.status === 'cancelled' ? 'admin' : 'user'}`}>{b.status}</span>
                </div>

                {editId === b._id ? (
                  <form onSubmit={handleUpdate} style={{ marginTop: '12px' }}>
                    <div className="form-row-2">
                      <div className="form-group">
                        <label>New Check In</label>
                        <input type="date" value={editIn} onChange={e => setEditIn(e.target.value)} min={new Date().toISOString().split('T')[0]} required />
                      </div>
                      <div className="form-group">
                        <label>New Check Out</label>
                        <input type="date" value={editOut} onChange={e => setEditOut(e.target.value)} min={editIn} required />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                      <button type="submit" className="btn-host" style={{ flex: 1, padding: '10px' }}>Save Changes</button>
                      <button type="button" onClick={() => setEditId(null)} style={{ flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', background: 'white' }}>Cancel Edit</button>
                    </div>
                  </form>
                ) : (
                  <div className="booking-dates">
                    <div className="booking-date-block">
                      <span className="booking-date-label">Check In</span>
                      <span className="booking-date-value">{new Date(b.checkInDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                    </div>
                    <div className="booking-date-arrow">→</div>
                    <div className="booking-date-block">
                      <span className="booking-date-label">Check Out</span>
                      <span className="booking-date-value">{new Date(b.checkOutDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                    </div>
                    <div className="booking-date-block">
                      <span className="booking-date-label">Duration</span>
                      <span className="booking-date-value">{nights(b.checkInDate, b.checkOutDate)} nights</span>
                    </div>
                    <div className="booking-date-block">
                      <span className="booking-date-label">Total</span>
                      <span className="booking-date-value" style={{ fontWeight: '700', color: '#27ae60' }}>${b.totalPrice}</span>
                    </div>
                  </div>
                )}

                {b.campsite?.contactNumber && (
                  <p style={{ fontSize: '13px', color: '#666', marginTop: '8px' }}>📞 Contact: <a href={`tel:${b.campsite.contactNumber}`} style={{ color: '#27ae60' }}>{b.campsite.contactNumber}</a></p>
                )}

                {b.status !== 'cancelled' && editId !== b._id && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <button className="admin-action-btn edit" onClick={() => handleEdit(b)}>✏️ Edit Dates</button>
                    <button className="admin-action-btn delete" onClick={() => handleCancel(b._id)}>✕ Cancel Booking</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
