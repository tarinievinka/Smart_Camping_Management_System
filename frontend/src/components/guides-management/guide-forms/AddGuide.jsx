import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import axios from "axios";
import { useToast } from "../../../context/ToastContext";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const LANGUAGES = ["English", "Sinhala", "Tamil", "French", "German", "Arabic", "Hindi", "Urdu", "Chinese", "Japanese", "Korean", "Russian", "Spanish", "Italian"];

const AddGuide = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        experience: "",
        language: [],
        availability: true,
        description: "",
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name === "language") {
            setForm((prev) => {
                const current = [...prev.language];
                if (checked) return { ...prev, language: [...current, value] };
                return { ...prev, language: current.filter((l) => l !== value) };
            });
        } else {
            setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
        }
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
    };

    const validate = () => {
        const errs = {};
        if (!form.name.trim()) errs.name = "Name is required";
        const emailRegex = /^[^\s@]{2,}@[^\s@.]{2,}\.[^\s@.]{2,}$/;
        if (!form.email.trim()) {
            errs.email = "Email is required";
        } else if (!emailRegex.test(form.email.trim())) {
            errs.email = "Invalid email — use format: name@domain.com (each part min 2 chars)";
        }
        if (!form.phone.trim()) {
            errs.phone = "Phone is required";
        } else if (!/^\d{10}$/.test(form.phone.trim())) {
            errs.phone = "Phone must be exactly 10 digits";
        }
        if (form.experience === "" || form.experience === null) {
            errs.experience = "Experience is required";
        } else if (Number(form.experience) < 0) {
            errs.experience = "Experience cannot be negative";
        }
        if (form.language.length === 0) errs.language = "Select at least one language";
        return errs;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }
        try {
            setSubmitting(true);
            await axios.post(`${API_URL}/api/guides/add`, {
                ...form,
                experience: Number(form.experience),
                language: form.language.join(", "),
            });
            navigate("/guides/dashboard");
        } catch (err) {
            showToast(err.response?.data?.error || "Failed to create guide", { variant: "error" });
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

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => navigate(-1)} className="p-2 rounded-xl border border-gray-200 hover:bg-white transition-colors">
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Add New Guide</h1>
                        <p className="text-sm text-gray-500">Register a new guide to the system</p>
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
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Languages *</label>
                        <div className={`p-4 rounded-xl border grid grid-cols-2 gap-3 ${errors.language ? "border-red-200 bg-red-50" : "border-gray-100 bg-gray-50/50"}`}>
                            {LANGUAGES.map((lang) => (
                                <label key={lang} className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox" name="language" value={lang}
                                        checked={form.language.includes(lang)} onChange={handleChange}
                                        className="w-4 h-4 border-gray-300 rounded cursor-pointer"
                                        style={{ accentColor: '#166534' }}
                                    />
                                    <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">{lang}</span>
                                </label>
                            ))}
                        </div>
                        {errors.language && <p className="text-xs text-red-500 mt-1">{errors.language}</p>}
                    </div>
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox" name="availability" checked={form.availability} onChange={handleChange}
                            className="w-4 h-4 border-gray-300 rounded"
                            style={{ accentColor: '#166534' }}
                        />
                        <label className="text-sm font-medium text-gray-700">Available for hire</label>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                        <textarea
                            name="description" value={form.description} onChange={handleChange} rows="3"
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
                            {submitting ? "Saving..." : "Add Guide"}
                        </button>
                        <button type="button" onClick={() => navigate(-1)} className="px-5 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddGuide;