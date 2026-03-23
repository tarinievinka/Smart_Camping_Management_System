import React, { useState, useEffect } from 'react';
import EquipmentList from './EquipmentList';
import AddEquipment from './AddEquipment';
import EditEquipment from './EditEquipment';
import NotifyRequests from './NotifyRequests';  // ← NEW

const API = process.env.REACT_APP_API_URL + '/api/equipment';

const EquipmentDashboard = () => {
  const [equipmentList, setEquipmentList] = useState([]);
  const [currentView, setCurrentView]     = useState('list');  // 'list' | 'add' | 'edit' | 'notifications'
  const [itemToEdit, setItemToEdit]       = useState(null);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [notifyCount, setNotifyCount]     = useState(0);  // ← NEW: pending badge count

  // Load all equipment from MongoDB on page open
  useEffect(() => {
    fetch(`${API}/display`)
      .then(res => res.json())
      .then(data => { setEquipmentList(data); setLoading(false); })
      .catch(() => { setError('Failed to load equipment'); setLoading(false); });
  }, []);

  // ← NEW: load pending notify count for the red badge on the tab
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/notify/all`)
      .then(res => res.json())
      .then(data => setNotifyCount(data.filter(r => !r.notified).length))
      .catch(() => {});
  }, []);

  // ADD new equipment — receives FormData from AddEquipment form
  const handleAdd = async (formData) => {
    try {
      const res = await fetch(`${API}/add`, {
        method: 'POST',
        body: formData,  // ⚠️ No Content-Type header — browser sets it automatically
      });
      const saved = await res.json();
      setEquipmentList([...equipmentList, saved]);
      setCurrentView('list');
    } catch {
      alert('Failed to add equipment');
    }
  };

  // UPDATE equipment — receives FormData from EditEquipment form
  const handleUpdate = async (formData) => {
    try {
      const id = formData.get('_id');
      const res = await fetch(`${API}/update/${id}`, {
        method: 'PUT',
        body: formData,  // ⚠️ No Content-Type header
      });
      const saved = await res.json();
      setEquipmentList(equipmentList.map(item => item._id === saved._id ? saved : item));
      setCurrentView('list');
    } catch {
      alert('Failed to update equipment');
    }
  };

  // DELETE equipment from MongoDB
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this equipment?')) return;
    try {
      await fetch(`${API}/delete/${id}`, { method: 'DELETE' });
      setEquipmentList(equipmentList.filter(item => item._id !== id));
    } catch {
      alert('Failed to delete equipment');
    }
  };

  const openEdit = (item) => { setItemToEdit(item); setCurrentView('edit'); };

  if (loading) return <div className="p-6 text-gray-500">Loading equipment...</div>;
  if (error)   return <div className="p-6 text-red-500">{error}</div>;

  // Is the user on the equipment side (list / add / edit)?
  const isEquipmentTab    = currentView !== 'notifications';
  const isNotificationsTab = currentView === 'notifications';

  return (
    <div className="p-6 max-w-6xl mx-auto">

      {/* ── Page heading + Add button ── */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Equipment Management</h1>
        {isEquipmentTab && currentView === 'list' && (
          <button
            onClick={() => setCurrentView('add')}
            className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
          >
            + Add New Equipment
          </button>
        )}
      </div>

      {/* ── Tab bar ── */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>

        {/* Equipment List tab */}
        <button
          onClick={() => setCurrentView('list')}
          style={{
            padding: '8px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer',
            background: isEquipmentTab ? '#2563eb' : '#f3f4f6',
            color:      isEquipmentTab ? '#fff'     : '#374151',
            fontWeight: '600', fontSize: '14px',
            transition: 'background 0.15s',
          }}
        >
          📋 Equipment List
        </button>

        {/* Notify Requests tab */}
        <button
          onClick={() => setCurrentView('notifications')}
          style={{
            padding: '8px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer',
            background: isNotificationsTab ? '#2563eb' : '#f3f4f6',
            color:      isNotificationsTab ? '#fff'    : '#374151',
            fontWeight: '600', fontSize: '14px',
            display: 'flex', alignItems: 'center', gap: '6px',
            transition: 'background 0.15s',
          }}
        >
          🔔 Notify Requests
          {/* Red badge — shows how many emails are pending */}
          {notifyCount > 0 && (
            <span style={{
              background: '#ef4444', color: '#fff', borderRadius: '50%',
              width: '20px', height: '20px', fontSize: '11px', fontWeight: '800',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              {notifyCount}
            </span>
          )}
        </button>

      </div>

      {/* ── Tab content ── */}

      {/* Equipment list view */}
      {currentView === 'list' && (
        <EquipmentList equipment={equipmentList} onEdit={openEdit} onDelete={handleDelete} />
      )}

      {/* Add equipment view */}
      {currentView === 'add' && (
        <AddEquipment onSave={handleAdd} onCancel={() => setCurrentView('list')} />
      )}

      {/* Edit equipment view */}
      {currentView === 'edit' && (
        <EditEquipment item={itemToEdit} onSave={handleUpdate} onCancel={() => setCurrentView('list')} />
      )}

      {/* Notify requests view */}
      {currentView === 'notifications' && (
        <NotifyRequests />
      )}

    </div>
  );
};

export default EquipmentDashboard;