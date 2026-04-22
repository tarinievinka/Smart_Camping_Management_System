import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';


export default function SidebarBooking({ campsite, checkInDate, checkOutDate, setCheckInDate, setCheckOutDate }) {
  const pricePerNight = campsite?.price || 120;
  const nights = checkInDate && checkOutDate
    ? Math.max(1, Math.ceil((new Date(checkOutDate) - new Date(checkInDate)) / 86400000))
    : 2;
  const subtotal = pricePerNight * nights;
  const cleaningFee = 35;
  const serviceFee = 25;
  const total = subtotal + cleaningFee + serviceFee;

  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookingStatus, setBookingStatus] = useState('');
 

  const handleBook = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!campsite?._id) {
      setBookingStatus('No campsite available to book.');
      return;
    }
    try {
      setBookingStatus('Booking...');
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post('/api/reservations', {
        campsite: campsite._id,
        checkInDate: checkInDate || new Date().toISOString(),
        checkOutDate: checkOutDate || new Date(Date.now() + 2 * 86400000).toISOString(),
        totalPrice: total
      }, config);
      setBookingStatus('✅ Successfully booked!');
    } catch (error) {
      console.error(error);
      setBookingStatus('❌ Failed to book. Please try again.');
    }
  };

  return (
    <div className="right-sidebar">
      <div className="price-section">
        <div className="price">${pricePerNight}</div>
        <div className="price-subtitle">per night</div>
      </div>

      <div className="date-input">
        <div>
          <label style={{ fontSize: '12px', color: '#999', display: 'block', marginBottom: '5px' }}>Check in</label>
          <input
            type="date"
            value={checkInDate}
            onChange={(e) => setCheckInDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
        <div>
          <label style={{ fontSize: '12px', color: '#999', display: 'block', marginBottom: '5px' }}>Check out</label>
          <input
            type="date"
            value={checkOutDate}
            onChange={(e) => setCheckOutDate(e.target.value)}
            min={checkInDate || new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>

      <button className="btn-book" onClick={handleBook}>Reserve Now</button>
      <div className="book-note">{bookingStatus || "You won't be charged yet"}</div>


      <div className="cost-breakdown">
        <div className="cost-item">
          <span>${pricePerNight} × {nights} nights</span>
          <span>${subtotal}</span>
        </div>
        <div className="cost-item">
          <span>Cleaning fee</span>
          <span>${cleaningFee}</span>
        </div>
        <div className="cost-item">
          <span>Service fee</span>
          <span>${serviceFee}</span>
        </div>
        <div className="cost-total">
          <span>Total</span>
          <span>${total}</span>
        </div>
      </div>

      <div className="safety-badge">
        <div className="safety-icon">✓</div>
        <span>Protecting Sanctuary Care</span>
      </div>
    </div>
  )
}
