import React, { useState } from 'react';

const AddCampsite = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '', location: '', pricePerNight: '', capacity: '', description: '', amenities: ''
  });
  const [file, setFile] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === 'amenities') {
        data.append('amenities', JSON.stringify(formData.amenities.split(',').map(a => a.trim())));
      } else {
        data.append(key, formData[key]);
      }
    });
    if (file) data.append('image', file);
    onSave(data);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-2xl">
      <h2 className="text-xl font-bold mb-6">Add New Campsite</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div><label className="block text-sm font-semibold mb-1">Name</label>
        <input required type="text" className="w-full border p-2 rounded" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
        <div><label className="block text-sm font-semibold mb-1">Location</label>
        <input required type="text" className="w-full border p-2 rounded" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} /></div>
        <div className="flex gap-4">
          <div className="flex-1"><label className="block text-sm font-semibold mb-1">Price / Night (Rs)</label>
          <input required type="number" className="w-full border p-2 rounded" value={formData.pricePerNight} onChange={e => setFormData({...formData, pricePerNight: e.target.value})} /></div>
          <div className="flex-1"><label className="block text-sm font-semibold mb-1">Capacity (Guests)</label>
          <input required type="number" className="w-full border p-2 rounded" value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} /></div>
        </div>
        <div><label className="block text-sm font-semibold mb-1">Amenities (comma separated)</label>
        <input type="text" className="w-full border p-2 rounded" placeholder="Wifi, Firepit, Toilets" value={formData.amenities} onChange={e => setFormData({...formData, amenities: e.target.value})} /></div>
        <div><label className="block text-sm font-semibold mb-1">Description</label>
        <textarea className="w-full border p-2 rounded" rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} /></div>
        <div><label className="block text-sm font-semibold mb-1">Image</label>
        <input type="file" className="w-full border p-2 rounded" onChange={e => setFile(e.target.files[0])} /></div>
        
        <div className="flex justify-end gap-3 mt-6">
          <button type="button" onClick={onCancel} className="px-4 py-2 border rounded font-semibold text-gray-600">Cancel</button>
          <button type="submit" className="px-4 py-2 bg-[#15803d] text-white rounded font-semibold">Save Campsite</button>
        </div>
      </form>
    </div>
  );
};
export default AddCampsite;
