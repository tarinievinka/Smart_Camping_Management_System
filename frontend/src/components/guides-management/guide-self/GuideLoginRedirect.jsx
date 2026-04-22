import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { setGuideSessionAfterLogin, GUIDE_SELF_DASHBOARD_PATH } from './guideSession';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const GuideLoginRedirect = () => {
    const navigate = useNavigate();
    const [error, setError] = useState('');

    useEffect(() => {
        const initializeSession = async () => {
            try {
                const storedInfo = localStorage.getItem('userInfo');
                if (!storedInfo) {
                    navigate('/login');
                    return;
                }

                const userInfo = JSON.parse(storedInfo);
                if (userInfo.role !== 'guide') {
                    navigate('/'); // Not a guide, fallback
                    return;
                }

                // We need to fetch the guide _id matching the logged in user's email
                const response = await axios.get(`${API_URL}/api/guides/display`);
                const allGuides = response.data;
                const match = allGuides.find(g => g.email === userInfo.email);

                if (match) {
                    // Initialize the session using the matched guide ID
                    setGuideSessionAfterLogin({ guideId: match._id, role: 'guide' });
                    navigate(GUIDE_SELF_DASHBOARD_PATH);
                } else {
                    setError('Guide profile not found. Please ensure your application has been processed by an admin.');
                }
            } catch (err) {
                console.error("Error setting up guide session:", err);
                setError('Failed to load guide dashboard. Please try again.');
            }
        };

        initializeSession();
    }, [navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
            <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md w-full">
                {error ? (
                    <>
                        <h2 className="text-xl font-bold text-red-600 mb-4">Access Denied</h2>
                        <p className="text-gray-600 mb-6">{error}</p>
                        <button 
                            onClick={() => navigate('/')}
                            className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl transition-colors"
                        >
                            Return to Home
                        </button>
                    </>
                ) : (
                    <>
                        <div className="animate-spin w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Setting up your dashboard...</h2>
                        <p className="text-gray-500 text-sm">Please wait while we load your guide profile.</p>
                    </>
                )}
            </div>
        </div>
    );
};

export default GuideLoginRedirect;
