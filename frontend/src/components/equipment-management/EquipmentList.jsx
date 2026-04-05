import React from 'react';

const EquipmentList = ({ equipment, onEdit, onDelete }) => {

  const statusColor = (status) => {
    if (status === 'Available')    return 'bg-green-100 text-green-800';
    if (status === 'Rented')       return 'bg-yellow-100 text-yellow-800';
    if (status === 'Out of Stock') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-600';
  };

  const stockBar = (qty) => {
    const pct   = Math.min(100, (qty / 20) * 100);
    const color = qty === 0 ? '#ef4444' : qty <= 3 ? '#f59e0b' : '#16a34a';
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ flex: 1, background: '#e5e7eb', borderRadius: '99px', height: '6px', minWidth: '60px' }}>
          <div style={{ width: `${pct}%`, height: '6px', borderRadius: '99px', background: color, transition: 'width 0.3s' }} />
        </div>
        <span style={{ fontSize: '13px', fontWeight: '600', color, minWidth: '20px' }}>{qty}</span>
      </div>
    );
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <table className="min-w-full leading-normal">
        <thead>
          <tr>
            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Condition</th>
            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Rent Price</th>
            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Sale Price</th>
            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Stock</th>
            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody>
          {equipment.map((item) => (
            <tr key={item._id} className="hover:bg-gray-50 transition-colors">

              {/* Name */}
              <td className="px-5 py-4 border-b border-gray-200 text-sm font-medium text-gray-900">
                {item.name}
              </td>

              {/* Category */}
              <td className="px-5 py-4 border-b border-gray-200 text-sm text-gray-600">
                {item.category}
              </td>

              {/* Condition */}
              <td className="px-5 py-4 border-b border-gray-200 text-sm">
                <span style={{
                  padding: '2px 10px', borderRadius: '99px', fontSize: '12px', fontWeight: '600',
                  background: item.condition === 'New'  ? '#dcfce7' :
                              item.condition === 'Good' ? '#dbeafe' :
                              item.condition === 'Fair' ? '#fef9c3' : '#fee2e2',
                  color:      item.condition === 'New'  ? '#15803d' :
                              item.condition === 'Good' ? '#1d4ed8' :
                              item.condition === 'Fair' ? '#a16207' : '#dc2626',
                }}>
                  {item.condition}
                </span>
              </td>

              {/* Rent Price */}
              <td className="px-5 py-4 border-b border-gray-200 text-sm">
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '11px', background: '#dcfce7', color: '#15803d', padding: '1px 6px', borderRadius: '4px', fontWeight: '700' }}>RENT</span>
                  <span className="font-semibold text-gray-800">Rs {item.rentalPrice}</span>
                  <span className="text-gray-400 text-xs">/day</span>
                </div>
              </td>

              {/* Sale Price */}
              <td className="px-5 py-4 border-b border-gray-200 text-sm">
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '11px', background: '#dbeafe', color: '#1d4ed8', padding: '1px 6px', borderRadius: '4px', fontWeight: '700' }}>BUY</span>
                  <span className="font-semibold text-gray-800">Rs {item.salePrice}</span>
                </div>
              </td>

              {/* Stock with bar */}
              <td className="px-5 py-4 border-b border-gray-200 text-sm" style={{ minWidth: '120px' }}>
                {stockBar(item.stockQuantity)}
                {item.stockQuantity <= 3 && item.stockQuantity > 0 && (
                  <div style={{ fontSize: '11px', color: '#f59e0b', fontWeight: '600', marginTop: '3px' }}>
                    ⚠ Low stock
                  </div>
                )}
                {item.stockQuantity === 0 && (
                  <div style={{ fontSize: '11px', color: '#ef4444', fontWeight: '600', marginTop: '3px' }}>
                    ✕ Out of stock
                  </div>
                )}
              </td>

              {/* Status */}
              <td className="px-5 py-4 border-b border-gray-200 text-sm">
                <span className={`px-2 py-1 rounded text-xs font-bold ${statusColor(item.availabilityStatus)}`}>
                  {item.availabilityStatus}
                </span>
              </td>

              {/* Actions */}
              <td className="px-5 py-4 border-b border-gray-200 text-sm">
                <button onClick={() => onEdit(item)} className="text-blue-600 hover:text-blue-900 mr-3 font-medium">Edit</button>
                <button onClick={() => onDelete(item._id)} className="text-red-600 hover:text-red-900 font-medium">Delete</button>
              </td>

            </tr>
          ))}
          {equipment.length === 0 && (
            <tr>
              <td colSpan={8} className="px-5 py-10 text-center text-gray-400">
                No equipment found. Add your first item!
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default EquipmentList;