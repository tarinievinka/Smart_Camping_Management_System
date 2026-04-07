import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const emptyForm = {
  title: '', description: '', location: '', price: '',
  amenities: '', images: '', contactNumber: '', minBookingDays: 1, maxBookingDays: 30, availability: true,
};

const CampsiteOwnerDashboard = () => {
  const [activeTab, setActiveTab] = useState('campsites');
  const [campsites, setCampsites] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editSite, setEditSite] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [priceError, setPriceError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'campsite-owner') { navigate('/login'); return; }
    fetchData();
  }, [user, navigate]);

  const config = () => ({ headers: { Authorization: `Bearer ${user.token}` } });

  const fetchData = async () => {
    const [sitesRes, bookRes] = await Promise.all([
      axios.get('/api/campsites/mine', config()),
      axios.get('/api/reservations/owner', config()),
    ]);
    setCampsites(sitesRes.data);
    setBookings(bookRes.data);
  };

  const openAdd = () => { setEditSite(null); setForm(emptyForm); setPriceError(''); setShowForm(true); };
  const openEdit = (s) => {
    setEditSite(s);
    setPriceError('');
    setForm({
      title: s.title, description: s.description, location: s.location,
      price: s.price, amenities: s.amenities.join(', '),
      images: s.images.join('\n'),
      contactNumber: s.contactNumber || '',
      minBookingDays: s.minBookingDays, maxBookingDays: s.maxBookingDays,
      availability: s.availability,
    });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (Number(form.price) < 0) {
      setPriceError("can't enter a miners numbers..");
      return;
    }
    const payload = {
      ...form,
      price: Number(form.price),
      amenities: form.amenities.split(',').map(s => s.trim()).filter(Boolean),
      images: form.images.split('\n').map(s => s.trim()).filter(Boolean),
      minBookingDays: Number(form.minBookingDays),
      maxBookingDays: Number(form.maxBookingDays),
    };
    if (editSite) await axios.put(`/api/campsites/${editSite._id}`, payload, config());
    else await axios.post('/api/campsites', payload, config());
    setShowForm(false);
    fetchData();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this campsite?')) return;
    await axios.delete(`/api/campsites/${id}`, config());
    setCampsites(c => c.filter(x => x._id !== id));
  };

  const campsiteForm = (
    <div className="admin-form-card">
      <h3>{editSite ? 'Edit Campsite' : 'Add New Campsite'}</h3>
      <form onSubmit={handleSave} className="auth-form">
        <div className="form-row-2">
          <div className="form-group">
            <label>Title <span style={{ color: 'red' }}>*</span></label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Campsite name" required />
          </div>
          <div className="form-group">
            <label>Location <span style={{ color: 'red' }}>*</span></label>
            <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value.replace(/[0-9]/g, '') })} placeholder="City, Country" required />
          </div>
        </div>
        <div className="form-group">
          <label>Description <span style={{ color: 'red' }}>*</span></label>
          <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows="3" placeholder="Describe the campsite..." required />
        </div>
        <div className="form-row-2">
          <div className="form-group">
            <label>Price per night ($) <span style={{ color: 'red' }}>*</span></label>
            <input type="number" value={form.price} onChange={e => {
              const val = e.target.value;
              if (val < 0) {
                setPriceError("can't enter a miners numbers..");
              } else {
                setPriceError('');
              }
              setForm({ ...form, price: val });
            }} required />
            {priceError && <span style={{ color: 'red', fontSize: '12px', marginTop: '4px', display: 'block' }}>{priceError}</span>}
          </div>
          <div className="form-group">
            <label>Amenities (comma separated)</label>
            <input value={form.amenities} onChange={e => setForm({ ...form, amenities: e.target.value })} placeholder="WiFi, Fire Pit, Parking" />
          </div>
        </div>
        <div className="form-row-2">
          <div className="form-group">
            <label>Min Booking Days <span style={{ color: 'red' }}>*</span></label>
            <input type="number" min="1" max="1" value={form.minBookingDays} onChange={e => setForm({ ...form, minBookingDays: e.target.value })} onBlur={e => {
              if (e.target.value !== '1') setForm({ ...form, minBookingDays: 1 });
            }} required />
          </div>
          <div className="form-group">
            <label>Max Booking Days <span style={{ color: 'red' }}>*</span></label>
            <input type="number" min="30" max="30" value={form.maxBookingDays} onChange={e => setForm({ ...form, maxBookingDays: e.target.value })} onBlur={e => {
              if (e.target.value !== '30') setForm({ ...form, maxBookingDays: 30 });
            }} required />
          </div>
        </div>
        <div className="form-group">
          <label>Image URLs (one per line)</label>
          <textarea value={form.images} onChange={e => setForm({ ...form, images: e.target.value })} rows="3" placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg" />
          <span style={{ fontSize: '12px', color: '#999' }}>Paste public image URLs, one per line</span>
        </div>
        <div className="form-group">
          <label>Contact Phone Number <span style={{ color: 'red' }}>*</span></label>
          <input type="tel" pattern="\d{10}" minLength="10" maxLength="10" value={form.contactNumber} onChange={e => setForm({ ...form, contactNumber: e.target.value.replace(/\D/g, '') })} placeholder="+94" required />
          <span style={{ fontSize: '12px', color: '#999' }}>Customers will see this to call for more info</span>
        </div>
        <div className="form-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input type="checkbox" checked={form.availability} onChange={e => setForm({ ...form, availability: e.target.checked })} />
            Currently Available for Booking
          </label>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button type="submit" className="btn-host" style={{ flex: 1 }}>{editSite ? 'Update Campsite' : 'Create Campsite'}</button>
          <button type="button" onClick={() => setShowForm(false)} style={{ flex: 1, padding: '12px', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', background: 'white' }}>Cancel</button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="admin-page">
      <div className="admin-sidebar">
        <div className="admin-brand">🏡 Owner Portal</div>
        <button className={`admin-tab-btn ${activeTab === 'campsites' ? 'active' : ''}`} onClick={() => setActiveTab('campsites')}>⛺ My Campsites</button>
        <button className={`admin-tab-btn ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}>📋 Booking History</button>
      </div>

      <div className="admin-content">
        {activeTab === 'campsites' && (
          <div>
            <div className="admin-section-header">
              <h2>My Campsites</h2>
              <button className="btn-host" onClick={openAdd}>+ Add New Campsite</button>
            </div>
            {showForm && campsiteForm}
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr><th>Title</th><th>Location</th><th>Price</th><th>Min/Max Stay</th><th>Available</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {campsites.length === 0 ? (
                    <tr><td colSpan="6" style={{ textAlign: 'center', color: '#999', padding: '40px' }}>No campsites yet. Add your first one!</td></tr>
                  ) : campsites.map(site => (
                    <tr key={site._id}>
                      <td><strong>{site.title}</strong></td>
                      <td>📍 {site.location}</td>
                      <td>${site.price}/night</td>
                      <td>{site.minBookingDays}–{site.maxBookingDays} nights</td>
                      <td><span className={`role-badge ${site.availability ? 'user' : 'admin'}`}>{site.availability ? 'Yes' : 'No'}</span></td>
                      <td style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="admin-action-btn edit" onClick={() => openEdit(site)}>✏️ Edit</button>
                        <button className="admin-action-btn delete" onClick={() => handleDelete(site._id)}>🗑 Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div>
            <div className="admin-section-header">
              <h2>Booking History</h2>
              <span className="admin-count">{bookings.length} bookings</span>
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr><th>Customer</th><th>Campsite</th><th>Check In</th><th>Check Out</th><th>Total</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {bookings.length === 0 ? (
                    <tr><td colSpan="6" style={{ textAlign: 'center', color: '#999', padding: '40px' }}>No bookings yet.</td></tr>
                  ) : bookings.map(b => (
                    <tr key={b._id}>
                      <td><strong>{b.user?.username}</strong><br /><span style={{ fontSize: '12px', color: '#999' }}>{b.user?.email}</span></td>
                      <td>{b.campsite?.title}<br /><span style={{ fontSize: '12px', color: '#999' }}>📍 {b.campsite?.location}</span></td>
                      <td>{new Date(b.checkInDate).toLocaleDateString()}</td>
                      <td>{new Date(b.checkOutDate).toLocaleDateString()}</td>
                      <td><strong>${b.totalPrice}</strong></td>
                      <td><span className={`role-badge ${b.status === 'confirmed' ? 'user' : 'admin'}`}>{b.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CampsiteOwnerDashboard;
