import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Users, Info } from 'lucide-react';

const API = (process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/api/campsites';
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const CampingSitesManagement = () => {
  const [campsites, setCampsites] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API}/display?status=approved`)
      .then(res => res.json())
      .then(data => setCampsites(data.data || []))
      .catch(console.error);
  }, []);

  const filtered = campsites.filter(c => {
    const nameMatch = (c.name || '').toLowerCase().includes((searchTerm || '').toLowerCase());
    const locMatch = (c.location || '').toLowerCase().includes((searchTerm || '').toLowerCase());
    return nameMatch || locMatch;
  });

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Discover Campsites</h1>
          <input
            type="text"
            placeholder="Search by name or location..."
            className="w-full max-w-lg p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-[#166534] focus:border-[#166534]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(site => (
            <div key={site._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition duration-300">
              <div className="h-48 bg-gray-200 relative">
                {site.image ? (
                  <img src={`${API_BASE}${site.image}`} alt={site.name} className="w-full h-full object-cover" />
                ) : (
                  <img src="https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=800&q=80" alt="Default Campsite" className="w-full h-full object-cover" />
                )}
                <div className="absolute top-4 right-4 bg-white/90 px-3 py-1 rounded-full text-sm font-bold text-[#166534]">
                  Rs {site.pricePerNight} / ngt
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{site.name}</h3>
                <div className="flex items-center text-sm text-gray-600 mb-4 gap-4">
                  <div className="flex items-center"><MapPin className="w-4 h-4 mr-1 text-gray-400" /> {site.location}</div>
                  <div className="flex items-center"><Users className="w-4 h-4 mr-1 text-gray-400" /> Up to {site.capacity}</div>
                </div>
                {site.amenities && site.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {site.amenities.slice(0, 3).map((amenity, i) => (
                      <span key={i} className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-md border border-green-100">{amenity}</span>
                    ))}
                    {site.amenities.length > 3 && <span className="text-xs text-gray-500 py-1">+{site.amenities.length - 3} more</span>}
                  </div>
                )}
                <button
                  onClick={() => navigate('/payment-checkout', {
                    state: {
                      amount: site.pricePerNight,
                      bookingType: 'CampsiteBooking',
                      title: site.name,
                      stay: '1 Night / 2 Days',
                      guests: `${site.capacity} Guests Max`,
                      image: site.image ? `${API_BASE}${site.image}` : null
                    }
                  })}
                  className="w-full mt-2 bg-[#166534] hover:bg-[#14532d] text-white font-bold py-3 px-4 rounded-lg transition"
                >
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-500">No campsites found.</div>
        )}
      </div>
    </div>
  );
};
export default CampingSitesManagement;
