import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowRight, Home, RefreshCw, CheckCircle } from 'lucide-react';

const ForgotRequest = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setSubmitted(true);
            } else {
                setError(data.error || 'Something went wrong. Please try again.');
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

                {!submitted ? (
                    <>
                        {/* Icon */}
                        <div className="flex justify-center mb-5">
                            <div className="w-14 h-14 rounded-full bg-green-50 border-2 border-green-100 flex items-center justify-center">
                                <Mail size={24} className="text-green-500" />
                            </div>
                        </div>

                        {/* Title */}
                        <div className="text-center mb-7">
                            <h2 className="text-[24px] font-extrabold text-gray-900 mb-1">Forgot Password?</h2>
                            <p className="text-gray-400 text-[13px] leading-relaxed">
                                Enter the email address linked to your account and we'll send you a password reset link.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-500 text-xs px-4 py-2.5 rounded-lg font-medium">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-[11px] uppercase tracking-wider font-bold text-gray-700 mb-1.5">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                                        <Mail size={15} strokeWidth={1.5} />
                                    </span>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="name@example.com"
                                        required
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 bg-gray-50/60 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        Send Reset Link
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
                ) : (
                    /* ===== SUCCESS STATE ===== */
                    <div className="text-center py-4">
                        <div className="flex justify-center mb-5">
                            <div className="w-16 h-16 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center">
                                <CheckCircle size={30} className="text-green-500" />
                            </div>
                        </div>
                        <h2 className="text-[22px] font-extrabold text-gray-900 mb-2">Check your inbox!</h2>
                        <p className="text-gray-400 text-[13px] leading-relaxed mb-1">
                            If an account exists for <span className="font-semibold text-gray-700">{email}</span>, a password reset link has been sent.
                        </p>
                        <p className="text-gray-400 text-[12px] mb-7">
                            The link will expire in <span className="font-semibold text-gray-600">1 hour</span>.
                        </p>

                        <button
                            onClick={() => { setSubmitted(false); setEmail(''); }}
                            className="w-full border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold py-2.5 rounded-lg text-sm transition-all duration-200 mb-3"
                        >
                            Try a different email
                        </button>

                        <Link
                            to="/login"
                            className="block w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 rounded-lg text-sm text-center transition-all duration-200"
                        >
                            Back to Sign In
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ForgotRequest;
