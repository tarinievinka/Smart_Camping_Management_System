import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Calendar, Users, MapPin, ChevronLeft, Info, Star, CreditCard } from 'lucide-react';
import { resolveMediaUrl } from '../../utils/resolveMediaUrl';
import AvailabilityCalendar from './AvailabilityCalendar';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const CampsiteBookingForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [site, setSite] = useState(null);
  const [bookedDates, setBookedDates] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    checkIn: '',
    checkOut: '',
    guests: 1
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [siteRes, datesRes] = await Promise.all([
          fetch(`${API_BASE}/api/campsites/${id}`),
          fetch(`${API_BASE}/api/reservations/campsite/${id}/bookeddates`)
        ]);
        
        const siteData = await siteRes.json();
        const datesData = await datesRes.json();
        
        setSite(siteData.data);
        setBookedDates(datesData);
      } catch (err) {
        console.error("Error fetching booking data:", err);
        setError("Failed to load campsite details.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const calculateTotal = () => {
    if (!formData.checkIn || !formData.checkOut || !site) return 0;
    const start = new Date(formData.checkIn);
    const end = new Date(formData.checkOut);
    const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights * site.pricePerNight : 0;
  };

  const nights = () => {
    if (!formData.checkIn || !formData.checkOut) return 0;
    const start = new Date(formData.checkIn);
    const end = new Date(formData.checkOut);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  };

  const handleProceed = (e) => {
    e.preventDefault();
    setError('');

    const checkInDate = new Date(formData.checkIn);
    const checkOutDate = new Date(formData.checkOut);
    const today = new Date();
    today.setHours(0,0,0,0);

    if (checkInDate < today) {
        setError("Check-in date cannot be in the past.");
        return;
    }

    if (checkOutDate <= checkInDate) {
      setError("Check-out date must be after check-in date.");
      return;
    }

    // Check for overlap with booked dates
    const hasOverlap = bookedDates.some(range => {
      const start = new Date(range.checkInDate);
      const end = new Date(range.checkOutDate);
      return checkInDate < end && checkOutDate > start;
    });

    if (hasOverlap) {
      setError("Selected dates overlap with an existing booking.");
      return;
    }

    const total = calculateTotal();
    
    navigate('/payment-checkout', {
      state: {
        amount: total,
        bookingType: 'CampsiteBooking',
        title: site.name,
        stay: `${nights()} Nights / ${nights() + 1} Days`,
        guests: `${formData.guests} Guests`,
        image: site.image ? resolveMediaUrl(site.image) : null,
        dates: {
          checkIn: formData.checkIn,
          checkOut: formData.checkOut
        },
        bookingId: id // This is the campsite ID
      }
    });
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  if (!site) return <div className="text-center py-20">Campsite not found.</div>;

  return (
    <div className="bg-gray-50 min-h-screen pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 bg-transparent border-none cursor-pointer">
          <ChevronLeft className="w-5 h-5" />
          Back to Search
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Details & Calendar */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-gray-100">
              <div className="relative h-80 sm:h-96">
                <img 
                  src={resolveMediaUrl(site.image) || "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=1200&q=80"} 
                  alt={site.name} 
                  className="w-full h-full object-cover" 
                />
                <div className="absolute top-6 right-6 bg-[#166534] text-white px-6 py-2 rounded-full font-bold text-lg shadow-lg">
                  Rs {site.pricePerNight} <span className="text-xs font-normal opacity-80">/ Night</span>
                </div>
              </div>
              <div className="p-8">
                <h1 className="text-4xl font-black text-gray-900 mb-4">{site.name}</h1>
                <div className="flex flex-wrap gap-6 mb-6">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-5 h-5 mr-2 text-[#166534]" />
                    <span className="font-medium">{site.location}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Users className="w-5 h-5 mr-2 text-[#166534]" />
                    <span className="font-medium">Up to {site.capacity} Guests</span>
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed text-lg mb-8">
                  {site.description || "Escape to nature in this beautiful campsite. Perfect for families and adventurers alike."}
                </p>
                
                <h3 className="text-xl font-bold text-gray-900 mb-4">Availability</h3>
                <AvailabilityCalendar bookedRanges={bookedDates} />
              </div>
            </div>
          </div>

          {/* Right Column: Booking Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-[32px] p-8 shadow-xl border border-gray-100 sticky top-24">
              <h2 className="text-2xl font-black text-gray-900 mb-6">Reserve Your Spot</h2>
              
              <form onSubmit={handleProceed} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-sm flex items-start gap-3">
                    <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-bold text-gray-500 mb-2">Check-In Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#166534]" />
                      <input 
                        type="date" 
                        required
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#166534] transition"
                        value={formData.checkIn}
                        onChange={(e) => setFormData({...formData, checkIn: e.target.value})}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-bold text-gray-500 mb-2">Check-Out Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#166534]" />
                      <input 
                        type="date" 
                        required
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#166534] transition"
                        value={formData.checkOut}
                        onChange={(e) => setFormData({...formData, checkOut: e.target.value})}
                        min={formData.checkIn || new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-gray-500 mb-2">Number of Guests</label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#166534]" />
                    <select 
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#166534] transition appearance-none"
                      value={formData.guests}
                      onChange={(e) => setFormData({...formData, guests: e.target.value})}
                    >
                      {[...Array(site.capacity || 10)].map((_, i) => (
                        <option key={i+1} value={i+1}>{i+1} Guest{i > 0 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-500 font-medium text-sm">Price per night</span>
                    <span className="font-bold">Rs {site.pricePerNight}</span>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-500 font-medium text-sm">Duration</span>
                    <span className="font-bold">{nights()} Nights</span>
                  </div>
                  <div className="flex justify-between items-center py-4 border-t border-dashed border-gray-200">
                    <span className="text-lg font-black text-gray-900">Total Price</span>
                    <span className="text-2xl font-black text-[#166534]">Rs {calculateTotal()}</span>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-[#166534] hover:bg-[#14532d] text-white font-black py-5 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl active:scale-[0.98] flex items-center justify-center gap-3"
                >
                  <CreditCard className="w-5 h-5" />
                  Proceed to Payment
                </button>
                <p className="text-center text-[10px] text-gray-400 font-medium">
                  Your payment is secured with SSL encryption.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampsiteBookingForm;
