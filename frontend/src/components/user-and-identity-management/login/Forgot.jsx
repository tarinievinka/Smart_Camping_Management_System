import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';

const Forgot = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [resetToken, setResetToken] = useState('');

    useEffect(() => {
        // Get token from URL query parameter
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        if (token) {
            setResetToken(token);
        } else {
            setError('Missing reset token. Please request a password reset.');
        }
    }, [location.search]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        
        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        if (!resetToken) {
            setError('Missing reset token');
            return;
        }
        
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:5000/api/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token: resetToken,
                    newPassword: newPassword,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                alert('Password reset successfully! Please login with your new password.');
                navigate('/login');
            } else {
                setError(data.error || 'Failed to reset password');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div 
            className="min-h-screen flex flex-col relative font-sans overflow-hidden"
            style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1541625602330-2277a4c46182?auto=format&fit=crop&q=80&w=2000')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            {/* Overlay to ensure text readability */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-0" />

            {/* Transparent Header */}
            <header className="w-full relative z-10 p-6">
                <div
                    className="flex items-center gap-3 w-fit group cursor-pointer transition-transform duration-500 hover:scale-105"
                    onClick={() => navigate('/')}
                >
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-green-500 to-emerald-400 flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.4)] group-hover:shadow-[0_0_40px_rgba(34,197,94,0.8)] group-hover:-translate-y-1 transition-all duration-300">
                        <svg className="w-6 h-6 text-white animate-pulse group-hover:animate-none group-hover:scale-110 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                    </div>
                    <span className="text-white font-extrabold text-2xl tracking-tight drop-shadow-2xl group-hover:tracking-wider transition-all duration-500">
                        Smart Camping
                    </span>
                </div>
            </header>

            <main className="flex-1 flex items-center justify-center p-4 relative z-10 pb-20">
                <div className="w-full max-w-[420px] bg-white/95 backdrop-blur-2xl rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] p-8 sm:p-10 border border-white/20 transform hover:scale-[1.01] transition-all duration-500">
                    <div className="mb-8 text-center">
                        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Reset Password</h2>
                        <p className="text-gray-500 text-sm">
                            Enter your new password below
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
                                {error}
                            </div>
                        )}
                        
                        <div>
                            <label className="block text-[11px] uppercase tracking-wide text-gray-700 mb-1">New Password</label>
                            <div className="relative mb-2">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </span>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    placeholder="Enter new password"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-green-500 transition shadow-inner"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[11px] uppercase tracking-wide text-gray-700 mb-1">Reenter New Password</label>
                            <div className="relative mb-2">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </span>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    placeholder="Confirm new password"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-green-500 transition shadow-inner"
                                />
                            </div>
                        </div>

                        <button type="submit" disabled={isLoading} className="w-full mt-6 bg-[#10a110] hover:bg-green-700 text-white py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 transition-all duration-300 shadow-[0_0_15px_rgba(16,161,16,0.3)] hover:shadow-[0_0_20px_rgba(16,161,16,0.5)] transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed">
                            {isLoading ? 'Resetting...' : 'Reset Password'}
                            {!isLoading && (
                                <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-xs text-gray-600 mt-8 font-medium">
                        Remember your password? <Link to="/login" className="text-[#10a110] font-bold hover:underline">Sign in</Link>
                    </p>
                </div>
            </main>
        </div>
    );
};

export default Forgot;