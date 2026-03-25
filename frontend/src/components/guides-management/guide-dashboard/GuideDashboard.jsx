import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, UserCheck, Plus } from "lucide-react";
import axios from "axios";
import StatCard from "./stat-card/StatCard";
import BookingTable from "./booking-table/BookingTable";
import PerformanceChart from "./performance-chart/PerformanceChart";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const GuideDashboard = () => {
    const [guides, setGuides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const fetchGuides = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/api/guides/display`);
            setGuides(res.data);
            setError(null);
        } catch (err) {
            setError("Failed to load guides. Please make sure the backend is running.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGuides();
    }, []);

    const handleDelete = (id) => {
        setGuides((prev) => prev.filter((g) => g._id !== id));
    };

    const availableCount = guides.filter((g) => g.availability).length;

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
                    <p className="text-sm text-gray-400 font-medium">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Guide Dashboard</h1>
                        <p className="text-gray-500 text-sm mt-1">
                            Manage and monitor your camping guides
                        </p>
                    </div>
                    <button
                        onClick={() => navigate("/guides/add")}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl font-semibold text-sm hover:bg-green-700 shadow-sm hover:shadow-md transition-all"
                    >
                        <Plus size={16} /> Add Guide
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                        {error}
                    </div>
                )}

                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
                    <StatCard
                        title="Total Guides"
                        value={guides.length}
                        trend={guides.length > 0 ? `${guides.length} registered` : null}
                        icon={<Users size={24} />}
                        color="bg-blue-500"
                    />
                    <StatCard
                        title="Available"
                        value={availableCount}
                        trend={guides.length > 0 ? `${Math.round((availableCount / guides.length) * 100)}%` : null}
                        icon={<UserCheck size={24} />}
                        color="bg-green-500"
                    />
                </div>

                {/* Charts + Table */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <div className="lg:col-span-1">
                        <PerformanceChart guides={guides} />
                    </div>
                    <div className="lg:col-span-2">
                        <BookingTable guides={guides} onDelete={handleDelete} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GuideDashboard;
