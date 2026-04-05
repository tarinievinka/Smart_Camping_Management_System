import React, { useState } from 'react';

const CATEGORIES = ['Tents','Sleeping Bags','Backpacks','Cooking Gear','Lighting','Other'];
const CONDITIONS  = ['New','Good','Fair','Poor'];
const API_BASE    = process.env.REACT_APP_API_URL;

const EditEquipment = ({ item, onSave, onCancel }) => {
  const [formData, setFormData]         = useState({ ...item });
  const [imageFile, setImageFile]       = useState(null);
  const [imagePreview, setImagePreview] = useState(
    item.imageUrl ? `${API_BASE}${item.imageUrl}` : null
  );
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors]       = useState({});  // ← validation errors

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error for this field as user types
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, image: 'Image must be smaller than 5MB' });
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setErrors({ ...errors, image: '' });
    }
  };

  // ── Validation function ──────────────────────────────────
  const validate = () => {
    const newErrors = {};

    // Name: required, min 3 chars, max 100 chars
    if (!formData.name || formData.name.trim().length === 0) {
      newErrors.name = 'Equipment name is required.';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Name must be at least 3 characters.';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Name cannot exceed 100 characters.';
    }

    // Rental Price: required, must be > 0
    if (!formData.rentalPrice || formData.rentalPrice === '') {
      newErrors.rentalPrice = 'Rental price is required.';
    } else if (Number(formData.rentalPrice) <= 0) {
      newErrors.rentalPrice = 'Rental price must be greater than 0.';
    }

    // Sale Price: required, must be > 0, must be >= rental price
    if (!formData.salePrice || formData.salePrice === '') {
      newErrors.salePrice = 'Sale price is required.';
    } else if (Number(formData.salePrice) <= 0) {
      newErrors.salePrice = 'Sale price must be greater than 0.';
    } else if (Number(formData.salePrice) < Number(formData.rentalPrice)) {
      newErrors.salePrice = 'Sale price should not be less than rental price.';
    }

    // Stock Quantity: required, must be >= 0, whole number
    if (formData.stockQuantity === '' || formData.stockQuantity === null || formData.stockQuantity === undefined) {
      newErrors.stockQuantity = 'Stock quantity is required.';
    } else if (Number(formData.stockQuantity) < 0) {
      newErrors.stockQuantity = 'Stock quantity cannot be negative.';
    } else if (!Number.isInteger(Number(formData.stockQuantity))) {
      newErrors.stockQuantity = 'Stock quantity must be a whole number.';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Run validation
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return; // Stop — do not submit
    }

    setUploading(true);
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (key !== 'imageUrl' && key !== '__v') data.append(key, formData[key]);
    });
    if (imageFile) data.append('image', imageFile);

    await onSave(data);
    setUploading(false);
  };

  // Helper: input border color based on error state
  const inputClass = (field) =>
    `w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 ${
      errors[field]
        ? 'border-red-500 focus:ring-red-200'
        : 'border-gray-300 focus:ring-blue-200'
    }`;

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">Edit Equipment: {item.name}</h2>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>

        {/* Equipment Name */}
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Equipment Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text" name="name" value={formData.name} onChange={handleChange}
            className={inputClass('name')}
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">⚠ {errors.name}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">

          {/* Category */}
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Category</label>
            <select name="category" value={formData.category} onChange={handleChange}
              className={inputClass('category')}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Condition */}
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Condition</label>
            <select name="condition" value={formData.condition} onChange={handleChange}
              className={inputClass('condition')}>
              {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Rental Price */}
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Rental Price (Rs) <span className="text-red-500">*</span>
            </label>
            <input
              type="number" name="rentalPrice" value={formData.rentalPrice} onChange={handleChange}
              className={inputClass('rentalPrice')} min="1"
            />
            {errors.rentalPrice && (
              <p className="text-red-500 text-xs mt-1">⚠ {errors.rentalPrice}</p>
            )}
          </div>

          {/* Sale Price */}
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Sale Price (Rs) <span className="text-red-500">*</span>
            </label>
            <input
              type="number" name="salePrice" value={formData.salePrice} onChange={handleChange}
              className={inputClass('salePrice')} min="1"
            />
            {errors.salePrice && (
              <p className="text-red-500 text-xs mt-1">⚠ {errors.salePrice}</p>
            )}
          </div>

          {/* Stock Quantity */}
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Stock Quantity <span className="text-red-500">*</span>
            </label>
            <input
              type="number" name="stockQuantity" value={formData.stockQuantity} onChange={handleChange}
              className={inputClass('stockQuantity')} min="0"
            />
            {errors.stockQuantity && (
              <p className="text-red-500 text-xs mt-1">⚠ {errors.stockQuantity}</p>
            )}
          </div>

          {/* Availability Status */}
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Availability Status</label>
            <select name="availabilityStatus" value={formData.availabilityStatus} onChange={handleChange}
              className={inputClass('availabilityStatus')}>
              <option value="Available">Available</option>
              <option value="Rented">Rented</option>
              <option value="Out of Stock">Out of Stock</option>
              <option value="Deactivated">Deactivated</option>
            </select>
          </div>

        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">Equipment Photo</label>
          {imagePreview && (
            <div className="mb-3">
              <p className="text-sm text-gray-500 mb-1">
                {imageFile ? 'New photo preview:' : 'Current photo:'}
              </p>
              <img src={imagePreview} alt="Equipment"
                className="h-40 w-40 object-cover rounded-lg shadow border" />
            </div>
          )}
          <input
            type="file" accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleImageChange}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-600"
          />
          <p className="text-xs text-gray-400 mt-1">
            {item.imageUrl ? 'Upload a new photo to replace the current one' : 'JPG, PNG or WEBP — max 5MB'}
          </p>
          {errors.image && (
            <p className="text-red-500 text-xs mt-1">⚠ {errors.image}</p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <button type="button" onClick={onCancel}
            className="px-4 py-2 text-gray-600 bg-gray-200 rounded hover:bg-gray-300">
            Cancel
          </button>
          <button type="submit" disabled={uploading}
            className="px-4 py-2 text-white rounded disabled:opacity-50"
            style={{ background: '#15803d' }}
            onMouseEnter={e => e.target.style.background = '#166534'}
            onMouseLeave={e => e.target.style.background = '#15803d'}
>
            {uploading ? 'Saving...' : 'Update Equipment'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default EditEquipment;