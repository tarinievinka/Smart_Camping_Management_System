import React, { useState, useEffect } from 'react';
import AddCampsite from './AddCampsite';

const CampsiteOwnerDashboard = () => {
  const [campsites, setCampsites] = useState([]);
  const [currentView, setCurrentView] = useState('list');
  const [user, setUser] = useState(null);

  const API = (process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/api/campsites';

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
      fetch(`${API}/owner/${storedUser._id || storedUser.userId}`)
        .then(res => res.json())
        .then(data => setCampsites(data.data || []))
        .catch(console.error);
    }
  }, []);

  const handleAdd = async (formData) => {
    formData.append('ownerId', user._id || user.userId);
    try {
      const res = await fetch(`${API}/add`, { method: 'POST', body: formData });
      const saved = await res.json();
      if (!res.ok) return alert(saved.error);
      setCampsites(prev => [...prev, saved.data]);
      setCurrentView('list');
    } catch { alert('Add failed'); }
  };

  if (!user) return <div className="p-8 text-center text-gray-500">Please sign in as a Campsite Owner.</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Campsites Dashboard</h1>
          {currentView === 'list' && (
            <button
              onClick={() => setCurrentView('add')}
              className="bg-[#15803d] hover:bg-[#166534] text-white font-semibold py-2 px-4 rounded-md transition shadow-md"
            >
              + Register New Campsite
            </button>
          )}
        </div>

        {currentView === 'add' && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-4">Registration Form</h2>
            <p className="text-sm text-gray-500 mb-6">Your campsite will be sent to the admin for verification before it goes live.</p>
            <AddCampsite onSave={handleAdd} onCancel={() => setCurrentView('list')} />
          </div>
        )}

        {currentView === 'list' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden text-left">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-sm font-semibold text-gray-600">
                  <th className="p-4">Name</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Price / Night</th>
                  <th className="p-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {campsites.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-10 text-gray-500">You haven't registered any campsites yet.</td>
                  </tr>
                ) : (
                  campsites.map(item => (
                    <tr key={item._id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                      <td className="p-4 font-semibold text-gray-800">{item.name}</td>
                      <td className="p-4 text-gray-600">{item.location}</td>
                      <td className="p-4 text-[#15803d] font-bold">Rs {item.pricePerNight}</td>
                      <td className="p-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          item.status === 'approved' ? 'bg-green-100 text-green-700 border border-green-200' :
                          item.status === 'rejected' ? 'bg-red-100 text-red-700 border border-red-200' :
                          'bg-yellow-100 text-yellow-700 border border-yellow-200'
                        }`}>
                          {item.status || 'pending'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CampsiteOwnerDashboard;
