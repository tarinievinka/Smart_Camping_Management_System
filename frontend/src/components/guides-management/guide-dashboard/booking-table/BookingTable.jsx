import React from "react";
import { useNavigate } from "react-router-dom";
import { Edit3, Trash2, CheckCircle, XCircle, Plus } from "lucide-react";
import axios from "axios";
import { useToast } from "../../../../context/ToastContext";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const BookingTable = ({ guides, onDelete }) => {
    const navigate = useNavigate();
    const { showToast } = useToast();

    const handleDelete = async (guide) => {
        if (!window.confirm(`Are you sure you want to delete ${guide.name}?`)) return;
        try {
            await axios.delete(`${API_URL}/api/guides/${guide._id}`);
            if (onDelete) onDelete(guide._id);
        } catch (err) {
            showToast("Failed to delete guide.", { variant: "error" });
            console.error(err);
        }
    };

    if (!guides || guides.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
                <p className="text-gray-400 text-sm">No guides found. Add your first guide to get started.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Header with Add Button */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">All Guides</h3>
                    <p className="text-sm text-gray-400">Manage your camping guide roster</p>
                </div>

                <button
                    onClick={() => navigate("/guides/add")}
                    className="inline-flex items-center gap-2 px-4 py-2 text-white text-sm font-semibold rounded-xl transition-all shadow-sm hover:shadow-md"
                    style={{ backgroundColor: '#166534' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#14532d'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#166534'}
                >
                    <Plus size={18} />
                    Add Guide
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-gray-50 text-left">
                            <th className="px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Guide</th>
                            <th className="px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Contact</th>
                            <th className="px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Experience</th>
                            <th className="px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Language</th>
                            <th className="px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {guides.map((guide) => (
                            <tr key={guide._id} className="hover:bg-gray-50 transition-colors">
                                {/* Guide Info */}
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                                            style={{ backgroundColor: 'rgba(22,101,52,0.1)', color: '#166534' }}
                                        >
                                            {guide.name?.charAt(0)?.toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{guide.name}</p>
                                            <p className="text-xs text-gray-400 truncate max-w-[180px]">{guide.description}</p>
                                        </div>
                                    </div>
                                </td>

                                {/* Contact */}
                                <td className="px-6 py-4">
                                    <p className="text-gray-700">{guide.email}</p>
                                    <p className="text-xs text-gray-400">{guide.phone}</p>
                                </td>

                                {/* Experience */}
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold">
                                        {guide.experience} {guide.experience === 1 ? "yr" : "yrs"}
                                    </span>
                                </td>

                                {/* Language */}
                                <td className="px-6 py-4 text-gray-700">{guide.language}</td>

                                {/* Status */}
                                <td className="px-6 py-4">
                                    <span
                                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                                            guide.availability
                                                ? "bg-red-50 text-red-500"
                                                : "bg-red-50 text-red-500"
                                        }`}
                                        style={guide.availability ? { backgroundColor: 'rgba(22,101,52,0.08)', color: '#166534' } : {}}
                                    >
                                        {guide.availability ? (
                                            <><CheckCircle size={12} /> Available</>
                                        ) : (
                                            <><XCircle size={12} /> Unavailable</>
                                        )}
                                    </span>
                                </td>

                                {/* Actions */}
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => navigate(`/guides/update/${guide._id}`)}
                                            className="p-2 rounded-lg transition-all"
                                            style={{ color: '#166534' }}
                                            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(22,101,52,0.08)'; e.currentTarget.style.color = '#14532d'; }}
                                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#166534'; }}
                                            title="Edit guide"
                                        >
                                            <Edit3 size={18} strokeWidth={2.5} />
                                        </button>

                                        <button
                                            onClick={() => handleDelete(guide)}
                                            className="p-2 rounded-lg transition-all"
                                            style={{ color: '#166534' }}
                                            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#fef2f2'; e.currentTarget.style.color = '#dc2626'; }}
                                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#166534'; }}
                                            title="Delete guide"
                                        >
                                            <Trash2 size={18} strokeWidth={2.5} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default BookingTable;