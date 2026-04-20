import React, { useState, useEffect } from 'react';
import CampsiteDashboard from './CampsiteDashboard';

const CampsiteAdminContainer = () => {
  const [campsites, setCampsites] = useState([]);
  const [currentView, setCurrentView] = useState('list');
  const [itemToEdit, setItemToEdit] = useState(null);
  
  const API = (process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/api/campsites';

  useEffect(() => {
    fetch(`${API}/display`)
      .then(res => res.json())
      .then(data => setCampsites(data.data || []))
      .catch(console.error);
  }, []);

  const handleAdd = async (formData) => {
    try {
      const res = await fetch(`${API}/add`, { method: 'POST', body: formData });
      const saved = await res.json();
      if (!res.ok) return alert(saved.error);
      setCampsites(prev => [...prev, saved.data]);
      setCurrentView('list');
    } catch { alert('Add failed'); }
  };

  const handleUpdate = async (formData) => {
    try {
      const id = formData.get('_id');
      const res = await fetch(`${API}/update/${id}`, { method: 'PUT', body: formData });
      const saved = await res.json();
      if (!res.ok) return alert(saved.error);
      setCampsites(prev => prev.map(item => item._id === saved.data._id ? saved.data : item));
      setCurrentView('list');
    } catch { alert('Update failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this campsite?')) return;
    try {
      await fetch(`${API}/delete/${id}`, { method: 'DELETE' });
      setCampsites(prev => prev.filter(item => item._id !== id));
    } catch { alert('Delete failed'); }
  };

  const openEdit = (item) => { setItemToEdit(item); setCurrentView('edit'); };

  const handleStatusChange = async (id, status) => {
    try {
      const res = await fetch(`${API}/update-status/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (res.ok) {
        setCampsites(prev => prev.map(item => item._id === id ? { ...item, status } : item));
      } else {
        alert(data.error);
      }
    } catch { alert('Status update failed'); }
  };

  return (
    <CampsiteDashboard
      currentView={currentView}
      setCurrentView={setCurrentView}
      campsites={campsites}
      handleAdd={handleAdd}
      handleUpdate={handleUpdate}
      handleDelete={handleDelete}
      openEdit={openEdit}
      itemToEdit={itemToEdit}
      handleStatusChange={handleStatusChange}
    />
  );
}
export default CampsiteAdminContainer;
