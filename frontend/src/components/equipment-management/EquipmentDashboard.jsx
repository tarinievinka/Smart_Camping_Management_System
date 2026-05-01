import React, { useState, useEffect } from 'react';
import EquipmentList from './EquipmentList';
import AddEquipment from './AddEquipment';
import EditEquipment from './EditEquipment';
import NotifyRequests from './NotifyRequests';

const API      = (process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/api/equipment';
const NAPI     = (process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/api/notify';

const EquipmentDashboard = () => {
  const [equipmentList, setEquipmentList] = useState([]);
  const [currentView, setCurrentView]     = useState('list'); // 'list' | 'add' | 'edit' | 'notifications'
  const [itemToEdit, setItemToEdit]       = useState(null);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [notifyCount, setNotifyCount]     = useState(0);

  // ── Load all equipment from MongoDB on page open ──
  useEffect(() => {
    fetch(`${API}/display`)
      .then(res => res.json())
      .then(data => { setEquipmentList(data); setLoading(false); })
      .catch(() => { setError('Failed to load equipment'); setLoading(false); });
  }, []);

  // ── Load pending notify count for the red badge ──
  useEffect(() => {
    fetch(`${NAPI}/all`)
      .then(res => res.json())
      .then(data => setNotifyCount(data.filter(r => !r.notified).length))
      .catch(() => {});
  }, []);

  // ── ADD new equipment — receives FormData from AddEquipment ──
  const handleAdd = async (formData) => {
    try {
      const res = await fetch(`${API}/add`, {
        method: 'POST',
        body: formData,   // ⚠️ No Content-Type header — browser sets it automatically for FormData
      });
      const saved = await res.json();
      if (!res.ok) { alert(saved.error || 'Failed to add equipment'); return; }
      setEquipmentList(prev => [...prev, saved]);
      setCurrentView('list');
    } catch {
      alert('Failed to add equipment. Check backend is running.');
    }
  };

  // ── UPDATE equipment — receives FormData from EditEquipment ──
  const handleUpdate = async (formData) => {
    try {
      const id  = formData.get('_id');
      const res = await fetch(`${API}/update/${id}`, {
        method: 'PUT',
        body: formData,   // ⚠️ No Content-Type header
      });
      const saved = await res.json();
      if (!res.ok) { alert(saved.error || 'Failed to update equipment'); return; }
      setEquipmentList(prev => prev.map(item => item._id === saved._id ? saved : item));
      setCurrentView('list');
    } catch {
      alert('Failed to update equipment. Check backend is running.');
    }
  };

  // ── DELETE equipment from MongoDB ──
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this equipment?')) return;
    try {
      const res = await fetch(`${API}/delete/${id}`, { method: 'DELETE' });
      if (!res.ok) { alert('Failed to delete equipment'); return; }
      setEquipmentList(prev => prev.filter(item => item._id !== id));
    } catch {
      alert('Failed to delete equipment. Check backend is running.');
    }
  };

  const openEdit = (item) => { setItemToEdit(item); setCurrentView('edit'); };

  const isEquipmentTab    = currentView !== 'notifications';
  const isNotificationsTab = currentView === 'notifications';

  if (loading) return <div className="p-6 text-gray-500">Loading equipment...</div>;
  if (error)   return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">

      {/* ── Page heading + Add button ── */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Equipment Management</h1>
        {isEquipmentTab && currentView === 'list' && (
          <button
            onClick={() => setCurrentView('add')}
           style={{ background: '#15803d', color: '#fff', padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}
           onMouseEnter={e => e.target.style.background = '#166534'}
           onMouseLeave={e => e.target.style.background = '#15803d'}
          >
            + Add New Equipment
          </button>
        )}
      </div>

      {/* ── Tab bar ── */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        <button
          onClick={() => setCurrentView('list')}
          style={{
            padding: '8px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer',
            background: isEquipmentTab ? '#15803d' : '#f3f4f6',
            color:      isEquipmentTab ? '#fff'     : '#374151',
            fontWeight: '600', fontSize: '14px',
          }}
        >
          📋 Equipment List
        </button>

        <button
          onClick={() => setCurrentView('notifications')}
          style={{
            padding: '8px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer',
            background: isNotificationsTab ? '#15803d' : '#f3f4f6',
            color:      isNotificationsTab ? '#fff'    : '#374151',
            fontWeight: '600', fontSize: '14px',
            display: 'flex', alignItems: 'center', gap: '6px',
          }}
        >
          🔔 Notify Requests
          {notifyCount > 0 && (
            <span style={{
              background: '#ef4444', color: '#fff', borderRadius: '50%',
              width: '20px', height: '20px', fontSize: '11px', fontWeight: '800',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {notifyCount}
            </span>
          )}
        </button>
      </div>

      {/* ── Tab content ── */}
      {currentView === 'list' && (
        <EquipmentList equipment={equipmentList} onEdit={openEdit} onDelete={handleDelete} />
      )}
      {currentView === 'add' && (
        <AddEquipment onSave={handleAdd} onCancel={() => setCurrentView('list')} />
      )}
      {currentView === 'edit' && (
        <EditEquipment item={itemToEdit} onSave={handleUpdate} onCancel={() => setCurrentView('list')} />
      )}
      {currentView === 'notifications' && (
        <NotifyRequests />
      )}

    </div>
  );
};

export default EquipmentDashboard;