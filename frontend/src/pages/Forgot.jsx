import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Lock, ArrowLeft, Home, LogIn, RefreshCw } from 'lucide-react';

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
            const response = await fetch('http://localhost:5000/api/auth/reset-password', {
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
            className="min-h-[90vh] flex items-center justify-center relative font-sans overflow-hidden p-6"
            style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1541625602330-2277a4c46182?auto=format&fit=crop&q=80&w=2000')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            {/* Background Overlay */}
            <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px] z-0" />

            {/* Top Left Floating Brand Label */}
            <div className="absolute top-10 left-10 z-20 flex items-center gap-3 animate-fade-in">
                <div className="bg-green-500/90 p-2.5 rounded-xl text-white shadow-lg backdrop-blur-md border border-white/20">
                    <Home size={22} />
                </div>
                <span className="text-white text-3xl font-black tracking-tight drop-shadow-md">
                    CampTrail 360
                </span>
            </div>

            <main className="w-full max-w-[460px] bg-white/95 backdrop-blur-3xl rounded-[40px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] p-10 sm:p-12 relative z-10 border border-white/40 transform hover:scale-[1.005] transition-all duration-500">
                <div className="text-center mb-10">
                    <h2 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">Reset Password</h2>
                    <p className="text-gray-400 text-sm font-medium">Verify and enter your new password below.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className={`bg-red-50 border border-red-100 text-red-500 text-xs px-4 py-3 rounded-2xl font-bold flex items-center gap-2 ${error.includes('Missing') ? '' : 'animate-shake'}`}>
                            <span className="text-lg">⚠</span> {error}
                        </div>
                    )}
                    
                    <div>
                        <label className="block text-[10px] uppercase tracking-widest font-black text-gray-400 mb-2 ml-1">New Password</label>
                        <div className="relative group/field">
                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-hover/field:text-green-500 transition-colors">
                                <Lock size={18} strokeWidth={1.5} />
                            </span>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                placeholder="Enter new password"
                                className="w-full pl-14 pr-6 py-4 border border-gray-100 rounded-2xl text-[15px] text-gray-800 placeholder-gray-300 bg-gray-50/50 focus:outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500/50 transition-all shadow-inner"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] uppercase tracking-widest font-black text-gray-400 mb-2 ml-1">Confirm New Password</label>
                        <div className="relative group/field">
                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-hover/field:text-green-500 transition-colors">
                                <Lock size={18} strokeWidth={1.5} />
                            </span>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                placeholder="Re-enter new password"
                                className="w-full pl-14 pr-6 py-4 border border-gray-100 rounded-2xl text-[15px] text-gray-800 placeholder-gray-300 bg-gray-50/50 focus:outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500/50 transition-all shadow-inner"
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={isLoading} 
                        className="w-full mt-10 bg-[#22c55e] hover:bg-green-600 text-white font-bold py-4 rounded-2xl text-[15px] flex items-center justify-center gap-3 transition-all duration-300 shadow-[0_12px_24px_-4px_rgba(34,197,94,0.4)] hover:shadow-[0_16px_32px_-4px_rgba(34,197,94,0.6)] transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                        {isLoading ? (
                            <>
                                <RefreshCw className="w-5 h-5 animate-spin" />
                                Resetting...
                            </>
                        ) : (
                            <>
                                Update Password
                                <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform rotate-180" />
                            </>
                        )}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-400 mt-10 font-bold">
                    <Link to="/login" className="text-green-500 font-black hover:underline flex items-center justify-center gap-2 uppercase tracking-tight">
                        <ArrowLeft size={16} /> Back to Sign In
                    </Link>
                </p>
            </main>
        </div>
    );
};

export default Forgot;
