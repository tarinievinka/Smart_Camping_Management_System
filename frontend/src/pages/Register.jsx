import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Phone, LogIn, Home, Briefcase, Users } from 'lucide-react';

const Register = () => {
    const [searchParams] = useSearchParams();
    const [roleTab, setRoleTab] = useState(searchParams.get('role') === 'owner' ? 'owner' : 'customer');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { register } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const apiRole = roleTab === 'owner' ? 'campsite-owner' : 'user';
            const user = await register(username, email, password, apiRole, phone);
            alert('Registration Successful!');
            
            // Redirect based on role
            if (user.role === 'campsite-owner') navigate('/owner');
            else navigate('/campsites');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. This email or username may already be in use.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div 
            className="min-h-screen flex items-center justify-center relative font-sans overflow-hidden p-6"
            style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1510672981848-a1c4f1cb5ccf?auto=format&fit=crop&q=80&w=2000')", // Night sky theme as in your image
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-0" />

            {/* Floating Brand Label */}
            <div className="absolute top-10 left-10 z-20 hidden md:flex items-center gap-3">
                <div className="bg-green-500/90 p-2.5 rounded-xl text-white shadow-lg backdrop-blur-md border border-white/20">
                    <Home size={22} />
                </div>
                <span className="text-white text-3xl font-black tracking-tight drop-shadow-md">
                    CampTrail 360
                </span>
            </div>

            <main className="w-full max-w-[900px] flex rounded-[40px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] overflow-hidden bg-white/95 backdrop-blur-3xl relative z-10 border border-white/40 transform hover:scale-[1.002] transition-all duration-500">
                
                {/* Left Side: Illustration / Brand (matches your image logic) */}
                <div className="hidden md:flex flex-1 relative bg-[#166534]">
                    <img 
                        src="https://images.pexels.com/photos/2666598/pexels-photo-2666598.jpeg?auto=compress&cs=tinysrgb&w=1200" 
                        className="absolute inset-0 w-full h-full object-cover opacity-60"
                        alt="Pine Ridge"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-10 left-10 text-white">
                        <div className="text-4xl mb-2 text-green-400">🌲</div>
                        <h2 className="text-4xl font-black mb-1">Pine Ridge</h2>
                        <p className="text-white/70 text-sm font-bold tracking-tight">List & Manage Your Campsites</p>
                    </div>
                </div>

                {/* Right Side: Register Form */}
                <div className="flex-1 p-8 sm:p-12 overflow-y-auto max-h-[90vh]">
                    <div className="mb-8">
                        <div className="flex bg-gray-100/50 p-1 rounded-2xl mb-8 gap-1">
                            <button 
                                onClick={() => { setRoleTab('customer'); setError(''); }}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black transition-all ${roleTab === 'customer' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <Users size={16} /> Customer
                            </button>
                            <button 
                                onClick={() => { setRoleTab('owner'); setError(''); }}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black transition-all ${roleTab === 'owner' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <Briefcase size={16} /> Campsite Owner
                            </button>
                        </div>

                        <h2 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
                            {roleTab === 'owner' ? 'Register as Owner' : 'Create Account'}
                        </h2>
                        <p className="text-gray-400 text-sm font-medium">
                            {roleTab === 'owner' ? 'Start listing your campsites today' : 'Begin your camping adventure'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-50 border border-red-100 text-red-500 text-xs px-4 py-3 rounded-2xl font-bold flex items-center gap-2 animate-shake">
                                ⚠ {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="group">
                                <label className="block text-[10px] uppercase tracking-widest font-black text-gray-400 mb-2 ml-1">Username</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300">
                                        <User size={16} />
                                    </span>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="Username"
                                        required
                                        className="w-full pl-11 pr-4 py-3.5 border border-gray-100 rounded-2xl text-[14px] bg-gray-50/50 focus:outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500/50 transition-all font-medium"
                                    />
                                </div>
                            </div>
                            <div className="group">
                                <label className="block text-[10px] uppercase tracking-widest font-black text-gray-400 mb-2 ml-1">Phone Number</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300">
                                        <Phone size={16} />
                                    </span>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="0123456789"
                                        className="w-full pl-11 pr-4 py-3.5 border border-gray-100 rounded-2xl text-[14px] bg-gray-50/50 focus:outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500/50 transition-all font-medium"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="group">
                            <label className="block text-[10px] uppercase tracking-widest font-black text-gray-400 mb-2 ml-1">Email Address</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300">
                                    <Mail size={16} />
                                </span>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    required
                                    className="w-full pl-11 pr-4 py-3.5 border border-gray-100 rounded-2xl text-[14px] bg-gray-50/50 focus:outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500/50 transition-all font-medium"
                                />
                            </div>
                        </div>

                        <div className="group">
                            <label className="block text-[10px] uppercase tracking-widest font-black text-gray-400 mb-2 ml-1">Password</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300">
                                    <Lock size={16} />
                                </span>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full pl-11 pr-4 py-3.5 border border-gray-100 rounded-2xl text-[14px] bg-gray-50/50 focus:outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500/50 transition-all tracking-widest font-medium"
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isLoading} 
                            className="w-full mt-6 bg-[#166534] hover:bg-green-800 text-white font-black py-4 rounded-2xl text-[15px] flex items-center justify-center gap-3 transition-all duration-300 shadow-[0_12px_24px_-4px_rgba(22,101,52,0.4)] transform hover:-translate-y-1 disabled:opacity-50"
                        >
                            {isLoading ? 'Creating Account...' : (roleTab === 'owner' ? 'Register as Owner' : 'Create Account')}
                            {!isLoading && <LogIn size={20} />}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-400 mt-8 font-bold">
                        Already have an account? <Link to="/login" className="text-green-600 font-black hover:underline underline-offset-4">Sign in here</Link>
                    </p>
                </div>
            </main>
        </div>
    );
};

export default Register;
