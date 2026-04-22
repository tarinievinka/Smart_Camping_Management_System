import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Users, Info, Star } from 'lucide-react';
import { resolveMediaUrl } from '../../utils/resolveMediaUrl';

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map(site => (
            <div key={site._id} className="group bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
              {/* Image Container */}
              <div className="relative h-56 overflow-hidden">
                <img 
                  src={resolveMediaUrl(site.image) || "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=800&q=80"} 
                  alt={site.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Price Tag */}
                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-lg">
                  <span className="text-[#166534] font-black text-sm">Rs {site.pricePerNight}</span>
                  <span className="text-[#166534]/70 text-[10px] font-bold uppercase tracking-wider ml-1">/ ngt</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-black text-gray-900 leading-tight line-clamp-1">{site.name}</h3>
                </div>

                <div className="flex flex-col gap-2 mb-5">
                  <div className="flex items-center text-gray-500">
                    <MapPin className="w-3.5 h-3.5 mr-1.5 text-[#166534]" />
                    <span className="text-[13px] font-medium truncate">
                      {site.location.split(', ')[0] || site.location}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <Users className="w-3.5 h-3.5 mr-1.5 text-[#166534]" />
                    <span className="text-[13px] font-medium">Up to {site.capacity} Guests</span>
                  </div>
                </div>

                {/* Amenities */}
                {site.amenities && site.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {site.amenities.slice(0, 3).map((amenity, i) => (
                      <span key={i} className="text-[10px] font-bold uppercase tracking-wider bg-gray-50 text-gray-600 px-2.5 py-1 rounded-lg border border-gray-100 group-hover:bg-[#166534]/5 group-hover:text-[#166534] group-hover:border-[#166534]/10 transition-colors">
                        {amenity}
                      </span>
                    ))}
                    {site.amenities.length > 3 && (
                      <span className="text-[10px] font-bold text-gray-400 py-1">+{site.amenities.length - 3}</span>
                    )}
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
                      image: site.image ? resolveMediaUrl(site.image) : null
                    }
                  })}
                  className="w-full bg-[#166534] hover:bg-[#14532d] text-white font-black py-3.5 rounded-xl transition-all duration-300 shadow-sm hover:shadow-lg active:scale-[0.98] text-sm uppercase tracking-widest"
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
