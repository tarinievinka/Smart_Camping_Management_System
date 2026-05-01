import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { User } from 'lucide-react';

// Utility for fetching local token
const getAuthToken = () => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    return userInfo.token;
};

const emptyForm = {
    name: '',
    province: '',
    city: '',
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

    // Profile Management State
    const [profileForm, setProfileForm] = useState({
        name: '',
        email: '',
        phone: '',
        businessName: '',
        nic: '',
        address: '',
        description: '',
        experience: 0
    });
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);

    // Context & Navigation
    const { user, setUser: setAuthUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const API_URL = 'http://localhost:5000';

    useEffect(() => {
        // Enforce access control
        const token = getAuthToken();
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        if (!token) {
            navigate('/login');
            return;
        }

        const role = userInfo.role?.toLowerCase()?.trim();
        const ownerStatus = userInfo.ownerStatus?.toLowerCase()?.trim();
        const isOwner = ownerStatus === 'approved' || 
                        ['owner', 'campsite_owner', 'campsite-owner', 'campsite owner'].includes(role);

        if (!isOwner) {
            navigate('/login');
            return;
        }
        fetchDashboardData();
    }, [navigate]);

    // Handle URL-based triggers (e.g. from Navbar)
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('profile') === 'open') {
            setShowProfileModal(true);
        }
    }, [location.search]);

    const fetchDashboardData = async () => {
        setLoading(true);
        const token = getAuthToken();
        const config = { headers: { Authorization: `Bearer ${token}` } };

        // Fetch Campsites
        try {
            const sitesRes = await axios.get(`${API_URL}/api/campsites/mine`, config);
            const sitesArray = sitesRes.data.data || sitesRes.data.campsites || (Array.isArray(sitesRes.data) ? sitesRes.data : []);
            setCampsites(sitesArray);
        } catch (error) {
            console.error('[DASHBOARD] Campsite fetch failed:', error);
        }

        // Fetch Bookings
        try {
            const bookingsRes = await axios.get(`${API_URL}/api/reservations/owner`, config);
            const bookingsArray = bookingsRes.data.data || (Array.isArray(bookingsRes.data) ? bookingsRes.data : []);
            setBookings(bookingsArray);
        } catch (error) {
            console.error('[DASHBOARD] Booking fetch failed:', error);
        }

        // Fetch User Profile
        try {
            const profileRes = await axios.get(`${API_URL}/api/getProfile`, config);
            const userData = profileRes.data;
            setProfileForm({
                name: userData.name || '',
                email: userData.email || '',
                phone: userData.phone || '',
                businessName: userData.ownerApplication?.businessName || '',
                nic: userData.ownerApplication?.nic || '',
                address: userData.ownerApplication?.address || '',
                description: userData.ownerApplication?.description || '',
                experience: userData.ownerApplication?.experience || 0
            });
        } catch (error) {
            console.error('[DASHBOARD] Profile fetch failed:', error);
        }

        setLoading(false);
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setIsUpdatingProfile(true);
        try {
            const token = getAuthToken();
            const config = { headers: { Authorization: `Bearer ${token}` } };
            
            const updateData = {
                name: profileForm.name,
                phone: profileForm.phone,
                ownerApplication: {
                    businessName: profileForm.businessName,
                    nic: profileForm.nic,
                    address: profileForm.address,
                    description: profileForm.description,
                    experience: profileForm.experience
                }
            };

            const response = await axios.put(`${API_URL}/api/updateProfile`, updateData, config);
            
            // Update local storage to keep info in sync
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
            userInfo.name = response.data.name;
            localStorage.setItem('userInfo', JSON.stringify(userInfo));
            setAuthUser(userInfo); // Update AuthContext state
            
            alert('Profile updated successfully!');
            fetchDashboardData();
        } catch (error) {
            console.error('Error updating profile:', error);
            alert(error.response?.data?.error || 'Failed to update profile');
        } finally {
            setIsUpdatingProfile(false);
        }
    };

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
        const config = { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } };
        
        const formData = new FormData();
        formData.append('name', form.name);
        formData.append('location', `${form.province}, ${form.city}`);
        formData.append('pricePerNight', form.pricePerNight);
        formData.append('capacity', form.capacity);
        
        const amenitiesArray = form.amenities.split(',').map(a => a.trim()).filter(Boolean);
        formData.append('amenities', JSON.stringify(amenitiesArray));
        
        formData.append('description', form.description);
        if (form.image) formData.append('image', form.image);

        try {
            if (editMode) {
                await axios.put(`${API_URL}/api/campsites/update/${editSiteId}`, formData, config);
                alert('Campsite updated successfully');
            } else {
                await axios.post(`${API_URL}/api/campsites/add`, formData, config);
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
            await axios.delete(`${API_URL}/api/campsites/delete/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchDashboardData();
        } catch (error) {
            console.error('Error deleting campsite:', error);
            alert('Failed to delete campsite.');
        }
    };

    const openEdit = (site) => {
        const locationParts = (site.location || '').split(', ');
        setEditMode(true);
        setEditSiteId(site._id);
        setForm({
            name: site.name,
            province: locationParts[0] || '',
            city: locationParts[1] || '',
            pricePerNight: site.pricePerNight,
            capacity: site.capacity,
            amenities: site.amenities ? site.amenities.join(', ') : '',
            description: site.description,
            image: null
        });
        setImagePreview(site.image ? `${API_URL}${site.image}` : null);
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

    const totalEarnings = bookings
        .filter(b => b.status === 'confirmed')
        .reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    
    const approvedCampsites = campsites.filter(c => c.status === 'approved').length;
    const pendingCampsites = campsites.filter(c => c.status === 'pending').length;

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 flex">
            <aside className="w-72 bg-gradient-to-b from-green-900 to-emerald-900 text-white flex flex-col shadow-2xl">
                <div className="p-8 border-b border-white/10">
                    <h2 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-green-200 to-emerald-100 drop-shadow-sm">
                        Owner Portal
                    </h2>
                    <p className="text-sm font-medium text-green-200/80 mt-2">Manage your campsites</p>
                </div>

                <nav className="flex-1 py-8 px-4 space-y-2">
                    <button
                        onClick={() => { setActiveTab('dashboard'); setShowForm(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${activeTab === 'dashboard' && !showForm ? 'bg-white/15 text-white shadow-lg backdrop-blur-md border border-white/10' : 'text-green-100/70 hover:bg-white/5 hover:text-white'}`}
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                        <span className="font-semibold">Dashboard Overview</span>
                    </button>

                    <button
                        onClick={() => { setActiveTab('my-campsites'); setShowForm(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${activeTab === 'my-campsites' && !showForm ? 'bg-white/15 text-white shadow-lg backdrop-blur-md border border-white/10' : 'text-green-100/70 hover:bg-white/5 hover:text-white'}`}
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                        <span className="font-semibold">My Campsites</span>
                    </button>

                    <button
                        onClick={() => { setActiveTab('my-campsites'); setEditMode(false); setForm(emptyForm); setImagePreview(null); setShowForm(true); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${showForm ? 'bg-emerald-500/20 text-emerald-100 shadow-lg backdrop-blur-md border border-emerald-500/30' : 'text-green-100/70 hover:bg-white/5 hover:text-white'}`}
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                        <span className="font-semibold">{editMode ? 'Editing Campsite' : 'Add New Campsite'}</span>
                    </button>

                    <button
                        onClick={() => { setActiveTab('bookings'); setShowForm(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${activeTab === 'bookings' && !showForm ? 'bg-white/15 text-white shadow-lg backdrop-blur-md border border-white/10' : 'text-green-100/70 hover:bg-white/5 hover:text-white'}`}
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                        <span className="font-semibold">Booking History</span>
                        {bookings.filter(b => b.status === 'confirmed').length > 0 && (
                            <span className="ml-auto bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">{bookings.filter(b => b.status === 'confirmed').length}</span>
                        )}
                    </button>

                    <div className="pt-4 mt-4 border-t border-white/10">
                        <button
                            onClick={() => setShowProfileModal(true)}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-green-100/70 hover:bg-white/5 hover:text-white"
                        >
                            <User className="w-5 h-5" />
                            <span className="font-semibold">My Profile</span>
                        </button>
                    </div>
                </nav>
            </aside>

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
                    <div className="flex items-center gap-2 bg-black/5 px-4 py-2 rounded-xl text-xs font-bold text-gray-600">
                        <div className={`w-2 h-2 rounded-full ${campsites.length > 0 ? 'bg-green-500' : 'bg-red-400'}`}></div>
                        Sync: {campsites.length} Sites Loaded
                    </div>
                    <button 
                        onClick={() => setShowProfileModal(true)}
                        className="flex items-center gap-4 bg-white px-5 py-2.5 rounded-2xl shadow-sm border border-gray-100 hover:border-green-300 transition-all group"
                    >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold shadow-md group-hover:scale-110 transition-transform">
                            {user?.name?.charAt(0) || 'O'}
                        </div>
                        <div className="hidden md:block text-left">
                            <p className="text-sm font-bold text-gray-800">{user?.name || 'Owner'}</p>
                            <p className="text-xs font-medium text-gray-500">{user?.email}</p>
                        </div>
                    </button>
                </header>

                {activeTab === 'dashboard' && !showForm && (
                    <div className="space-y-8 animate-fade-in-up">
                        <div className="grid grid-cols-1 md:grid-cols-2 mt-4 xl:grid-cols-4 gap-6">
                            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-shadow">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                                <div className="relative">
                                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                    </div>
                                    <p className="text-gray-500 font-semibold text-sm">Total Campsites</p>
                                    <h3 className="text-3xl font-black text-gray-800 mt-1">{campsites.length}</h3>
                                </div>
                            </div>

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

                            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-shadow">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                                <div className="relative">
                                    <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </div>
                                    <p className="text-gray-500 font-semibold text-sm">Total Earnings</p>
                                    <h3 className="text-3xl font-black text-gray-800 mt-1">${totalEarnings.toLocaleString()}</h3>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <h3 className="text-lg font-bold text-gray-800">Recent Bookings</h3>
                                <button onClick={() => setActiveTab('bookings')} className="text-sm font-semibold text-green-600 hover:text-green-800 transition-colors">View All &rarr;</button>
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
                                                    <p className="font-bold text-gray-800">{b.user?.name || 'Guest'}</p>
                                                    <p className="text-sm text-gray-500">{b.user?.email || 'N/A'}</p>
                                                </td>
                                                <td className="px-8 py-4">
                                                    <p className="text-sm font-semibold text-gray-700">{new Date(b.checkInDate).toLocaleDateString()} —</p>
                                                    <p className="text-sm font-semibold text-gray-700">{new Date(b.checkOutDate).toLocaleDateString()}</p>
                                                </td>
                                                <td className="px-8 py-4">
                                                    <p className="font-bold text-gray-800">${b.totalPrice}</p>
                                                </td>
                                                <td className="px-8 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${b.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
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

                {activeTab === 'my-campsites' && !showForm && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
                        {campsites.map(site => (
                            <div key={site._id} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group flex flex-col">
                                <div className="h-48 bg-gray-200 relative overflow-hidden">
                                    {site.image ? (
                                        <img src={`${API_URL}${site.image}`} alt={site.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-100">
                                            <svg className="w-10 h-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 00-2 2z" /></svg>
                                            <span className="text-xs font-semibold uppercase tracking-wider">No Image</span>
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-md ${
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
                                        <p className="text-lg font-black text-green-600 shrink-0">${site.pricePerNight}<span className="text-xs text-gray-500 font-medium tracking-normal">/nt</span></p>
                                    </div>
                                    <p className="text-sm font-medium text-gray-500 flex items-center mb-4">
                                        <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        {site.location.split(', ')[0] || site.location}, {site.location.split(', ')[1] || ''}
                                    </p>
                                    
                                    <div className="flex items-center gap-2 mb-6 text-sm">
                                        <span className="bg-green-50 text-green-700 px-2.5 py-1 rounded-lg font-semibold flex items-center">
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

                {showForm && (
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 max-w-4xl animate-fade-in-up">
                        <form onSubmit={handleSaveCampsite} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Campsite Name *</label>
                                    <input required type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent px-4 py-3 outline-none transition-all" placeholder="e.g. Forest Haven Site A" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Province *</label>
                                        <input required type="text" value={form.province} onChange={e => setForm({...form, province: e.target.value})} className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent px-4 py-3 outline-none transition-all" placeholder="e.g. Oregon" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">City *</label>
                                        <input required type="text" value={form.city} onChange={e => setForm({...form, city: e.target.value})} className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent px-4 py-3 outline-none transition-all" placeholder="e.g. Pine Valley" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Price Per Night ($) *</label>
                                    <input required type="number" min="0" value={form.pricePerNight} onChange={e => setForm({...form, pricePerNight: e.target.value})} className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent px-4 py-3 outline-none transition-all" placeholder="e.g. 45" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Max Capacity (Guests) *</label>
                                    <input required type="number" min="1" value={form.capacity} onChange={e => setForm({...form, capacity: e.target.value})} className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent px-4 py-3 outline-none transition-all" placeholder="e.g. 4" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Amenities</label>
                                <input type="text" value={form.amenities} onChange={e => setForm({...form, amenities: e.target.value})} className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent px-4 py-3 outline-none transition-all" placeholder="Comma separated: WiFi, Fire Ring, Picnic Table, Showers" />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Description</label>
                                <textarea rows="4" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent px-4 py-3 outline-none transition-all resize-none" placeholder="Describe the wonderful features of your campsite..."></textarea>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Campsite Image</label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-2xl hover:border-green-500 transition-colors bg-gray-50 group relative">
                                    {imagePreview ? (
                                        <div className="relative w-full text-center">
                                            <img src={imagePreview} alt="Preview" className="mx-auto h-48 object-cover rounded-xl shadow-sm" />
                                            <p className="mt-2 text-sm text-gray-500 font-medium">Click below to change image</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2 text-center">
                                            <svg className="mx-auto h-12 w-12 text-gray-400 group-hover:text-green-500 transition-colors" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            <div className="flex text-sm text-gray-600 justify-center">
                                                <span className="relative font-bold text-green-600 hover:text-green-500">
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
                                <button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.25)] hover:shadow-[0_0_25px_rgba(37,99,235,0.4)] flex justify-center items-center gap-2">
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

                {activeTab === 'bookings' && !showForm && (
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in-up">
                        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <h3 className="text-lg font-bold text-gray-800">All Reservations</h3>
                            <span className="bg-green-100 text-green-800 text-xs font-extrabold px-3 py-1.5 rounded-full">{bookings.length} Total Bookings</span>
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
                                                    <div className="h-10 w-10 flex-shrink-0 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold text-sm">
                                                        {b.user?.name?.charAt(0) || 'G'}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-bold text-gray-900">{b.user?.name || 'Guest'}</div>
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
                                                <span className="text-sm font-black text-green-600 bg-green-50 px-2 py-1 rounded-md px-3 border border-green-100 border-b-2">${b.totalPrice}</span>
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider ${
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

            {showProfileModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-8">
                    <div 
                        className="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity animate-fade-in"
                        onClick={() => setShowProfileModal(false)}
                    ></div>

                    <div className="relative w-full max-w-5xl max-h-[90vh] bg-gray-50 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-scale-in">
                        <div className="px-8 py-6 bg-white border-b border-gray-100 flex items-center justify-between shrink-0">
                            <div>
                                <h2 className="text-2xl font-black text-gray-800 tracking-tight">Campsite Owner Profile</h2>
                                <p className="text-sm text-gray-500 font-medium">Manage your personal and professional business information.</p>
                            </div>
                            <button 
                                onClick={() => setShowProfileModal(false)}
                                className="p-2.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all"
                                aria-label="Close modal"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-1 space-y-6">
                                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center">
                                        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-green-500 to-emerald-500 mx-auto flex items-center justify-center text-4xl text-white font-black shadow-xl mb-4">
                                            {profileForm.name?.charAt(0) || 'O'}
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-800">{profileForm.name}</h3>
                                        <p className="text-sm font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full inline-block mt-2 uppercase tracking-wider">Verified Owner</p>
                                        
                                        <div className="mt-8 pt-8 border-t border-gray-50 space-y-4 text-left">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-400 font-medium">Status</span>
                                                <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded italic text-[10px]">ACTIVE</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-400 font-medium">Sites</span>
                                                <span className="text-gray-800 font-bold">{campsites.length} registered</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-400 font-medium">Experience</span>
                                                <span className="text-gray-800 font-bold">{profileForm.experience} years</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-green-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12"></div>
                                        <h4 className="text-lg font-bold mb-3 relative z-10">Need Help?</h4>
                                        <p className="text-green-100/70 text-sm leading-relaxed mb-6 relative z-10">
                                            Registered information such as NIC and Email require manual verification if changed.
                                        </p>
                                        <button className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-xl transition-all border border-white/20 text-sm shadow-inner group">
                                            Contact Support <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="lg:col-span-2">
                                    <form onSubmit={handleUpdateProfile} className="space-y-8 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm transition-all duration-300">
                                        <section>
                                            <h4 className="text-xs font-black text-green-600 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                                <span className="w-8 h-[2px] bg-green-600"></span>
                                                Personal Details
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                                                    <input required type="text" value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} className="w-full bg-gray-50 border border-gray-100 text-gray-800 text-sm rounded-2xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 px-5 py-4 outline-none transition-all font-semibold" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Contact Phone</label>
                                                    <input type="text" value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} className="w-full bg-gray-50 border border-gray-100 text-gray-800 text-sm rounded-2xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 px-5 py-4 outline-none transition-all font-semibold" placeholder="07xxxxxxxx" />
                                                </div>
                                                <div className="md:col-span-2">
                                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Primary Email Address</label>
                                                    <div className="relative group">
                                                        <input disabled type="email" value={profileForm.email} className="w-full bg-gray-100 border border-transparent text-gray-500 text-sm rounded-2xl px-5 py-4 cursor-not-allowed font-medium opacity-70" />
                                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-[10px] px-2 py-1 rounded shadow-lg pointer-events-none">Email cannot be changed manually</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </section>

                                        <section>
                                            <h4 className="text-xs font-black text-green-600 uppercase tracking-[0.2em] mb-6 flex items-center gap-2 pt-4">
                                                <span className="w-8 h-[2px] bg-green-600"></span>
                                                Business Profile
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="md:col-span-2">
                                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Registered Business Name</label>
                                                    <input required type="text" value={profileForm.businessName} onChange={e => setProfileForm({...profileForm, businessName: e.target.value})} className="w-full bg-gray-50 border border-gray-100 text-gray-800 text-sm rounded-2xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 px-5 py-4 outline-none transition-all font-semibold" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">NIC / Business Registration ID</label>
                                                    <input required type="text" value={profileForm.nic} onChange={e => setProfileForm({...profileForm, nic: e.target.value})} className="w-full bg-gray-50 border border-gray-100 text-gray-800 text-sm rounded-2xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 px-5 py-4 outline-none transition-all font-semibold" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Years of Experience</label>
                                                    <input type="number" min="0" value={profileForm.experience} onChange={e => setProfileForm({...profileForm, experience: e.target.value})} className="w-full bg-gray-50 border border-gray-100 text-gray-800 text-sm rounded-2xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 px-5 py-4 outline-none transition-all font-semibold" />
                                                </div>
                                                <div className="md:col-span-2">
                                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Physical Business Address</label>
                                                    <input required type="text" value={profileForm.address} onChange={e => setProfileForm({...profileForm, address: e.target.value})} className="w-full bg-gray-50 border border-gray-100 text-gray-800 text-sm rounded-2xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 px-5 py-4 outline-none transition-all font-semibold" />
                                                </div>
                                                <div className="md:col-span-2">
                                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Business Description</label>
                                                    <textarea rows="4" value={profileForm.description} onChange={e => setProfileForm({...profileForm, description: e.target.value})} className="w-full bg-gray-50 border border-gray-100 text-gray-800 text-sm rounded-2xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 px-5 py-4 outline-none transition-all font-medium resize-none whitespace-pre-wrap" placeholder="Tell us about your campsite history..."></textarea>
                                                </div>
                                            </div>
                                        </section>

                                        <div className="pt-8 flex justify-end">
                                            <button 
                                                type="submit" 
                                                disabled={isUpdatingProfile}
                                                className="w-full px-12 py-4.5 bg-green-600 hover:bg-green-700 text-white font-black rounded-[1.25rem] transition-all shadow-[0_10px_25px_rgba(22,101,52,0.3)] hover:shadow-[0_15px_35px_rgba(22,101,52,0.4)] disabled:bg-gray-300 disabled:shadow-none flex items-center justify-center gap-3 active:scale-[0.98]"
                                            >
                                                {isUpdatingProfile ? (
                                                    <><div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div> Saving Updates...</>
                                                ) : (
                                                    <><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Save Profile Changes</>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CampsiteOwnerDashboard;
