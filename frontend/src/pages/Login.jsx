import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ArrowRight, Home, RefreshCw } from 'lucide-react';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const data = await login(email, password);
            alert('Login successful!');
            const from = location.state?.from;
            if (from) {
                navigate(from);
                return;
            }

            switch (data.role) {
                case 'admin': navigate('/admin'); break;
                case 'campsite-owner': navigate('/owner'); break;
                default: navigate('/campsites'); break;
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
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
            <div className="absolute inset-0 bg-black/35 z-0" />

            {/* Top-left brand badge */}
            <div className="absolute top-6 left-8 z-20 flex items-center gap-2.5">
                <div className="bg-green-600/80 p-2 rounded-lg text-white shadow-md">
                    <Home size={18} />
                </div>
                <span className="text-white text-lg font-bold tracking-tight drop-shadow-sm">
                    CampTrail 360
                </span>
            </div>

            {/* ===== LOGIN CARD ===== */}
            <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-xl px-8 py-10 relative z-10">

                {/* Title */}
                <div className="text-center mb-7">
                    <h2 className="text-[26px] font-extrabold italic text-gray-900 mb-1">Welcome Back</h2>
                    <p className="text-gray-400 text-[13px]">Please sign in to manage your campsites.</p>
                </div>

                {/* Google Button */}
                <button className="w-full flex items-center justify-center gap-2.5 py-2.5 mb-6 bg-white border border-gray-200 rounded-xl text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Log in with Google
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-gray-400">Or Email</span>
                    <div className="flex-1 h-px bg-gray-200" />
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-500 text-xs px-4 py-2.5 rounded-lg font-medium">
                            {error}
                        </div>
                    )}

                    {/* Email */}
                    <div>
                        <label className="block text-[11px] uppercase tracking-wider font-bold text-gray-700 mb-1.5">Email Address</label>
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

                    {/* Password */}
                    <div>
                        <div className="flex justify-between items-center mb-1.5">
                            <label className="block text-[11px] uppercase tracking-wider font-bold text-gray-700">Password</label>
                            <Link to="/login/forgot" className="text-[11px] text-green-600 font-bold hover:underline">Forgot password?</Link>
                        </div>
                        <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                                <Lock size={15} strokeWidth={1.5} />
                            </span>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50/60 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all tracking-widest placeholder:tracking-normal"
                            />
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                Signing In...
                            </>
                        ) : (
                            <>
                                Sign In
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </form>

                {/* Footer */}
                <p className="text-center text-[13px] text-gray-500 mt-7">
                    Don't have an account? <Link to="/register" state={{ from: location.state?.from }} className="text-green-600 font-bold hover:underline">Sign up</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
