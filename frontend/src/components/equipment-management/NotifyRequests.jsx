import React, { useState, useEffect } from 'react';

const API = process.env.REACT_APP_API_URL + '/api/notify';

const NotifyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('pending'); // 'pending' or 'all'

  useEffect(() => {
    fetch(`${API}/all`)
      .then(res => res.json())
      .then(data => { setRequests(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const markNotified = async (id) => {
    await fetch(`${API}/mark/${id}`, { method: 'PATCH' });
    setRequests(prev => prev.map(r => r._id === id ? { ...r, notified: true } : r));
  };

  const deleteRequest = async (id) => {
    if (!window.confirm('Delete this notification request?')) return;
    await fetch(`${API}/delete/${id}`, { method: 'DELETE' });
    setRequests(prev => prev.filter(r => r._id !== id));
  };

  const displayed  = filter === 'pending' ? requests.filter(r => !r.notified) : requests;
  const pendingCount = requests.filter(r => !r.notified).length;

  // Group pending requests by item name
  const grouped = displayed.reduce((acc, r) => {
    const key = r.itemName;
    if (!acc[key]) acc[key] = [];
    acc[key].push(r);
    return acc;
  }, {});

  if (loading) return <div className="p-6 text-gray-500">Loading...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">🔔 Notify Me Requests</h2>
          <p className="text-sm text-gray-500 mt-1">
            Users who want to be notified when out-of-stock items are restocked
          </p>
        </div>
        {pendingCount > 0 && (
          <span style={{
            background: '#ef4444', color: '#fff', borderRadius: '99px',
            padding: '4px 14px', fontSize: '13px', fontWeight: '700',
          }}>
            {pendingCount} pending
          </span>
        )}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {['pending', 'all'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '7px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer',
            background: filter === f ? '#16a34a' : '#f3f4f6',
            color:      filter === f ? '#fff' : '#374151',
            fontWeight: filter === f ? '700' : '400', fontSize: '13px',
          }}>
            {f === 'pending' ? `⏳ Pending (${pendingCount})` : `📋 All (${requests.length})`}
          </button>
        ))}
      </div>

      {displayed.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🎉</div>
          <p style={{ fontWeight: '600' }}>No pending notification requests!</p>
        </div>
      ) : (
        // Grouped by item name
        Object.entries(grouped).map(([itemName, itemRequests]) => (
          <div key={itemName} style={{
            background: '#fff', borderRadius: '12px',
            border: '1px solid #e5e7eb', marginBottom: '16px', overflow: 'hidden',
          }}>
            {/* Item group header */}
            <div style={{
              padding: '14px 20px', background: '#f9fafb',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <span style={{ fontWeight: '700', fontSize: '15px', color: '#111827' }}>📦 {itemName}</span>
                <span style={{
                  marginLeft: '10px', fontSize: '12px', fontWeight: '600',
                  background: '#fee2e2', color: '#dc2626',
                  padding: '2px 8px', borderRadius: '4px',
                }}>Out of Stock</span>
              </div>
              <span style={{ fontSize: '13px', color: '#6b7280' }}>
                {itemRequests.length} user{itemRequests.length > 1 ? 's' : ''} waiting
              </span>
            </div>

            {/* Email rows */}
            {itemRequests.map(req => (
              <div key={req._id} style={{
                padding: '14px 20px', borderBottom: '1px solid #f3f4f6',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: req.notified ? '#f9fafb' : '#fff',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {/* Avatar circle */}
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: req.notified ? '#d1fae5' : '#dbeafe',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '14px', fontWeight: '700',
                    color: req.notified ? '#059669' : '#1d4ed8',
                    flexShrink: 0,
                  }}>
                    {req.email[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '14px', color: '#111827' }}>
                      {req.email}
                    </div>
                    <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                      Requested: {new Date(req.createdAt).toLocaleDateString('en-US', {
                        day: 'numeric', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {req.notified ? (
                    <span style={{
                      fontSize: '12px', fontWeight: '600', color: '#059669',
                      background: '#d1fae5', padding: '3px 10px', borderRadius: '99px',
                    }}>✓ Notified</span>
                  ) : (
                    <button
                      onClick={() => markNotified(req._id)}
                      style={{
                        padding: '6px 14px', borderRadius: '6px',
                        background: '#16a34a', color: '#fff', border: 'none',
                        fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                      }}
                    >✓ Mark Notified</button>
                  )}
                  <button
                    onClick={() => deleteRequest(req._id)}
                    style={{
                      padding: '6px 10px', borderRadius: '6px',
                      background: '#fee2e2', color: '#dc2626', border: 'none',
                      fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                    }}
                  >🗑</button>
                </div>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
};

export default NotifyRequests;