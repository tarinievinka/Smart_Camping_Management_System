import React, { useState, useEffect } from 'react';

const EditCampsite = ({ item, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
<<<<<<< HEAD
    _id: '', name: '', location: '', pricePerNight: '', capacity: '', description: '', amenities: ''
=======
    _id: '', name: '', province: '', city: '', pricePerNight: '', capacity: '', description: '', amenities: ''
>>>>>>> 72d49f97b953854ffc2cce76cb28c3b75c102fd7
  });
  const [file, setFile] = useState(null);

  useEffect(() => {
    if (item) {
<<<<<<< HEAD
      setFormData({
        _id: item._id,
        name: item.name || '',
        location: item.location || '',
=======
      const locationParts = (item.location || '').split(', ');
      setFormData({
        _id: item._id,
        name: item.name || '',
        province: locationParts[0] || '',
        city: locationParts[1] || '',
>>>>>>> 72d49f97b953854ffc2cce76cb28c3b75c102fd7
        pricePerNight: item.pricePerNight || '',
        capacity: item.capacity || '',
        description: item.description || '',
        amenities: item.amenities ? item.amenities.join(', ') : ''
      });
    }
  }, [item]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === 'amenities') {
        data.append('amenities', JSON.stringify(formData.amenities.split(',').map(a => a.trim())));
<<<<<<< HEAD
=======
      } else if (key === 'province' || key === 'city') {
        // Combine province and city into location
        if (key === 'province') {
          data.append('location', `${formData.province}, ${formData.city}`);
        }
>>>>>>> 72d49f97b953854ffc2cce76cb28c3b75c102fd7
      } else {
        data.append(key, formData[key]);
      }
    });
    if (file) data.append('image', file);
    onSave(data);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-2xl">
      <h2 className="text-xl font-bold mb-6">Edit Campsite</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div><label className="block text-sm font-semibold mb-1">Name</label>
        <input required type="text" className="w-full border p-2 rounded" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
<<<<<<< HEAD
        <div><label className="block text-sm font-semibold mb-1">Location</label>
        <input required type="text" className="w-full border p-2 rounded" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} /></div>
=======
        <div className="flex gap-4">
          <div className="flex-1"><label className="block text-sm font-semibold mb-1">Province</label>
          <input required type="text" className="w-full border p-2 rounded" value={formData.province} onChange={e => setFormData({...formData, province: e.target.value})} /></div>
          <div className="flex-1"><label className="block text-sm font-semibold mb-1">City</label>
          <input required type="text" className="w-full border p-2 rounded" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} /></div>
        </div>
>>>>>>> 72d49f97b953854ffc2cce76cb28c3b75c102fd7
        <div className="flex gap-4">
          <div className="flex-1"><label className="block text-sm font-semibold mb-1">Price / Night (Rs)</label>
          <input required type="number" className="w-full border p-2 rounded" value={formData.pricePerNight} onChange={e => setFormData({...formData, pricePerNight: e.target.value})} /></div>
          <div className="flex-1"><label className="block text-sm font-semibold mb-1">Capacity (Guests)</label>
          <input required type="number" className="w-full border p-2 rounded" value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} /></div>
        </div>
        <div><label className="block text-sm font-semibold mb-1">Amenities</label>
        <input type="text" className="w-full border p-2 rounded" value={formData.amenities} onChange={e => setFormData({...formData, amenities: e.target.value})} /></div>
        <div><label className="block text-sm font-semibold mb-1">Description</label>
        <textarea className="w-full border p-2 rounded" rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} /></div>
        <div><label className="block text-sm font-semibold mb-1">Image (Leave empty to keep existing)</label>
        <input type="file" className="w-full border p-2 rounded" onChange={e => setFile(e.target.files[0])} /></div>
        
        <div className="flex justify-end gap-3 mt-6">
          <button type="button" onClick={onCancel} className="px-4 py-2 border rounded font-semibold text-gray-600">Cancel</button>
          <button type="submit" className="px-4 py-2 bg-[#15803d] text-white rounded font-semibold">Update Campsite</button>
        </div>
      </form>
    </div>
  );
};
export default EditCampsite;
