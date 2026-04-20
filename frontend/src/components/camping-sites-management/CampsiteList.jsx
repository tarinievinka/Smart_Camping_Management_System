import React from 'react';

const CampsiteList = ({ campsites, onEdit, onDelete, handleStatusChange }) => {
  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  if (!campsites || campsites.length === 0) {
    return <div className="text-gray-500 py-8">No campsites found.</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100 text-sm font-semibold text-gray-600">
            <th className="p-4">Photo</th>
            <th className="p-4">Name</th>
            <th className="p-4">Location</th>
            <th className="p-4">Price / Night</th>
            <th className="p-4">Capacity</th>
            <th className="p-4 text-center">Status</th>
            <th className="p-4 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {campsites.map(item => (
            <tr key={item._id} className="border-b border-gray-50 hover:bg-gray-50 transition">
              <td className="p-4">
                {item.image ? (
                  <img src={`${API_BASE}${item.image}`} alt={item.name} className="w-16 h-16 object-cover rounded-md" />
                ) : (
                  <img src="https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=150&q=80" alt="Default" className="w-16 h-16 object-cover rounded-md" />
                )}
              </td>
              <td className="p-4 font-semibold text-gray-800">{item.name}</td>
              <td className="p-4 text-gray-600">{item.location}</td>
              <td className="p-4 text-[#15803d] font-bold">Rs {item.pricePerNight}</td>
              <td className="p-4 text-gray-600">{item.capacity} guests</td>
              <td className="p-4 text-center">
                <select 
                  value={item.status || 'pending'} 
                  onChange={(e) => handleStatusChange && handleStatusChange(item._id, e.target.value)}
                  className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider border outline-none cursor-pointer ${
                    item.status === 'approved' ? 'bg-green-100 text-green-700 border-green-200' : 
                    item.status === 'rejected' ? 'bg-red-100 text-red-700 border-red-200' : 
                    'bg-yellow-100 text-yellow-700 border-yellow-200'
                  }`}
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </td>
              <td className="p-4 text-center">
                <button
                  onClick={() => onEdit(item)}
                  className="bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold py-1 px-3 rounded-md mr-2 transition text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(item._id)}
                  className="bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-1 px-3 rounded-md transition text-sm"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default CampsiteList;
