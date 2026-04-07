import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const amenityIcons = {
  'Free WiFi': '📶', 'Wifi': '📶', 'Kitchen': '🍳', 'Outdoor Kitchen': '🍳',
  'Free Parking': '🅿️', 'Fire Pit': '🔥', 'Hiking Trails': '🥾',
  'Kayak Rental': '🚣', 'Fishing Dock': '🎣', 'BBQ Area': '🥩',
  'Campfire Ring': '🔥', 'Stargazing Deck': '🔭', 'Hot Showers': '🚿',
  'Picnic Area': '🧺', 'Playground': '🛝', 'Pet Friendly': '🐾', 'Water Hookup': '💧',
};

const CampsiteList = () => {
  const [campsites, setCampsites] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/api/campsites').then(({ data }) => {
      setCampsites(data);
      setFiltered(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = campsites;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
      );
    }
    if (location) {
      result = result.filter(c => c.location.toLowerCase().includes(location.toLowerCase()));
    }
    if (maxPrice) {
      result = result.filter(c => c.price <= Number(maxPrice));
    }
    // Date filter: if user picks dates, show only available sites
    // (in a real app you'd check reservations, but here it's based on availability flag)
    if (checkIn || checkOut) {
      result = result.filter(c => c.availability);
    }
    setFiltered(result);
  }, [search, location, maxPrice, checkIn, checkOut, campsites]);

  const clearFilters = () => { setSearch(''); setLocation(''); setMaxPrice(''); setCheckIn(''); setCheckOut(''); };

  return (
    <div className="main-container">
      <div className="campsite-list-header">
        <h1>Available Campsites</h1>
        <p className="breadcrumb">Discover your perfect nature retreat</p>
      </div>

      <div className="search-filter-bar">
        <div className="search-input-wrap">
          <span className="search-icon-inner">🔍</span>
          <input
            type="text"
            placeholder="Search by name or keyword..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="search-bar-input"
          />
        </div>
        <div className="filter-price">
          <label>Location</label>
          <input type="text" placeholder="e.g. Colorado" value={location} onChange={e => setLocation(e.target.value)} />
        </div>
        <div className="filter-price">
          <label>Max Price / night ($)</label>
          <input type="number" placeholder="e.g. 150" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
        </div>
        <div className="filter-price">
          <label>Check In</label>
          <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)} min={new Date().toISOString().split('T')[0]} />
        </div>
        <div className="filter-price">
          <label>Check Out</label>
          <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)} min={checkIn || new Date().toISOString().split('T')[0]} />
        </div>
        <button className="btn-host filter-reset" onClick={clearFilters}>Clear</button>
      </div>

      {loading ? (
        <div className="loading-state">Loading campsites...</div>
      ) : filtered.length === 0 ? (
        <div className="loading-state">No campsites match your search.</div>
      ) : (
        <div className="campsite-grid">
          {filtered.map(site => (
            <Link to={`/campsites/${site._id}`} key={site._id} className="campsite-card">
              <div className="campsite-card-img">
                {site.images && site.images.length > 0 ? (
                  <img
                    src={site.images[0]}
                    alt={site.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div className="campsite-card-img-placeholder">⛺</div>
                )}
                <div className="campsite-card-badge">{site.availability ? 'Available' : 'Booked'}</div>
              </div>
              <div className="campsite-card-body">
                <h3>{site.title}</h3>
                <p className="campsite-card-location">📍 {site.location}</p>
                <p className="campsite-card-desc">{site.description.slice(0, 90)}...</p>
                <div className="campsite-card-amenities">
                  {site.amenities.slice(0, 3).map((a, i) => (
                    <span key={i} className="amenity-tag">{amenityIcons[a] || '✔'} {a}</span>
                  ))}
                </div>
                <div className="campsite-card-footer">
                  <div className="campsite-card-price">
                    <span className="price">${site.price}</span>
                    <span className="price-subtitle"> / night</span>
                  </div>
                  <button className="btn-book-small">View & Book →</button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default CampsiteList;
