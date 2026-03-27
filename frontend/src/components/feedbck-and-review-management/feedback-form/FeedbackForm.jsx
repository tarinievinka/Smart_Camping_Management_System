

import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Star, MapPin, User, Backpack, AlertCircle, Upload, X, Image as ImageIcon } from "lucide-react";

const starLabels = ["Terrible", "Bad", "Okay", "Good", "Very Good"];

const FeedbackForm = () => {
    const [selectedReview, setSelectedReview] = useState("");
    const [userName, setUserName] = useState("Nethmi User");
    const [locationName, setLocationName] = useState("");
    const [sessionStartDate, setSessionStartDate] = useState("");
    const [sessionEndDate, setSessionEndDate] = useState("");
    const [rating, setRating] = useState(4);
    const [hover, setHover] = useState(null);
    const [reviewText, setReviewText] = useState("");
    const [imageFiles, setImageFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
    const nameFieldConfig = {
        campsite: { label: "Location Name", placeholder: "e.g., Pine Valley Campground" },
        guide: { label: "Guider Name", placeholder: "e.g., Mountain Adventures - John Smith" },
        equipment: { label: "Equipment Name", placeholder: "e.g., Alpine Pro Backpack 65L" },
    };
    const activeNameField = nameFieldConfig[selectedReview] || nameFieldConfig.campsite;

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = {};

        if (!selectedReview) {
            newErrors.selectedReview = "Please select what you are reviewing.";
        }
        if (!locationName.trim()) {
            newErrors.locationName = "Location or item name is required.";
        }

        if (!sessionStartDate) {
            newErrors.sessionStartDate = "Please select the start date of your session.";
        }

        if (!sessionEndDate) {
            newErrors.sessionEndDate = "Please select the end date of your session.";
        }

        if (sessionStartDate && sessionEndDate) {
            const startDate = new Date(sessionStartDate);
            const endDate = new Date(sessionEndDate);
            const today = new Date();
            if (startDate > today) {
                newErrors.sessionStartDate = "Session start date cannot be in the future.";
            }
            if (endDate > today) {
                newErrors.sessionEndDate = "Session end date cannot be in the future.";
            }
            if (endDate < startDate) {
                newErrors.sessionEndDate = "Session end date cannot be before start date.";
            }
        }

        if (!reviewText.trim()) {
            newErrors.reviewText = "Review text is required.";
        } else if (reviewText.trim().length < 10) {
            newErrors.reviewText = "Review must be at least 10 characters long.";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});

        const formData = new FormData();
        formData.append("userId", "507f1f77bcf86cd799439011");
        formData.append("userName", userName.trim());
        formData.append("targetType", selectedReview.charAt(0).toUpperCase() + selectedReview.slice(1));
        formData.append("targetId", "507f1f77bcf86cd799439012");
        formData.append("targetName", locationName.trim());
        formData.append("title", `${selectedReview.charAt(0).toUpperCase() + selectedReview.slice(1)} Review`);
        formData.append("sessionDate", sessionStartDate);
        formData.append("sessionEndDate", sessionEndDate);
        formData.append("rating", rating);
        formData.append("comment", reviewText);

        imageFiles.forEach(file => {
            formData.append("images", file);
        });

        const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";

        try {
            const response = await axios.post(`${apiUrl}/api/feedback/add`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            console.log("Feedback submitted:", response.data);
            alert("Review submitted successfully!");

            // Reset form
            setSelectedReview("");
            setUserName("");
            setLocationName("");
            setSessionStartDate("");
            setSessionEndDate("");
            setRating(4);
            setReviewText("");
            setImageFiles([]);
            setImagePreviews([]);
            setErrors({});
            navigate("/my-reviews");
        } catch (error) {
            console.error("Error submitting feedback:", error);

            let message = "Failed to submit review. Please try again.";
            let details = "";

            if (error.response) {
                message = error.response.data.error || message;
                details = error.response.data.details ? `\nDetails: ${JSON.stringify(error.response.data.details)}` : "";
            } else if (error.request) {
                message = "No response from server. Is the backend running at port 5000?";
            } else {
                message = error.message;
            }

            alert(`${message}${details}`);
        }
    };

    return (
        <div className="w-full py-10 px-4 sm:px-6 lg:px-8 flex flex-col items-center font-sans bg-white">
            <div className="w-full max-w-3xl">
                <div className="mb-6 pl-1">
                    <h2 className="text-4xl font-extrabold text-slate-900 mb-2">Submit a Review</h2>
                    <p className="text-slate-500 text-lg">Share your experience to help fellow campers</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6">
                        <label className="text-xl font-bold text-slate-900 block mb-4">What are you reviewing?</label>
                        <div className="space-y-3">
                            {[
                                { id: "campsite", title: "Camping Location", desc: "Campgrounds, parks, and sites", Icon: MapPin, color: "text-green-600" },
                                { id: "guide", title: "Guide", desc: "Tour guides, instructors, and experts", Icon: User, color: "text-blue-600" },
                                { id: "equipment", title: "Camping Equipment", desc: "Gear, tools, and supplies", Icon: Backpack, color: "text-orange-500" },
                            ].map(({ id, title, desc, Icon, color }) => (
                                <button
                                    key={id}
                                    type="button"
                                    aria-pressed={selectedReview === id}
                                    onClick={() => {
                                        setSelectedReview(id);
                                        if (errors.selectedReview) setErrors({ ...errors, selectedReview: "" });
                                    }}
                                    className={`w-full text-left border rounded-xl px-4 py-3 flex items-center gap-3 transition-colors cursor-pointer ${
                                        selectedReview === id ? "border-slate-900 bg-slate-50 ring-1 ring-slate-900" : "border-slate-200 hover:bg-slate-50"
                                    }`}
                                >
                                    <span className={`w-3 h-3 rounded-full border flex items-center justify-center ${selectedReview === id ? "border-black" : "border-slate-300"}`}>
                                        {selectedReview === id && <span className="w-1.5 h-1.5 rounded-full bg-black" />}
                                    </span>
                                    <Icon size={18} className={color} />
                                    <div>
                                        <p className="text-slate-900 font-semibold text-[15px] leading-tight">{title}</p>
                                        <p className="text-slate-500 text-sm">{desc}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                        {errors.selectedReview && (
                            <div className="text-red-500 text-sm mt-2 font-medium flex items-center gap-1.5">
                                <AlertCircle size={14} />
                                {errors.selectedReview}
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-4">
                        <div className="mb-4">
                            <label className="text-sm font-semibold text-slate-900 mb-2 block">
                                Reviewing As
                            </label>
                            <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
                                <div className="w-8 h-8 rounded-full bg-green-700 text-white flex items-center justify-center font-bold text-sm shadow-inner shrink-0">
                                    {userName ? userName.charAt(0).toUpperCase() : "U"}
                                </div>
                                <div>
                                    <p className="text-slate-900 font-bold text-sm leading-tight">{userName || "Anonymous User"}</p>
                                    <p className="text-slate-500 text-xs font-medium">Verified Profile</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-slate-900 mb-1 block">
                                {activeNameField.label} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={locationName}
                                onChange={(e) => {
                                    setLocationName(e.target.value);
                                    if (errors.locationName) setErrors({ ...errors, locationName: "" });
                                }}
                                placeholder={activeNameField.placeholder}
                                className={`w-full bg-slate-50 border ${errors.locationName ? "border-red-400" : "border-slate-200"} rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400`}
                            />
                            {errors.locationName && (
                                <div className="text-red-500 text-sm mt-1 font-medium flex items-center gap-1.5">
                                    <AlertCircle size={14} />
                                    {errors.locationName}
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-slate-900 mb-1 block">
                                Rating <span className="text-red-500">*</span>
                            </label>
                            <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        type="button"
                                        key={star}
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHover(star)}
                                        onMouseLeave={() => setHover(null)}
                                        className="focus:outline-none p-0.5"
                                    >
                                        <Star
                                            size={30}
                                            strokeWidth={1.7}
                                            className={`${(hover || rating) >= star ? "fill-green-600 text-green-600" : "fill-transparent text-slate-300"} transition-colors`}
                                        />
                                    </button>
                                ))}
                                <span className="ml-2 text-sm font-medium text-slate-500">{starLabels[(hover || rating) - 1]}</span>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-slate-900 mb-1 block">
                                Your Review <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={reviewText}
                                onChange={(e) => {
                                    setReviewText(e.target.value);
                                    if (errors.reviewText) setErrors({ ...errors, reviewText: "" });
                                }}
                                placeholder="Share your detailed experience..."
                                rows={4}
                                className={`w-full bg-slate-50 border ${errors.reviewText ? "border-red-400" : "border-slate-200"} text-slate-800 placeholder-slate-400 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 resize-y`}
                            />
                            <p className="text-xs text-slate-400 mt-1">Minimum 10 characters ({reviewText.trim().length}/10)</p>
                            {errors.reviewText && (
                                <div className="text-red-500 text-sm mt-1 font-medium flex items-center gap-1.5">
                                    <AlertCircle size={14} />
                                    {errors.reviewText}
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-slate-900 mb-1 block">
                                Add Photos (Optional)
                            </label>
                            <p className="text-xs text-slate-500 mb-3">Include up to 5 photos to help others see your experience</p>
                            
                            {imagePreviews.length === 0 ? (
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Upload className="w-8 h-8 mb-2 text-slate-400" />
                                        <p className="mb-1 text-sm text-slate-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                        <p className="text-xs text-slate-400">SVG, PNG, JPG or GIF (MAX. 5MB)</p>
                                    </div>
                                    <input 
                                        type="file" 
                                        className="hidden" 
                                        accept="image/*"
                                        multiple
                                        onChange={(e) => {
                                            const files = Array.from(e.target.files).slice(0, 5);
                                            if (files.length) {
                                                setImageFiles(files);
                                                setImagePreviews(files.map(file => URL.createObjectURL(file)));
                                            }
                                        }}
                                    />
                                </label>
                            ) : (
                                <div className="space-y-3">
                                    <div className="flex flex-wrap gap-3">
                                        {imagePreviews.map((preview, idx) => (
                                            <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border border-slate-200">
                                                <img src={preview} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newFiles = [...imageFiles];
                                                        newFiles.splice(idx, 1);
                                                        setImageFiles(newFiles);
                                                        
                                                        const newPreviews = [...imagePreviews];
                                                        newPreviews.splice(idx, 1);
                                                        setImagePreviews(newPreviews);
                                                    }}
                                                    className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-black/80 rounded-full text-white transition-colors"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ))}
                                        
                                        {imagePreviews.length < 5 && (
                                            <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                                                <Upload className="w-6 h-6 mb-1 text-slate-400" />
                                                <span className="text-xs text-slate-500 font-semibold text-center leading-tight">Add<br/>More</span>
                                                <input 
                                                    type="file" 
                                                    className="hidden" 
                                                    accept="image/*"
                                                    multiple
                                                    onChange={(e) => {
                                                        const files = Array.from(e.target.files);
                                                        const remaining = 5 - imageFiles.length;
                                                        const newFiles = files.slice(0, remaining);
                                                        if (newFiles.length) {
                                                            setImageFiles(prev => [...prev, ...newFiles]);
                                                            setImagePreviews(prev => [...prev, ...newFiles.map(f => URL.createObjectURL(f))]);
                                                        }
                                                    }}
                                                />
                                            </label>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-400">{imagePreviews.length} of 5 uploaded</p>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-slate-900 mb-1 block">Session Duration Dates</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <input
                                    type="date"
                                    value={sessionStartDate}
                                    onChange={(e) => {
                                        setSessionStartDate(e.target.value);
                                        if (errors.sessionStartDate) setErrors({ ...errors, sessionStartDate: "" });
                                    }}
                                    max={new Date().toISOString().split("T")[0]}
                                    className={`w-full appearance-none bg-slate-50 border ${errors.sessionStartDate ? "border-red-400" : "border-slate-200"} rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400`}
                                />
                                <input
                                    type="date"
                                    value={sessionEndDate}
                                    onChange={(e) => {
                                        setSessionEndDate(e.target.value);
                                        if (errors.sessionEndDate) setErrors({ ...errors, sessionEndDate: "" });
                                    }}
                                    max={new Date().toISOString().split("T")[0]}
                                    className={`w-full appearance-none bg-slate-50 border ${errors.sessionEndDate ? "border-red-400" : "border-slate-200"} rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400`}
                                />
                            </div>
                            {errors.sessionStartDate && (
                                <div className="text-red-500 text-sm mt-1 font-medium flex items-center gap-1.5">
                                    <AlertCircle size={14} />
                                    {errors.sessionStartDate}
                                </div>
                            )}
                            {errors.sessionEndDate && (
                                <div className="text-red-500 text-sm mt-1 font-medium flex items-center gap-1.5">
                                    <AlertCircle size={14} />
                                    {errors.sessionEndDate}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            type="button"
                            onClick={() => {
                                setSelectedReview("");
                                setUserName("");
                                setLocationName("");
                                setSessionStartDate("");
                                setSessionEndDate("");
                                setRating(4);
                                setReviewText("");
                                setImageFiles([]);
                                setImagePreviews([]);
                                setErrors({});
                            }}
                            className="sm:w-44 px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-semibold text-sm bg-white hover:bg-slate-50"
                        >
                            Clear Form
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-6 py-2.5 rounded-lg bg-green-700 text-white font-semibold text-sm hover:bg-green-800 transition-colors"
                        >
                            Submit Review
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FeedbackForm;

