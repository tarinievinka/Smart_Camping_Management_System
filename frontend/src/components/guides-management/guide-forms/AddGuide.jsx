import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Select from "react-select"; // Import react-select
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// Format options for react-select
const languageOptions = [
    { value: "English", label: "English" },
    { value: "Sinhala", label: "Sinhala" },
    { value: "Tamil", label: "Tamil" },
    { value: "French", label: "French" },
    { value: "German", label: "German" },
    { value: "Arabic", label: "Arabic" },
];

const AddGuide = () => {
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        experience: "",
        language: [], // Now stores the objects from react-select
        availability: true,
        description: "",
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
    };

    // Special handler for react-select
    const handleLanguageChange = (selectedOptions) => {
        setForm((prev) => ({
            ...prev,
            language: selectedOptions || [],
        }));
        if (errors.language) setErrors((prev) => ({ ...prev, language: null }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Validation...
        if (form.language.length === 0) {
            setErrors(prev => ({...prev, language: "Select at least one language"}));
            return;
        }

        try {
            setSubmitting(true);
            // Convert the array of objects back to a comma-separated string for the DB
            const languageString = form.language.map(lang => lang.value).join(", ");

            await axios.post(`${API_URL}/api/guides/add`, {
                ...form,
                experience: Number(form.experience),
                language: languageString, 
            });
            navigate("/guides/dashboard");
        } catch (err) {
            alert(err.response?.data?.error || "Failed to create guide");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header Section... */}
                
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
                    {/* Name, Email, Phone inputs... */}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Languages *</label>
                        <Select
                            isMulti
                            name="language"
                            options={languageOptions}
                            value={form.language}
                            onChange={handleLanguageChange}
                            className="basic-multi-select"
                            classNamePrefix="select"
                            placeholder="Select languages..."
                            styles={{
                                control: (base, state) => ({
                                    ...base,
                                    borderRadius: '0.75rem',
                                    padding: '2px',
                                    borderColor: errors.language ? '#fca5a5' : state.isFocused ? '#4ade80' : '#e5e7eb',
                                    boxShadow: state.isFocused ? '0 0 0 2px #f0fdf4' : 'none',
                                    '&:hover': { borderColor: '#4ade80' }
                                }),
                                multiValue: (base) => ({
                                    ...base,
                                    backgroundColor: '#f0fdf4',
                                    borderRadius: '0.5rem',
                                    color: '#166534'
                                }),
                                multiValueLabel: (base) => ({
                                    ...base,
                                    color: '#166534',
                                    fontWeight: '500'
                                })
                            }}
                        />
                        {errors.language && <p className="text-xs text-red-500 mt-1">{errors.language}</p>}
                    </div>

                    {/* Submit Button... */}
                </form>
            </div>
        </div>
    );
};

export default AddGuide;