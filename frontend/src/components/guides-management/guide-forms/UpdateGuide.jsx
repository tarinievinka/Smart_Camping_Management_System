import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import axios from "axios";
import { useToast } from "../../../context/ToastContext";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";


const UpdateGuide = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [form, setForm] = useState({ name: "", email: "", phone: "", experience: "", nic: "", age: "", availability: true, description: "" });

    useEffect(() => {
        const fetchGuide = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/guides/update/${id}`);
                const g = res.data;
                setForm({
                    ...g,
                    experience: g.experience ?? "",
                    nic: g.nic || "",
                    age: g.age || "",
                });
            } catch (err) {
                showToast("Failed to load guide details.", { variant: "error" });
                navigate("/guides/dashboard");
            } finally {
                setLoading(false);
            }
        };
        fetchGuide();
    }, [id, navigate, showToast]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
    };

    const validate = () => {
        const errs = {};
        if (!form.name?.trim()) errs.name = "Name is required";
        const emailRegex = /^[^\s@]{2,}@[^\s@.]{2,}\.[^\s@.]{2,}$/;
        if (!form.email?.trim()) {
            errs.email = "Email is required";
        } else if (!emailRegex.test(form.email.trim())) {
            errs.email = "Invalid email — use format: name@domain.com (each part min 2 chars)";
        }
        if (!form.phone?.trim()) {
            errs.phone = "Phone is required";
        } else if (!/^\d{10}$/.test(form.phone.trim())) {
            errs.phone = "Phone must be exactly 10 digits";
        }
        if (form.experience === "" || form.experience === null) {
            errs.experience = "Experience is required";
        } else if (Number(form.experience) < 0) {
            errs.experience = "Experience cannot be negative";
        }
        if (!form.nic?.trim()) errs.nic = "NIC is required";
        if (form.age === "" || form.age === null) {
            errs.age = "Age is required";
        } else if (Number(form.age) < 18) {
            errs.age = "Guide must be at least 18 years old";
        }
        return errs;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }
        try {
            setSubmitting(true);
            await axios.put(`${API_URL}/api/guides/update/${id}`, {
                ...form,
                experience: Number(form.experience),
                age: Number(form.age),
            });
            navigate("/guides/dashboard");
        } catch (err) {
            showToast(err.response?.data?.error || "Failed to update guide", { variant: "error" });
        } finally {
            setSubmitting(false);
        }
    };

    const inputClasses = (field) =>
        `w-full px-4 py-3 rounded-xl border text-sm transition-all outline-none ${errors[field] ? "border-red-300 bg-red-50" : "border-gray-200"}`;

    const inputFocusStyle = {
        borderColor: '#166534',
        boxShadow: '0 0 0 2px rgba(22,101,52,0.1)',
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="animate-spin" size={32} style={{ color: '#166534' }} />
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => navigate(-1)} className="p-2 rounded-xl border border-gray-200 hover:bg-white transition-colors">
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Update Guide</h1>
                        <p className="text-sm text-gray-500">Edit an existing guide's details</p>
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
                        <input
                            name="name" value={form.name} onChange={handleChange}
                            className={inputClasses("name")} placeholder="e.g. Nimal Perera"
                            onFocus={e => { if (!errors.name) Object.assign(e.target.style, inputFocusStyle); }}
                            onBlur={e => { e.target.style.borderColor = ''; e.target.style.boxShadow = ''; }}
                        />
                        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address *</label>
                        <input
                            name="email" type="text" value={form.email} onChange={handleChange}
                            className={inputClasses("email")} placeholder="e.g. nimal@gmail.com" autoComplete="email"
                            onFocus={e => { if (!errors.email) Object.assign(e.target.style, inputFocusStyle); }}
                            onBlur={e => { e.target.style.borderColor = ''; e.target.style.boxShadow = ''; }}
                        />
                        {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone *</label>
                            <input
                                name="phone" value={form.phone} onChange={handleChange}
                                className={inputClasses("phone")} placeholder="0712345678" maxLength={10}
                                onFocus={e => { if (!errors.phone) Object.assign(e.target.style, inputFocusStyle); }}
                                onBlur={e => { e.target.style.borderColor = ''; e.target.style.boxShadow = ''; }}
                            />
                            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Experience (years) *</label>
                            <input
                                name="experience" type="number" min="0" value={form.experience} onChange={handleChange}
                                className={inputClasses("experience")} placeholder="5"
                                onFocus={e => { if (!errors.experience) Object.assign(e.target.style, inputFocusStyle); }}
                                onBlur={e => { e.target.style.borderColor = ''; e.target.style.boxShadow = ''; }}
                            />
                            {errors.experience && <p className="text-xs text-red-500 mt-1">{errors.experience}</p>}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">NIC Number *</label>
                            <input
                                name="nic" value={form.nic} onChange={handleChange}
                                className={inputClasses("nic")} placeholder="e.g. 199012345678"
                                onFocus={e => { if (!errors.nic) Object.assign(e.target.style, inputFocusStyle); }}
                                onBlur={e => { e.target.style.borderColor = ''; e.target.style.boxShadow = ''; }}
                            />
                            {errors.nic && <p className="text-xs text-red-500 mt-1">{errors.nic}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Age *</label>
                            <input
                                name="age" type="number" min="18" value={form.age} onChange={handleChange}
                                className={inputClasses("age")} placeholder="25"
                                onFocus={e => { if (!errors.age) Object.assign(e.target.style, inputFocusStyle); }}
                                onBlur={e => { e.target.style.borderColor = ''; e.target.style.boxShadow = ''; }}
                            />
                            {errors.age && <p className="text-xs text-red-500 mt-1">{errors.age}</p>}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox" name="availability" checked={!!form.availability} onChange={handleChange}
                            className="w-4 h-4 border-gray-300 rounded"
                            style={{ accentColor: '#166534' }}
                        />
                        <label className="text-sm font-medium text-gray-700">Available for hire</label>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                        <textarea
                            name="description" value={form.description || ""} onChange={handleChange} rows="3"
                            className={inputClasses("description")} placeholder="Expertise and background..."
                            onFocus={e => Object.assign(e.target.style, inputFocusStyle)}
                            onBlur={e => { e.target.style.borderColor = ''; e.target.style.boxShadow = ''; }}
                        />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button
                            type="submit" disabled={submitting}
                            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 text-white rounded-xl font-semibold text-sm disabled:opacity-50 transition-colors"
                            style={{ backgroundColor: '#166534' }}
                            onMouseEnter={e => { if (!submitting) e.currentTarget.style.backgroundColor = '#14532d'; }}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#166534'}
                        >
                            {submitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            {submitting ? "Updating..." : "Update Guide"}
                        </button>
                        <button type="button" onClick={() => navigate(-1)} className="px-5 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UpdateGuide;