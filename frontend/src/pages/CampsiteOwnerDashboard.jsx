import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Utility for fetching local token
const getAuthToken = () => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    return userInfo.token;
};

const emptyForm = {
    name: '',
    location: '',
    pricePerNight: '',
    capacity: '',
    amenities: '',
    description: '',
    image: null,
};

const CampsiteOwnerDashboard = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [campsites, setCampsites] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Form and Editing
    const [showForm, setShowForm] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editSiteId, setEditSiteId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [imagePreview, setImagePreview] = useState(null);

    // Context & Navigation
    const { user } = useAuth();
    const navigate = useNavigate();

    const API_URL = 'http://localhost:5000';

    useEffect(() => {
        // Enforce access control
        const token = getAuthToken();
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        if (!token || userInfo.role !== 'campsite_owner') {
            navigate('/login');
            return;
        }
        fetchDashboardData();
    }, [navigate]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const token = getAuthToken();
            const config = { headers: { Authorization: `Bearer \${token}` } };
            
            const [sitesRes, bookingsRes] = await Promise.all([
                axios.get(`\${API_URL}/api/campsites/mine`, config),
                axios.get(`\${API_URL}/api/reservations/owner`, config)
            ]);

            setCampsites(sitesRes.data.data || []);
            setBookings(bookingsRes.data || []);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Form Handling
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setForm({ ...form, image: file });
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSaveCampsite = async (e) => {
        e.preventDefault();
        const token = getAuthToken();
        const config = { headers: { Authorization: `Bearer \${token}`, 'Content-Type': 'multipart/form-data' } };
        
        const formData = new FormData();
        formData.append('name', form.name);
        formData.append('location', form.location);
        formData.append('pricePerNight', form.pricePerNight);
        formData.append('capacity', form.capacity);
        
        // Parse amenities from comma separated list
        const amenitiesArray = form.amenities.split(',').map(a => a.trim()).filter(Boolean);
        formData.append('amenities', JSON.stringify(amenitiesArray));
        
        formData.append('description', form.description);
        if (form.image) formData.append('image', form.image);

        try {
            if (editMode) {
                await axios.put(`\${API_URL}/api/campsites/update/\${editSiteId}`, formData, config);
                alert('Campsite updated successfully');
            } else {
                await axios.post(`\${API_URL}/api/campsites/add`, formData, config);
                alert('Campsite added successfully');
            }
            setShowForm(false);
            setEditMode(false);
            setEditSiteId(null);
            setForm(emptyForm);
            setImagePreview(null);
            fetchDashboardData();
        } catch (error) {
            console.error('Error saving campsite:', error);
            alert(error.response?.data?.error || 'Error saving campsite. Please check all fields.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you certain you want to delete this campsite? This action cannot be undone.')) return;
        try {
            const token = getAuthToken();
            await axios.delete(`\${API_URL}/api/campsites/delete/\${id}`, {
                headers: { Authorization: `Bearer \${token}` }
            });
            fetchDashboardData();
        } catch (error) {
            console.error('Error deleting campsite:', error);
            alert('Failed to delete campsite.');
        }
    };

    const openEdit = (site) => {
        setEditMode(true);
        setEditSiteId(site._id);
        setForm({
            name: site.name,
            location: site.location,
            pricePerNight: site.pricePerNight,
            capacity: site.capacity,
            amenities: site.amenities ? site.amenities.join(', ') : '',
            description: site.description,
            image: null // File inputs can't be pre-filled, so we keep it null
        });
        setImagePreview(site.image ? `\${API_URL}\${site.image}` : null);
        setShowForm(true);
        setActiveTab('my-campsites');
    };

    const cancelEdit = () => {
        setShowForm(false);
        setEditMode(false);
        setEditSiteId(null);
        setForm(emptyForm);
        setImagePreview(null);
    };

    // Calculate aggregated metrics
    const totalEarnings = bookings
        .filter(b => b.status === 'confirmed')
        .reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    
    const approvedCampsites = campsites.filter(c => c.status === 'approved').length;
    const pendingCampsites = campsites.filter(c => c.status === 'pending').length;

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 flex">
            {/* Premium Sidebar */}
            <aside className="w-72 bg-gradient-to-b from-blue-900 to-indigo-900 text-white flex flex-col shadow-2xl">
                <div className="p-8 border-b border-white/10">
                    <h2 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-indigo-100 drop-shadow-sm">
                        Owner Portal
                    </h2>
                    <p className="text-sm font-medium text-blue-200/80 mt-2">Manage your campsites</p>
                </div>

                <nav className="flex-1 py-8 px-4 space-y-2">
                    <button
                        onClick={() => { setActiveTab('dashboard'); setShowForm(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 \${activeTab === 'dashboard' && !showForm ? 'bg-white/15 text-white shadow-lg backdrop-blur-md border border-white/10' : 'text-blue-100/70 hover:bg-white/5 hover:text-white'}`}
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                        <span className="font-semibold">Dashboard Overview</span>
                    </button>

                    <button
                        onClick={() => { setActiveTab('my-campsites'); setShowForm(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 \${activeTab === 'my-campsites' && !showForm ? 'bg-white/15 text-white shadow-lg backdrop-blur-md border border-white/10' : 'text-blue-100/70 hover:bg-white/5 hover:text-white'}`}
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                        <span className="font-semibold">My Campsites</span>
                    </button>

                    <button
                        onClick={() => { setActiveTab('my-campsites'); setEditMode(false); setForm(emptyForm); setImagePreview(null); setShowForm(true); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 \${showForm ? 'bg-emerald-500/20 text-emerald-100 shadow-lg backdrop-blur-md border border-emerald-500/30' : 'text-blue-100/70 hover:bg-white/5 hover:text-white'}`}
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                        <span className="font-semibold">{editMode ? 'Editing Campsite' : 'Add New Campsite'}</span>
                    </button>

                    <button
                        onClick={() => { setActiveTab('bookings'); setShowForm(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 \${activeTab === 'bookings' && !showForm ? 'bg-white/15 text-white shadow-lg backdrop-blur-md border border-white/10' : 'text-blue-100/70 hover:bg-white/5 hover:text-white'}`}
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                        <span className="font-semibold">Booking History</span>
                        {bookings.filter(b => b.status === 'confirmed').length > 0 && (
                            <span className="ml-auto bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">{bookings.filter(b => b.status === 'confirmed').length}</span>
                        )}
                    </button>
                </nav>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 p-10 overflow-y-auto">
                <header className="mb-10 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-black text-gray-800 tracking-tight">
                            {showForm ? (editMode ? 'Edit Campsite' : 'Add New Campsite') : 
                             activeTab === 'dashboard' ? 'Dashboard Overview' : 
                             activeTab === 'my-campsites' ? 'My Campsites' : 
                             'Booking History'}
                        </h1>
                        <p className="text-gray-500 font-medium mt-1">
                            {showForm ? 'Fill in the details below to publish your site' : 
                             'Here is what is happening with your campsites today.'}
                        </p>
                    </div>
                    {/* User Profile Mini */}
                    <div className="flex items-center gap-4 bg-white px-5 py-2.5 rounded-2xl shadow-sm border border-gray-100">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold shadow-md">
                            {user?.name?.charAt(0) || 'O'}
                        </div>
                        <div className="hidden md:block">
                            <p className="text-sm font-bold text-gray-800">{user?.name || 'Owner'}</p>
                            <p className="text-xs font-medium text-gray-500">{user?.email}</p>
                        </div>
                    </div>
                </header>

                {/* --- DASHBOARD TAB --- */}
                {activeTab === 'dashboard' && !showForm && (
                    <div className="space-y-8 animate-fade-in-up">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 mt-4 xl:grid-cols-4 gap-6">
                            {/* Stat Card 1 */}
                            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-shadow">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                                <div className="relative">
                                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                    </div>
                                    <p className="text-gray-500 font-semibold text-sm">Total Campsites</p>
                                    <h3 className="text-3xl font-black text-gray-800 mt-1">{campsites.length}</h3>
                                </div>
                            </div>

                            {/* Stat Card 2 */}
                            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-shadow">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                                <div className="relative">
                                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </div>
                                    <p className="text-gray-500 font-semibold text-sm">Approved Sites</p>
                                    <h3 className="text-3xl font-black text-gray-800 mt-1">{approvedCampsites}</h3>
                                </div>
                            </div>

                            {/* Stat Card 3 */}
                            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-shadow">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                                <div className="relative">
                                    <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </div>
                                    <p className="text-gray-500 font-semibold text-sm">Pending Approval</p>
                                    <h3 className="text-3xl font-black text-gray-800 mt-1">{pendingCampsites}</h3>
                                </div>
                            </div>

                            {/* Stat Card 4 */}
                            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-shadow">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                                <div className="relative">
                                    <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </div>
                                    <p className="text-gray-500 font-semibold text-sm">Total Earnings</p>
                                    <h3 className="text-3xl font-black text-gray-800 mt-1">\${totalEarnings.toLocaleString()}</h3>
                                </div>
                            </div>
                        </div>

                        {/* Recent Bookings Snapshot */}
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <h3 className="text-lg font-bold text-gray-800">Recent Bookings</h3>
                                <button onClick={() => setActiveTab('bookings')} className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">View All &rarr;</button>
                            </div>
                            <div className="p-0">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider font-bold">
                                            <th className="px-8 py-4">Customer</th>
                                            <th className="px-8 py-4">Dates</th>
                                            <th className="px-8 py-4">Amount</th>
                                            <th className="px-8 py-4">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {bookings.slice(0, 4).map(b => (
                                            <tr key={b._id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-8 py-4">
                                                    <p className="font-bold text-gray-800">{b.user?.username || 'Guest'}</p>
                                                    <p className="text-sm text-gray-500">{b.user?.email || 'N/A'}</p>
                                                </td>
                                                <td className="px-8 py-4">
                                                    <p className="text-sm font-semibold text-gray-700">{new Date(b.checkInDate).toLocaleDateString()} —</p>
                                                    <p className="text-sm font-semibold text-gray-700">{new Date(b.checkOutDate).toLocaleDateString()}</p>
                                                </td>
                                                <td className="px-8 py-4">
                                                    <p className="font-bold text-gray-800">\${b.totalPrice}</p>
                                                </td>
                                                <td className="px-8 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold \${b.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                                                        {b.status === 'confirmed' ? '✓ Confirmed' : b.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {bookings.length === 0 && <div className="p-8 text-center text-gray-500 font-medium">No bookings yet.</div>}
                            </div>
                        </div>
                    </div>
                )}

                {/* --- MY CAMPSITES TAB --- */}
                {activeTab === 'my-campsites' && !showForm && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
                        {campsites.map(site => (
                            <div key={site._id} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group flex flex-col">
                                <div className="h-48 bg-gray-200 relative overflow-hidden">
                                    {site.image ? (
                                        <img src={`\${API_URL}\${site.image}`} alt={site.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-100">
                                            <svg className="w-10 h-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                            <span className="text-xs font-semibold uppercase tracking-wider">No Image</span>
                                        </div>
                                    )}
                                    {/* Status Badge Over Image */}
                                    <div className="absolute top-4 right-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-md \${
                                            site.status === 'approved' ? 'bg-emerald-500/90 text-white' : 
                                            site.status === 'rejected' ? 'bg-red-500/90 text-white' : 
                                            'bg-amber-500/90 text-white'
                                        }`}>
                                            {site.status === 'approved' ? '✓ Approved' : site.status === 'rejected' ? '✗ Rejected' : '⏳ Pending Approval'}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-xl font-bold text-gray-800 truncate pr-4">{site.name}</h3>
                                        <p className="text-lg font-black text-blue-600 shrink-0">\${site.pricePerNight}<span className="text-xs text-gray-500 font-medium tracking-normal">/nt</span></p>
                                    </div>
                                    <p className="text-sm font-medium text-gray-500 flex items-center mb-4">
                                        <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        {site.location}
                                    </p>
                                    
                                    <div className="flex items-center gap-2 mb-6 text-sm">
                                        <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg font-semibold flex items-center">
                                            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                            Up to {site.capacity} guests
                                        </span>
                                    </div>

                                    <div className="mt-auto grid grid-cols-2 gap-3">
                                        <button onClick={() => openEdit(site)} className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-bold rounded-xl transition-colors">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                            Edit
                                        </button>
                                        <button onClick={() => handleDelete(site._id)} className="flex items-center justify-center gap-2 px-4 py-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200 border border-transparent text-gray-500 font-bold rounded-xl transition-all">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* --- ADD / EDIT FORM --- */}
                {showForm && (
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 max-w-4xl animate-fade-in-up">
                        <form onSubmit={handleSaveCampsite} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Campsite Name *</label>
                                    <input required type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent px-4 py-3 outline-none transition-all" placeholder="e.g. Forest Haven Site A" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Location *</label>
                                    <input required type="text" value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent px-4 py-3 outline-none transition-all" placeholder="e.g. Pine Valley, Oregon" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Price Per Night ($) *</label>
                                    <input required type="number" min="0" value={form.pricePerNight} onChange={e => setForm({...form, pricePerNight: e.target.value})} className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent px-4 py-3 outline-none transition-all" placeholder="e.g. 45" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Max Capacity (Guests) *</label>
                                    <input required type="number" min="1" value={form.capacity} onChange={e => setForm({...form, capacity: e.target.value})} className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent px-4 py-3 outline-none transition-all" placeholder="e.g. 4" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Amenities</label>
                                <input type="text" value={form.amenities} onChange={e => setForm({...form, amenities: e.target.value})} className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent px-4 py-3 outline-none transition-all" placeholder="Comma separated: WiFi, Fire Ring, Picnic Table, Showers" />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Description</label>
                                <textarea rows="4" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent px-4 py-3 outline-none transition-all resize-none" placeholder="Describe the wonderful features of your campsite..."></textarea>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Campsite Image</label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-2xl hover:border-blue-500 transition-colors bg-gray-50 group relative">
                                    {imagePreview ? (
                                        <div className="relative w-full text-center">
                                            <img src={imagePreview} alt="Preview" className="mx-auto h-48 object-cover rounded-xl shadow-sm" />
                                            <p className="mt-2 text-sm text-gray-500 font-medium">Click below to change image</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2 text-center">
                                            <svg className="mx-auto h-12 w-12 text-gray-400 group-hover:text-blue-500 transition-colors" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            <div className="flex text-sm text-gray-600 justify-center">
                                                <span className="relative font-bold text-blue-600 hover:text-blue-500">
                                                    Upload a file
                                                </span>
                                                <p className="pl-1">or drag and drop</p>
                                            </div>
                                            <p className="text-xs text-gray-500 font-medium tracking-wide border-t border-gray-200/60 pt-2 mt-2 inline-block">PNG, JPG, WEBP up to 5MB</p>
                                        </div>
                                    )}
                                    <input id="file-upload" name="file-upload" type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" onChange={handleFileChange} />
                                </div>
                            </div>

                            <div className="pt-4 flex gap-4 border-t border-gray-100">
                                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.25)] hover:shadow-[0_0_25px_rgba(37,99,235,0.4)] flex justify-center items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                                    {editMode ? 'Save Changes' : 'Publish Campsite'}
                                </button>
                                <button type="button" onClick={cancelEdit} className="w-1/3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3.5 rounded-xl transition-all border border-gray-200">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* --- BOOKING HISTORY TAB --- */}
                {activeTab === 'bookings' && !showForm && (
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in-up">
                        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <h3 className="text-lg font-bold text-gray-800">All Reservations</h3>
                            <span className="bg-blue-100 text-blue-800 text-xs font-extrabold px-3 py-1.5 rounded-full">{bookings.length} Total Bookings</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider font-bold">
                                        <th className="px-8 py-4">Customer Details</th>
                                        <th className="px-8 py-4">Campsite</th>
                                        <th className="px-8 py-4">Dates</th>
                                        <th className="px-8 py-4 max-w-[100px] text-right">Amount</th>
                                        <th className="px-8 py-4 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {bookings.map(b => (
                                        <tr key={b._id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 flex-shrink-0 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                                                        {b.user?.username?.charAt(0) || 'G'}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-bold text-gray-900">{b.user?.username || 'Guest'}</div>
                                                        <div className="text-sm text-gray-500 font-medium">{b.user?.email || 'N/A'}</div>
                                                        {b.user?.phone && <div className="text-xs text-gray-400 mt-0.5 tracking-wide">{b.user?.phone}</div>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="text-sm font-bold text-gray-900 border-b border-dashed border-gray-300 pb-0.5">{b.campsite?.name || 'Unknown Site'}</span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="text-sm text-gray-900 font-bold">{new Date(b.checkInDate).toLocaleDateString()}</div>
                                                <div className="text-xs text-gray-500 flex items-center gap-1 mt-1 font-semibold">
                                                    <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                                    {new Date(b.checkOutDate).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right w-32">
                                                <span className="text-sm font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-md px-3 border border-blue-100 border-b-2">\${b.totalPrice}</span>
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider \${
                                                    b.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 
                                                    b.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                    {b.status === 'confirmed' ? <><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Confirmed</> : 
                                                     b.status === 'cancelled' ? <><span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Cancelled</> : 
                                                     b.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {bookings.length === 0 && (
                                        <tr><td colSpan="5" className="px-8 py-12 text-center text-gray-500 font-medium">No bookings found. Stay tuned!</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default CampsiteOwnerDashboard;
