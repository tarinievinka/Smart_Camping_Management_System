import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('users');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/login'); return; }
    fetchData();
  }, [user, navigate]);

  const config = () => ({ headers: { Authorization: `Bearer ${user.token}` } });

  const fetchData = async () => {
    const [usersRes, bookingsRes] = await Promise.all([
      axios.get('/api/users', config()),
      axios.get('/api/reservations', config()),
    ]);
    setUsers(usersRes.data);
    setBookings(bookingsRes.data);
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    await axios.delete(`/api/users/${id}`, config());
    setUsers(u => u.filter(x => x._id !== id));
  };

  return (
    <div className="admin-page">
      <div className="admin-sidebar">
        <div className="admin-brand">🌲 Admin Portal</div>
        <button className={`admin-tab-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>👥 Users</button>
        <button className={`admin-tab-btn ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}>📋 All Bookings</button>
      </div>

      <div className="admin-content">
        {activeTab === 'users' && (
          <div>
            <div className="admin-section-header">
              <h2>Registered Users</h2>
              <span className="admin-count">{users.length} users</span>
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr><th>Username</th><th>Email</th><th>Role</th><th>Joined</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id}>
                      <td><strong>{u.username}</strong></td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`role-badge ${u.role === 'admin' ? 'admin' : u.role === 'campsite-owner' ? 'owner' : 'user'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button className="admin-action-btn delete" onClick={() => handleDeleteUser(u._id)}>🗑 Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div>
            <div className="admin-section-header">
              <h2>All Bookings</h2>
              <span className="admin-count">{bookings.length} bookings</span>
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr><th>Customer</th><th>Campsite</th><th>Check In</th><th>Check Out</th><th>Total</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {bookings.length === 0 ? (
                    <tr><td colSpan="6" style={{ textAlign: 'center', color: '#999', padding: '40px' }}>No bookings yet.</td></tr>
                  ) : bookings.map(b => (
                    <tr key={b._id}>
                      <td><strong>{b.user?.username}</strong><br /><span style={{ fontSize: '12px', color: '#999' }}>{b.user?.email}</span></td>
                      <td>{b.campsite?.title}<br /><span style={{ fontSize: '12px', color: '#999' }}>📍 {b.campsite?.location}</span></td>
                      <td>{new Date(b.checkInDate).toLocaleDateString()}</td>
                      <td>{new Date(b.checkOutDate).toLocaleDateString()}</td>
                      <td><strong>${b.totalPrice}</strong></td>
                      <td><span className={`role-badge ${b.status === 'confirmed' ? 'user' : 'admin'}`}>{b.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
