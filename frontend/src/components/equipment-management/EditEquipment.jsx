import React, { useState } from 'react';

const CATEGORIES = ['Tents','Sleeping Bags','Backpacks','Cooking Gear','Lighting','Other'];
const CONDITIONS  = ['New','Good','Fair','Poor'];
const API_BASE    = process.env.REACT_APP_API_URL;

const EditEquipment = ({ item, onSave, onCancel }) => {
  const [formData, setFormData] = useState({ ...item });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(
    item.imageUrl ? `${API_BASE}${item.imageUrl}` : null
  );
  const [uploading, setUploading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (key !== 'imageUrl' && key !== '__v') data.append(key, formData[key]);
    });
    if (imageFile) data.append('image', imageFile);

    await onSave(data);
    setUploading(false);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">Edit Equipment: {item.name}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">Equipment Name</label>
          <input type="text" name="name" value={formData.name} required onChange={handleChange}
            className="w-full px-3 py-2 border rounded" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Category</label>
            <select name="category" value={formData.category} onChange={handleChange}
              className="w-full px-3 py-2 border rounded">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Condition</label>
            <select name="condition" value={formData.condition} onChange={handleChange}
              className="w-full px-3 py-2 border rounded">
              {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Rental Price (Rs)</label>
            <input type="number" name="rentalPrice" value={formData.rentalPrice} required onChange={handleChange}
              className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Sale Price (Rs)</label>
            <input type="number" name="salePrice" value={formData.salePrice} required onChange={handleChange}
              className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Stock Quantity</label>
            <input type="number" name="stockQuantity" value={formData.stockQuantity} required onChange={handleChange}
              className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Availability Status</label>
            <select name="availabilityStatus" value={formData.availabilityStatus} onChange={handleChange}
              className="w-full px-3 py-2 border rounded">
              <option value="Available">Available</option>
              <option value="Rented">Rented</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>
        </div>

        {/* Image upload */}
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">Equipment Photo</label>

          {/* Show current photo */}
          {imagePreview && (
            <div className="mb-3">
              <p className="text-sm text-gray-500 mb-1">
                {imageFile ? 'New photo preview:' : 'Current photo:'}
              </p>
              <img src={imagePreview} alt="Equipment"
                className="h-40 w-40 object-cover rounded-lg shadow border" />
            </div>
          )}

          <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleImageChange}
            className="w-full px-3 py-2 border rounded text-sm text-gray-600" />
          <p className="text-xs text-gray-400 mt-1">
            {item.imageUrl ? 'Upload a new photo to replace the current one' : 'JPG, PNG or WEBP — max 5MB'}
          </p>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button type="button" onClick={onCancel}
            className="px-4 py-2 text-gray-600 bg-gray-200 rounded hover:bg-gray-300">
            Cancel
          </button>
          <button type="submit" disabled={uploading}
            className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50">
            {uploading ? 'Saving...' : 'Update Equipment'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditEquipment;