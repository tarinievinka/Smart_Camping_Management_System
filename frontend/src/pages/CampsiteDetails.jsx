import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import SidebarBooking from '../components/camping-sites-management/SidebarBooking';
import AvailabilityCalendar from '../components/camping-sites-management/AvailabilityCalendar';

const CampsiteDetails = () => {
  const { id } = useParams();
  const [campsite, setCampsite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookedRanges, setBookedRanges] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');

  useEffect(() => {
    axios.get(`/api/campsites/${id}`).then(({ data }) => {
      setCampsite(data);
      setLoading(false);
    }).catch(() => navigate('/campsites'));
    axios.get(`/api/reservations/campsite/${id}/bookeddates`)
      .then(({ data }) => setBookedRanges(data))
      .catch(() => {});
  }, [id, navigate]);

  if (loading) return <div className="main-container loading-state">Loading campsite details...</div>;
  if (!campsite) return null;

  const amenityIcons = {
    'Free WiFi': '📶', 'Wifi': '📶', 'Kitchen': '🍳', 'Outdoor Kitchen': '🍳',
    'Free Parking': '🅿️', 'Fire Pit': '🔥', 'Hiking Trails': '🥾',
    'Kayak Rental': '🚣', 'Fishing Dock': '🎣', 'BBQ Area': '🥩',
    'Campfire Ring': '🔥', 'Stargazing Deck': '🔭', 'Guided Hikes': '🗺️',
    'Equipment Rental': '⛺', 'Hot Showers': '🚿', 'Picnic Area': '🧺',
    'Playground': '🛝', 'Pet Friendly': '🐾', 'Water Hookup': '💧',
  };

  return (
    <main className="main-container">
      {/* Hero Photo Grid */}
      <div className="carousel-container">
        <div className="campsite-hero-main">
          {campsite.images && campsite.images[0] ? (
            <img src={campsite.images[0]} alt={campsite.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
          ) : (
            <div className="hero-img-placeholder">
              <span style={{ fontSize: '80px' }}>⛺</span>
              <p style={{ color: 'rgba(255,255,255,0.8)', marginTop: '16px', fontSize: '18px' }}>{campsite.title}</p>
            </div>
          )}
        </div>
        <div className="carousel-grid">
          <div className="campsite-hero-small">
            {campsite.images && campsite.images[1] ? (
              <img src={campsite.images[1]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
            ) : <span style={{ fontSize: '50px' }}>🌲</span>}
          </div>
          <div className="campsite-hero-small">
            {campsite.images && campsite.images[2] ? (
              <img src={campsite.images[2]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
            ) : <span style={{ fontSize: '50px' }}>🌅</span>}
          </div>
        </div>
      </div>

      <div className="content-wrapper">
        {/* Left Section */}
        <div className="left-section">
          <h1>{campsite.title}</h1>
          <div className="breadcrumb">{campsite.location} · Hosted by Pine Ridge Team</div>
          <div className="rating">
            <span className="stars">★★★★★</span>
            <span>4.5+ · Great Reviews</span>
          </div>

          {/* About */}
          <div className="about-section">
            <h2>About This Campsite</h2>
            <p className="about-description">{campsite.description}</p>
            <div className="amenities-grid">
              <div className="amenity-item">
                <div className="amenity-icon">📍</div>
                <div className="amenity-text">
                  <h3>Location</h3>
                  <p>{campsite.location}</p>
                </div>
              </div>
              <div className="amenity-item">
                <div className="amenity-icon">💰</div>
                <div className="amenity-text">
                  <h3>Price</h3>
                  <p>${campsite.price} per night</p>
                </div>
              </div>
              <div className="amenity-item">
                <div className="amenity-icon">✅</div>
                <div className="amenity-text">
                  <h3>Availability</h3>
                  <p>{campsite.availability ? 'Available to Book' : 'Currently Booked'}</p>
                </div>
              </div>
              <div className="amenity-item">
                <div className="amenity-icon">🏕️</div>
                <div className="amenity-text">
                  <h3>Stay Duration</h3>
                  <p>{campsite.minBookingDays}–{campsite.maxBookingDays} nights</p>
                </div>
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="amenities-section">
            <h2>What This Place Offers</h2>
            <div className="amenities-list">
              {campsite.amenities.map((a, i) => (
                <div key={i} className="amenity">
                  <div className="amenity-check">{amenityIcons[a] ? amenityIcons[a] : '✔'}</div>
                  <span>{a}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Availability Calendar */}
          <div className="calendar-section">
            <h2>Availability</h2>
            <AvailabilityCalendar bookedRanges={bookedRanges} />
          </div>

          {/* Contact */}
          {campsite.contactNumber && (
            <div className="about-section" style={{ marginBottom: '24px' }}>
              <h2>Contact Info</h2>
              <div className="amenity-item">
                <div className="amenity-icon">📞</div>
                <div className="amenity-text">
                  <h3>Phone Number</h3>
                  <p><a href={`tel:${campsite.contactNumber}`} style={{ color: '#27ae60', textDecoration: 'none', fontWeight: '600' }}>{campsite.contactNumber}</a></p>
                </div>
              </div>
            </div>
          )}

          {/* Map */}
          <div className="map-section">
            <h2>Location</h2>
            <div className="map-container">
              <div className="map-pin">📍</div>
              <div className="map-placeholder">
                <p style={{ fontSize: '18px', marginBottom: '8px' }}>🗺️</p>
                <p>{campsite.location}</p>
              </div>
            </div>
            <p className="location-name">📍 {campsite.location}</p>
          </div>
        </div>

        {/* Sidebar */}
        <SidebarBooking
          campsite={campsite}
          checkInDate={checkInDate}
          checkOutDate={checkOutDate}
          setCheckInDate={setCheckInDate}
          setCheckOutDate={setCheckOutDate}
        />
      </div>
    </main>
  );
};

export default CampsiteDetails;
