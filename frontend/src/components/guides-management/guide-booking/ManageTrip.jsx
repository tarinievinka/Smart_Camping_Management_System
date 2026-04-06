import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Calendar, MapPin, User, CreditCard, AlertTriangle, ArrowLeft, Phone, FileText } from 'lucide-react';
import { resolveMediaUrl } from '../../../utils/resolveMediaUrl';
import { getGuideDailyRate } from '../../../utils/guidePricing';
import { useToast } from '../../../context/ToastContext';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const ManageTrip = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [trip, setTrip] = useState(null);

    useEffect(() => {
        const fetchTrip = async () => {
            try {
                setLoading(true);
                const bookingsRes = await axios.get(`${API_URL}/api/guide-bookings/display`);
                const parsedBookings = bookingsRes.data || [];
                const myBooking = parsedBookings.find(b => b._id === id);

                if (!myBooking) {
                    setError("Trip not found");
                    setLoading(false);
                    return;
                }

                const guidesRes = await axios.get(`${API_URL}/api/guides/update/${myBooking.guideId}`);
                const guide = guidesRes.data;

                const s = new Date(myBooking.startDate || myBooking.bookedAt);
                const e = myBooking.endDate ? new Date(myBooking.endDate) : s;
                const totalDays = (!isNaN(s.getTime()) && !isNaN(e.getTime()) && e >= s)
                    ? Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1 : 1;

                const basePrice = getGuideDailyRate(guide);
                const correctedAmount = (basePrice * totalDays) + 12.50;
                const heroImage = resolveMediaUrl(guide?.coverPhoto) || resolveMediaUrl(guide?.profilePhoto);

                setTrip({
                    id: myBooking._id,
                    title: `Guided Trek with ${guide?.name?.split(' ')[0] || 'Local Expert'}`,
                    guideName: guide?.name || "Unknown Guide",
                    region: guide?.language ? guide.language.split(',')[0] + ' Region' : "Local Basecamp",
                    date: s,
                    endDate: e,
                    startTime: "06:00 AM",
                    amount: correctedAmount,
                    basePrice: basePrice,
                    totalDays: totalDays,
                    status: myBooking.status || "pending",
                    paymentStatus: "unpaid",
                    travelers: 1,
                    heroImage,
                    guideInitial: guide?.name?.charAt(0)?.toUpperCase() || "?",
                });
            } catch (err) {
                setError("Failed to load trip details");
            } finally {
                setLoading(false);
            }
        };
        fetchTrip();
    }, [id]);

    if (loading) return <div className="p-8 text-center text-gray-500 font-bold">Loading Trip...</div>;
    if (error) return <div className="p-8 text-center text-red-500 font-bold">{error}</div>;
    if (!trip) return null;

    const isPaid = trip.paymentStatus === "paid";

    const handleCancelTrip = async () => {
        if (!window.confirm("Are you sure you want to cancel this trip? This action cannot be undone.")) return;

        try {
            await axios.delete(`${API_URL}/api/guide-bookings/cancel/${trip.id}`);
            navigate('/guides/bookings');
        } catch (err) {
            console.error("Failed to cancel trip:", err);
            showToast("Failed to cancel trip. Please try again.", { variant: "error" });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => navigate('/guides/bookings')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition font-medium"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to My Bookings
                    </button>

                    <div className="flex items-center gap-3">
                        <span className={`px-5 py-1.5 rounded-full text-sm font-semibold uppercase tracking-wider
                            ${trip.status.toLowerCase() === 'pending' ? 'bg-amber-100 text-amber-700' : 'text-white'}`}
                            style={trip.status.toLowerCase() !== 'pending' ? { backgroundColor: '#166534', color: 'white' } : {}}>
                            {trip.status}
                        </span>
                        <h1 className="text-3xl font-bold text-gray-900">Manage Trip</h1>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Main Content - Left Side */}
                    <div className="lg:col-span-8 space-y-8">

                        {/* Trip Hero */}
                        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
                            <div className="relative h-80 bg-gradient-to-br from-green-800 to-green-950 flex items-center justify-center">
                                {trip.heroImage ? (
                                <img
                                    src={trip.heroImage}
                                    alt="Trip"
                                    className="w-full h-full object-cover absolute inset-0"
                                />
                                ) : (
                                <span className="text-white text-8xl font-bold opacity-90 z-[1]">{trip.guideInitial}</span>
                                )}
                                <div className="absolute top-6 right-6 z-10 px-6 py-2 bg-white/90 backdrop-blur rounded-full font-bold text-[11px] uppercase tracking-wider shadow-sm">
                                    {trip.status}
                                </div>
                            </div>

                            <div className="p-8">
                                <h2 className="text-3xl font-extrabold text-gray-900 mb-3">{trip.title}</h2>
                                <div className="flex items-center gap-2 font-semibold mb-8" style={{ color: '#166534' }}>
                                    <MapPin className="w-5 h-5" />
                                    <span>{trip.region}</span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <p className="text-[11px] uppercase font-bold tracking-widest text-[#A6B2CA] mb-1">Start Date</p>
                                        <p className="font-bold text-[15px] text-gray-900 mt-1">
                                            {new Date(trip.date).toLocaleDateString('en-US', {
                                                weekday: 'short',
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[11px] uppercase font-bold tracking-widest text-[#A6B2CA] mb-1">Start Time</p>
                                        <p className="font-bold text-[15px] text-gray-900 mt-1">{trip.startTime}</p>
                                    </div>
                                    <div>
                                        <p className="text-[11px] uppercase font-bold tracking-widest text-[#A6B2CA] mb-1">Guide</p>
                                        <p className="font-bold text-[15px] text-gray-900 mt-1">{trip.guideName}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Calendar View */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3 mb-6">
                                <Calendar className="w-6 h-6" style={{ color: '#166534' }} />
                                <h3 className="text-xl font-bold">Trip Date Range</h3>
                            </div>
                            <div className="bg-[#F4F5F7] border border-gray-200/60 rounded-2xl p-10 text-center">
                                <div className="mx-auto w-20 h-20 rounded-2xl flex items-center justify-center mb-5 shadow-sm" style={{ backgroundColor: 'rgba(22,101,52,0.1)' }}>
                                    <Calendar className="w-10 h-10" style={{ color: '#166534' }} />
                                </div>
                                <p className="text-3xl font-extrabold text-gray-900">
                                    {new Date(trip.date).toLocaleDateString('en-US', {
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                    {trip.totalDays > 1 && ` - ${new Date(trip.endDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long' })}`}
                                </p>
                                <p className="text-gray-500 font-medium mt-2">{trip.startTime} • {trip.totalDays} Day Trip</p>
                            </div>
                        </div>

                        {/* Cancellation Policy */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3 mb-6">
                                <AlertTriangle className="w-6 h-6 text-amber-500" />
                                <h3 className="text-xl font-bold">Cancellation Policy</h3>
                            </div>
                            <div className="space-y-6 text-gray-600">
                                <div className="flex gap-4 items-start">
                                    <div className="w-2.5 h-2.5 mt-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#166534' }}></div>
                                    <div>
                                        <p className="font-bold text-[15px] text-gray-900">More than 7 days before the trip</p>
                                        <p className="text-sm mt-1">Full refund minus 5% processing fee</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 items-start">
                                    <div className="w-2.5 h-2.5 mt-1.5 rounded-full bg-amber-500 flex-shrink-0"></div>
                                    <div>
                                        <p className="font-bold text-[15px] text-gray-900">Between 3 to 7 days before the trip</p>
                                        <p className="text-sm mt-1">50% refund</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 items-start">
                                    <div className="w-2.5 h-2.5 mt-1.5 rounded-full bg-red-500 flex-shrink-0"></div>
                                    <div>
                                        <p className="font-bold text-[15px] text-red-600">Less than 72 hours before the trip</p>
                                        <p className="text-sm mt-1">No refund</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-4 space-y-6">

                        {/* Summary Card */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 sticky top-6">
                            <h3 className="font-extrabold text-xl mb-6">Booking Summary</h3>

                            <div className="space-y-5 text-[15px]">
                                <div className="flex justify-between border-b border-gray-100 pb-4">
                                    <span className="text-gray-500 font-bold">Booking ID</span>
                                    <span className="font-mono text-sm font-bold text-gray-900">{trip.id.substring(trip.id.length - 8).toUpperCase()}</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-100 pb-4">
                                    <span className="text-gray-500 font-bold">Daily Rate</span>
                                    <span className="font-bold text-gray-900">LKR {trip.basePrice ? trip.basePrice.toLocaleString() : "..."} / day</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-100 pb-4">
                                    <span className="text-gray-500 font-bold">Duration</span>
                                    <span className="font-bold text-gray-900">{trip.totalDays} Day{trip.totalDays !== 1 ? 's' : ''}</span>
                                </div>
                                <div className="pt-2 flex justify-between text-lg">
                                    <span className="font-extrabold text-gray-900">Total Amount</span>
                                    <span className="font-bold" style={{ color: '#166534' }}>
                                        LKR {trip.amount.toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            {/* Pay Now Button */}
                            {!isPaid && (
                                <button className="mt-8 w-full bg-[#166534] hover:bg-[#14532d] transition-all text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 text-[15px] shadow-[0_4px_14px_0_rgba(0,0,0,0.2)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.23)] hover:-translate-y-0.5">
                                    <CreditCard className="w-5 h-5" />
                                    Pay Now
                                </button>
                            )}

                            {isPaid && (
                                <div className="mt-6 py-4 rounded-2xl text-center font-bold text-sm" style={{ backgroundColor: 'rgba(22,101,52,0.08)', color: '#166534' }}>
                                    ✓ Payment Completed Successfully
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-3">
                            <button onClick={handleCancelTrip} className="w-full py-4 bg-red-50 text-red-600 hover:bg-red-100 rounded-2xl font-bold text-[14px] transition-all flex justify-center items-center gap-2">
                                <AlertTriangle size={16} /> Cancel Trip
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageTrip;