import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminGuideManagement.css';

const API_URL = 'http://localhost:5000';

const AdminGuideManagement = () => {
    const navigate = useNavigate();
    const [guides, setGuides] = useState([]);
    const [pendingApplications, setPendingApplications] = useState([]);
    const [activeTab, setActiveTab] = useState('all');
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [approvalMessage, setApprovalMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        fetchGuideData();
    }, []);

    const fetchGuideData = async () => {
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

            // Fetch all users to filter guides
            const response = await axios.get(`${API_URL}/api/users`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const allUsers = response.data || [];
            const guidesData = allUsers.filter(u => u.role === 'guide');
            const pending = guidesData.filter(g => g.guideStatus === 'pending');

            setGuides(guidesData);
            setPendingApplications(pending);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching guides:', err);
            setErrorMessage('Failed to load guides. Please try again.');
            setLoading(false);
        }
    };

    const handleApproveGuide = async (guideId) => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
            const token = userInfo.token;
            await axios.patch(
                `${API_URL}/api/guides/${guideId}/approve`,
                { verified: true },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setApprovalMessage('Guide approved successfully!');
            setTimeout(() => setApprovalMessage(''), 3000);
            fetchGuideData();
        } catch (err) {
            setErrorMessage('Failed to approve guide.');
            setTimeout(() => setErrorMessage(''), 3000);
        }
    };

    const handleRejectGuide = async (guideId) => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
            const token = userInfo.token;
            await axios.delete(
                `${API_URL}/api/guides/${guideId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setApprovalMessage('Guide application rejected.');
            setTimeout(() => setApprovalMessage(''), 3000);
            fetchGuideData();
        } catch (err) {
            setErrorMessage('Failed to reject guide.');
            setTimeout(() => setErrorMessage(''), 3000);
        }
    };

    const filteredGuides = guides.filter(
        g => g.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             g.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredPending = pendingApplications.filter(
        g => g.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             g.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="admin-guide-loading">
                <div className="spinner"></div>
                <p>Loading guides...</p>
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
                        <h1 className="admin-guide-title">Guide Management</h1>
                        <p className="admin-guide-subtitle">Manage and approve guide applications</p>
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
                        <div className="stat-icon orange">👥</div>
                        <div className="stat-info">
                            <p className="stat-label">Total Guides</p>
                            <p className="stat-value">{guides.length}</p>
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
                            <p className="stat-label">Approved Guides</p>
                            <p className="stat-value">{guides.filter(g => g.guideStatus === 'approved').length}</p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="guide-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveTab('all')}
                    >
                        All Guides ({guides.length})
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
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>

                {/* Guides Table */}
                <div className="guides-table-wrapper">
                    {activeTab === 'all' ? (
                        <>
                            {filteredGuides.length === 0 ? (
                                <div className="empty-state">
                                    <p>No guides found</p>
                                </div>
                            ) : (
                                <table className="guides-table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Phone</th>
                                            <th>NIC</th>
                                            <th>Age</th>
                                            <th>Languages</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredGuides.map(guide => (
                                            <tr key={guide._id} className="guide-row">
                                                <td className="name-cell">
                                                    <div className="guide-avatar">{guide.name?.charAt(0)}</div>
                                                    <span>{guide.guideApplication?.fullName || guide.name}</span>
                                                </td>
                                                <td>{guide.email}</td>
                                                <td>{guide.phone || '—'}</td>
                                                <td>
                                                    {guide.guideApplication?.nic || guide.nic || '—'}
                                                </td>
                                                <td>
                                                    {guide.guideApplication?.age || guide.age || '—'}
                                                </td>
                                                <td>
                                                    <div className="languages-tags">
                                                        {guide.guideApplication?.languages?.map(lang => (
                                                            <span key={lang} className="lang-tag">{lang}</span>
                                                        )) || (guide.language ? <span className="lang-tag">{guide.language}</span> : '—')}
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`status-badge ${guide.guideStatus === 'approved' ? 'verified' : 'pending'}`}>
                                                        {guide.guideStatus === 'approved' ? '✓ Approved' : '⏳ Pending'}
                                                    </span>
                                                </td>
                                                <td className="actions-cell">
                                                    {guide.guideStatus !== 'approved' && (
                                                        <>
                                                            <button
                                                                className="action-btn approve-btn"
                                                                onClick={() => handleApproveGuide(guide._id)}
                                                            >
                                                                Approve
                                                            </button>
                                                            <button
                                                                className="action-btn reject-btn"
                                                                onClick={() => handleRejectGuide(guide._id)}
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
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Phone</th>
                                            <th>Experience</th>
                                            <th>NIC</th>
                                            <th>CV</th>
                                            <th>Description</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredPending.map(guide => (
                                            <tr key={guide._id} className="guide-row pending-row">
                                                <td className="name-cell">
                                                    <div className="guide-avatar">{guide.name?.charAt(0)}</div>
                                                    <span>{guide.guideApplication?.fullName || guide.name}</span>
                                                </td>
                                                <td>{guide.email}</td>
                                                <td>{guide.phone || '—'}</td>
                                                <td>
                                                    {guide.guideApplication?.experience || '—'} years
                                                </td>
                                                <td>
                                                    {guide.guideApplication?.nic || '—'}
                                                </td>
                                                <td>
                                                    {guide.guideApplication?.cv ? (
                                                        <a 
                                                            href={`${API_URL}${guide.guideApplication.cv}`} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="view-cv-link"
                                                        >
                                                            View CV
                                                        </a>
                                                    ) : (
                                                        <span className="text-gray-400 italic">No CV</span>
                                                    )}
                                                </td>
                                                <td className="description-cell">
                                                    <span className="description-text">
                                                        {guide.guideApplication?.description || 'No description provided'}
                                                    </span>
                                                </td>
                                                <td className="actions-cell">
                                                    <button
                                                        className="action-btn approve-btn"
                                                        onClick={() => handleApproveGuide(guide._id)}
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        className="action-btn reject-btn"
                                                        onClick={() => handleRejectGuide(guide._id)}
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

export default AdminGuideManagement;
