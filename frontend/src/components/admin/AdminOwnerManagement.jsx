import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminOwnerManagement.css'; 

const API_URL = 'http://localhost:5000';

const AdminOwnerManagement = () => {
    const navigate = useNavigate();
    const [owners, setOwners] = useState([]);
    const [pendingApplications, setPendingApplications] = useState([]);
    const [activeTab, setActiveTab] = useState('all');
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [approvalMessage, setApprovalMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        fetchOwnerData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchOwnerData = async () => {
        try {
            const stored = localStorage.getItem('userInfo');
            if (!stored) { navigate('/login'); return; }

            const userInfo = JSON.parse(stored);
            const token = userInfo.token;
            const user = userInfo;

            if (!token || user.role !== 'admin') {
                navigate('/login');
                return;
            }

            // Fetch all users to filter owners
            const response = await axios.get(`${API_URL}/api`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const allUsers = response.data || [];
            const ownersData = allUsers.filter(u => u.role === 'campsite_owner');
            const pending = ownersData.filter(o => o.ownerStatus === 'pending');

            setOwners(ownersData);
            setPendingApplications(pending);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching owners:', err);
            setErrorMessage('Failed to load campsite owners. Please try again.');
            setLoading(false);
        }
    };

    const handleApproveOwner = async (ownerId) => {
        if (!window.confirm('Are you sure you want to approve this campsite owner?')) return;
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
            const token = userInfo.token;
            await axios.patch(
                `${API_URL}/api/${ownerId}/approve-owner`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setApprovalMessage('Campsite owner approved successfully!');
            setTimeout(() => setApprovalMessage(''), 3000);
            fetchOwnerData();
        } catch (err) {
            setErrorMessage('Failed to approve campsite owner.');
            setTimeout(() => setErrorMessage(''), 3000);
        }
    };

    const handleRejectOwner = async (ownerId) => {
        if (!window.confirm('Are you sure you want to reject this campsite owner application?')) return;
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
            const token = userInfo.token;
            await axios.patch(
                `${API_URL}/api/${ownerId}/reject-owner`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setApprovalMessage('Owner application rejected.');
            setTimeout(() => setApprovalMessage(''), 3000);
            fetchOwnerData();
        } catch (err) {
            setErrorMessage('Failed to reject campsite owner.');
            setTimeout(() => setErrorMessage(''), 3000);
        }
    };

    const filteredOwners = owners.filter(
        o => o.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             o.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             o.ownerApplication?.businessName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredPending = pendingApplications.filter(
        o => o.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             o.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             o.ownerApplication?.businessName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="admin-guide-loading">
                <div className="spinner"></div>
                <p>Loading campsite owners...</p>
            </div>
        );
    }

    return (
        <div className="admin-guide-container">
            {/* Header */}
            <header className="admin-guide-header">
                <div className="admin-guide-header-content">
                    <button className="back-button" onClick={() => navigate('/admin-dashboard')}>
                        ← Back
                    </button>
                    <div>
                        <h1 className="admin-guide-title">Owner Management</h1>
                        <p className="admin-guide-subtitle">Manage and approve campsite owner applications</p>
                    </div>
                </div>
            </header>

            {/* Messages */}
            {approvalMessage && (
                <div className="message-banner success-banner">{approvalMessage}</div>
            )}
            {errorMessage && (
                <div className="message-banner error-banner">{errorMessage}</div>
            )}

            {/* Main Content */}
            <main className="admin-guide-main">
                {/* Stats */}
                <div className="guide-stats">
                    <div className="stat-card">
                        <div className="stat-icon orange">🏕️</div>
                        <div className="stat-info">
                            <p className="stat-label">Total Owners</p>
                            <p className="stat-value">{owners.length}</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon yellow">⏳</div>
                        <div className="stat-info">
                            <p className="stat-label">Pending Applications</p>
                            <p className="stat-value">{pendingApplications.length}</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon green">✓</div>
                        <div className="stat-info">
                            <p className="stat-label">Approved Owners</p>
                            <p className="stat-value">{owners.filter(o => o.ownerStatus === 'approved').length}</p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="guide-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveTab('all')}
                    >
                        All Owners ({owners.length})
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
                        onClick={() => setActiveTab('pending')}
                    >
                        Pending ({pendingApplications.length})
                    </button>
                </div>

                {/* Search Bar */}
                <div className="search-bar">
                    <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                    </svg>
                    <input
                        type="text"
                        placeholder="Search by name, email, or business name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>

                {/* Owners Table */}
                <div className="guides-table-wrapper">
                    {activeTab === 'all' ? (
                        <>
                            {filteredOwners.length === 0 ? (
                                <div className="empty-state">
                                    <p>No campsite owners found</p>
                                </div>
                            ) : (
                                <table className="guides-table">
                                    <thead>
                                        <tr>
                                            <th>Business Name</th>
                                            <th>Owner Name</th>
                                            <th>Email</th>
                                            <th>Phone</th>
                                            <th>NIC</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredOwners.map(owner => (
                                            <tr key={owner._id} className="guide-row">
                                                <td className="name-cell">
                                                    <div className="guide-avatar">{owner.ownerApplication?.businessName?.charAt(0) || owner.name?.charAt(0)}</div>
                                                    <span>{owner.ownerApplication?.businessName || '—'}</span>
                                                </td>
                                                <td>{owner.name}</td>
                                                <td>{owner.email}</td>
                                                <td>{owner.phone || owner.ownerApplication?.phone || '—'}</td>
                                                <td>
                                                    {owner.ownerApplication?.nic || '—'}
                                                </td>
                                                <td>
                                                    <span className={`status-badge ${owner.ownerStatus === 'approved' ? 'verified' : owner.ownerStatus === 'rejected' ? 'rejected' : 'pending'}`}>
                                                        {owner.ownerStatus === 'approved' ? '✓ Approved' : owner.ownerStatus === 'rejected' ? '✗ Rejected' : '⏳ Pending'}
                                                    </span>
                                                </td>
                                                <td className="actions-cell">
                                                    {owner.ownerStatus === 'pending' && (
                                                        <>
                                                            <button
                                                                className="action-btn approve-btn"
                                                                onClick={() => handleApproveOwner(owner._id)}
                                                            >
                                                                Approve
                                                            </button>
                                                            <button
                                                                className="action-btn reject-btn"
                                                                onClick={() => handleRejectOwner(owner._id)}
                                                            >
                                                                Reject
                                                            </button>
                                                        </>
                                                    )}
                                                    <button className="action-btn view-btn">
                                                        View
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </>
                    ) : (
                        <>
                            {filteredPending.length === 0 ? (
                                <div className="empty-state">
                                    <p>No pending applications</p>
                                </div>
                            ) : (
                                <table className="guides-table">
                                    <thead>
                                        <tr>
                                            <th>Business Name</th>
                                            <th>Owner details</th>
                                            <th>Experience</th>
                                            <th>Address</th>
                                            <th>NIC</th>
                                            <th>Description</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredPending.map(owner => (
                                            <tr key={owner._id} className="guide-row pending-row">
                                                <td className="name-cell">
                                                    <div className="guide-avatar">{owner.ownerApplication?.businessName?.charAt(0) || owner.name?.charAt(0)}</div>
                                                    <span>{owner.ownerApplication?.businessName || '—'}</span>
                                                </td>
                                                <td>
                                                    <div className="text-sm font-medium text-gray-900">{owner.name}</div>
                                                    <div className="text-sm text-gray-500">{owner.email}</div>
                                                    <div className="text-sm text-gray-500">{owner.phone || owner.ownerApplication?.phone}</div>
                                                </td>
                                                <td>
                                                    {owner.ownerApplication?.experience || '0'} years
                                                </td>
                                                <td>
                                                    {owner.ownerApplication?.address || '—'}
                                                </td>
                                                <td>
                                                    {owner.ownerApplication?.nic || '—'}
                                                </td>
                                                <td className="description-cell">
                                                    <span className="description-text">
                                                        {owner.ownerApplication?.description || 'No description provided'}
                                                    </span>
                                                </td>
                                                <td className="actions-cell">
                                                    <button
                                                        className="action-btn approve-btn"
                                                        onClick={() => handleApproveOwner(owner._id)}
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        className="action-btn reject-btn"
                                                        onClick={() => handleRejectOwner(owner._id)}
                                                    >
                                                        Reject
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminOwnerManagement;
