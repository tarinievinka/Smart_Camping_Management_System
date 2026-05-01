import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Lock, ArrowRight, Home, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

const Forgot = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [resetToken, setResetToken] = useState('');
    const [success, setSuccess] = useState(false);
    const [tokenMissing, setTokenMissing] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        if (token) {
            setResetToken(token);
        } else {
            setTokenMissing(true);
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
            setError('Missing reset token. Please request a new password reset.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:5000/api/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: resetToken, newPassword }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(true);
            } else {
                setError(data.error || 'Failed to reset password. The link may have expired.');
            }
        } catch (err) {
            setError('Network error. Please check your connection and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="min-h-[85vh] flex items-center justify-center relative font-sans overflow-hidden"
            style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1541625602330-2277a4c46182?auto=format&fit=crop&q=80&w=2000')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/40 z-0" />

            {/* Top-left brand badge */}
            <div className="absolute top-6 left-8 z-20 flex items-center gap-2.5">
                <div
                    className="bg-green-600/80 p-2 rounded-lg text-white shadow-md cursor-pointer"
                    onClick={() => navigate('/')}
                >
                    <Home size={18} />
                </div>
                <span className="text-white text-lg font-bold tracking-tight drop-shadow-sm">
                    CampTrail 360
                </span>
            </div>

            {/* ===== CARD ===== */}
            <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-xl px-8 py-10 relative z-10">

                {/* TOKEN MISSING STATE */}
                {tokenMissing && (
                    <div className="text-center py-4">
                        <div className="flex justify-center mb-5">
                            <div className="w-16 h-16 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center">
                                <AlertCircle size={30} className="text-amber-500" />
                            </div>
                        </div>
                        <h2 className="text-[22px] font-extrabold text-gray-900 mb-2">Invalid Reset Link</h2>
                        <p className="text-gray-400 text-[13px] leading-relaxed mb-7">
                            This password reset link is invalid or missing. Please request a new one from the forgot password page.
                        </p>
                        <Link
                            to="/login/forgot-request"
                            className="block w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 rounded-lg text-sm text-center transition-all duration-200 mb-3"
                        >
                            Request New Reset Link
                        </Link>
                        <Link
                            to="/login"
                            className="block w-full border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold py-2.5 rounded-lg text-sm text-center transition-all duration-200"
                        >
                            Back to Sign In
                        </Link>
                    </div>
                )}

                {/* SUCCESS STATE */}
                {!tokenMissing && success && (
                    <div className="text-center py-4">
                        <div className="flex justify-center mb-5">
                            <div className="w-16 h-16 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center">
                                <CheckCircle size={30} className="text-green-500" />
                            </div>
                        </div>
                        <h2 className="text-[22px] font-extrabold text-gray-900 mb-2">Password Updated!</h2>
                        <p className="text-gray-400 text-[13px] leading-relaxed mb-7">
                            Your password has been reset successfully. You can now sign in with your new password.
                        </p>
                        <Link
                            to="/login"
                            className="block w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 rounded-lg text-sm text-center transition-all duration-200"
                        >
                            Back to Sign In
                        </Link>
                    </div>
                )}

                {/* FORM STATE */}
                {!tokenMissing && !success && (
                    <>
                        {/* Icon */}
                        <div className="flex justify-center mb-5">
                            <div className="w-14 h-14 rounded-full bg-green-50 border-2 border-green-100 flex items-center justify-center">
                                <Lock size={22} className="text-green-500" />
                            </div>
                        </div>

                        {/* Title */}
                        <div className="text-center mb-7">
                            <h2 className="text-[24px] font-extrabold text-gray-900 mb-1">Set New Password</h2>
                            <p className="text-gray-400 text-[13px]">
                                Choose a strong, new password for your account.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-500 text-xs px-4 py-2.5 rounded-lg font-medium">
                                    {error}
                                </div>
                            )}

                            {/* New Password */}
                            <div>
                                <label className="block text-[11px] uppercase tracking-wider font-bold text-gray-700 mb-1.5">
                                    New Password
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                                        <Lock size={15} strokeWidth={1.5} />
                                    </span>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Min. 6 characters"
                                        required
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 bg-gray-50/60 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all tracking-widest placeholder:tracking-normal"
                                    />
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-[11px] uppercase tracking-wider font-bold text-gray-700 mb-1.5">
                                    Confirm New Password
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                                        <Lock size={15} strokeWidth={1.5} />
                                    </span>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Re-enter your password"
                                        required
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 bg-gray-50/60 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all tracking-widest placeholder:tracking-normal"
                                    />
                                </div>
                                {/* Password match indicator */}
                                {confirmPassword && (
                                    <p className={`text-[11px] mt-1.5 font-medium ${newPassword === confirmPassword ? 'text-green-500' : 'text-red-400'}`}>
                                        {newPassword === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        Resetting...
                                    </>
                                ) : (
                                    <>
                                        Reset Password
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </form>

                        <p className="text-center text-[13px] text-gray-500 mt-7">
                            Remember your password?{' '}
                            <Link to="/login" className="text-green-600 font-bold hover:underline">
                                Sign in
                            </Link>
                        </p>
                    </>
                )}
            </div>
        </div>
    );
};

export default Forgot;