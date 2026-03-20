

import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Star, UploadCloud, MessageSquare, MapPin, X, CheckCircle, ChevronDown, AlertCircle } from "lucide-react";

const starLabels = ["Terrible", "Bad", "Okay", "Good", "Very Good"];

const FeedbackForm = () => {
    const [selectedReview, setSelectedReview] = useState("");
    const [rating, setRating] = useState(4);
    const [hover, setHover] = useState(null);
    const [reviewText, setReviewText] = useState("");
    const [photos, setPhotos] = useState([]);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const handlePhotoChange = (e) => {
        const files = Array.from(e.target.files);
        setPhotos(prev => [...prev, ...files]);
    };

    const removePhoto = (indexToRemove) => {
        setPhotos(photos.filter((_, index) => index !== indexToRemove));
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files);
        setPhotos(prev => [...prev, ...files]);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = {};

        if (!selectedReview) {
            newErrors.selectedReview = "Please select what you are reviewing.";
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

        const feedbackData = {
            userId: "507f1f77bcf86cd799439011",
            targetType: selectedReview.charAt(0).toUpperCase() + selectedReview.slice(1),
            targetId: "507f1f77bcf86cd799439012",
            rating: rating,
            comment: reviewText
        };

        const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";

        try {
            const response = await axios.post(`${apiUrl}/api/feedback/add`, feedbackData);
            console.log("Feedback submitted:", response.data);
            alert("Review submitted successfully!");

            // Reset form
            setSelectedReview("");
            setRating(4);
            setReviewText("");
            setPhotos([]);
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
        <div className="w-full py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center font-sans">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-2xl mx-auto bg-gradient-to-br from-green-700 to-green-900 rounded-[32px] shadow-2xl overflow-hidden border-2 border-green-600/50"
            >
                {/* Header Section */}
                <div className="px-8 pt-10 pb-6 sm:px-12 sm:pt-12 sm:pb-8 flex flex-col items-center text-center">
                    <div className="bg-green-600/40 p-4 rounded-full mb-6 border border-green-400/30">
                        <MapPin className="text-green-300 w-10 h-10" strokeWidth={2.5} />
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
                        Share Your Adventure
                    </h2>
                    <p className="text-green-100/90 text-lg sm:text-xl font-medium leading-relaxed max-w-md">
                        Your feedback helps the camping community grow. Tell us about your experience.
                    </p>
                </div>

                <div className="px-8 sm:px-12 pb-8 space-y-8">
                    {/* What are you reviewing? */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold tracking-widest text-green-200 uppercase flex items-center gap-2">
                            What are you reviewing?
                        </label>
                        <div className="relative">
                            <select
                                value={selectedReview}
                                onChange={(e) => {
                                    setSelectedReview(e.target.value);
                                    if (errors.selectedReview) setErrors({ ...errors, selectedReview: "" });
                                }}
                                className={`w-full appearance-none bg-green-950/40 border-2 ${errors.selectedReview ? 'border-red-400 focus:ring-red-400' : 'border-green-600/50 focus:ring-green-400 focus:border-green-400'} text-white rounded-2xl px-5 py-4 text-lg focus:outline-none focus:ring-4 focus:ring-opacity-20 transition-all font-medium cursor-pointer backdrop-blur-sm`}
                            >
                                <option value="" className="text-gray-500 bg-white">Select a campsite, equipment, or guide...</option>
                                <option value="campsite" className="text-gray-900 bg-white">Campsite</option>
                                <option value="equipment" className="text-gray-900 bg-white">Equipment</option>
                                <option value="guide" className="text-gray-900 bg-white">Guide</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-5 pointer-events-none text-green-300">
                                <ChevronDown size={24} strokeWidth={2.5} />
                            </div>
                        </div>
                        {errors.selectedReview && (
                            <div className="text-red-300 text-sm mt-2 font-semibold flex items-center gap-1.5 animate-pulse">
                                <AlertCircle size={16} />
                                {errors.selectedReview}
                            </div>
                        )}
                    </div>

                    {/* How was your experience? */}
                    <div className="p-6 sm:p-8 bg-black/10 rounded-[24px] border border-green-600/20 shadow-inner backdrop-blur-md">
                        <label className="text-sm font-bold tracking-widest text-green-200 uppercase block mb-5">
                            How was your experience?
                        </label>
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            <div className="flex items-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        type="button"
                                        key={star}
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHover(star)}
                                        onMouseLeave={() => setHover(null)}
                                        className="focus:outline-none transition-transform hover:scale-125 active:scale-90 p-1"
                                    >
                                        <Star
                                            size={44}
                                            strokeWidth={1.5}
                                            className={`${(hover || rating) >= star ? 'fill-yellow-400 text-yellow-400 drop-shadow-[0_0_12px_rgba(250,204,21,0.6)]' : 'fill-transparent text-green-500 hover:text-green-400'} transition-all duration-300`}
                                        />
                                    </button>
                                ))}
                            </div>
                            <div className="hidden sm:block h-12 w-[2px] bg-green-700/50 rounded-full"></div>
                            <div className="w-full sm:w-auto flex justify-center">
                                <span className="text-xl sm:text-2xl font-bold text-white bg-green-950/40 px-6 py-2.5 rounded-2xl min-w-[150px] text-center shadow-lg border border-green-500/30 w-full sm:w-auto">
                                    {starLabels[(hover || rating) - 1]}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Write your review */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold tracking-widest text-green-200 uppercase flex items-center gap-2">
                            <MessageSquare size={18} />
                            Write your review
                        </label>
                        <textarea
                            value={reviewText}
                            onChange={(e) => {
                                setReviewText(e.target.value);
                                if (errors.reviewText) setErrors({ ...errors, reviewText: "" });
                            }}
                            placeholder="Tell us about the atmosphere, facilities, or the quality of the gear..."
                            rows={5}
                            className={`w-full bg-green-950/40 border-2 ${errors.reviewText ? 'border-red-400 focus:ring-red-400' : 'border-green-600/50 focus:ring-green-400 focus:border-green-400'} text-white placeholder-green-300/50 rounded-2xl p-5 text-lg focus:outline-none focus:ring-4 focus:ring-opacity-20 transition-all resize-y font-medium backdrop-blur-sm shadow-inner`}
                        />
                        {errors.reviewText && (
                            <div className="text-red-300 text-sm mt-2 font-semibold flex items-center gap-1.5 animate-pulse">
                                <AlertCircle size={16} />
                                {errors.reviewText}
                            </div>
                        )}
                    </div>

                    {/* Add photos */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold tracking-widest text-green-200 uppercase block mb-3">
                            Add Photos (Optional)
                        </label>
                        <div
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            className="group relative border-2 border-dashed border-green-400/60 hover:border-green-300 rounded-[24px] p-8 sm:p-10 text-center bg-green-950/20 hover:bg-green-900/40 transition-all duration-300 cursor-pointer overflow-hidden"
                        >
                            {/* Decorative background glow */}
                            <div className="absolute inset-0 bg-gradient-to-t from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            
                            <input
                                type="file"
                                accept="image/png, image/jpeg"
                                multiple
                                className="hidden"
                                id="photo-upload"
                                onChange={handlePhotoChange}
                            />
                            <label htmlFor="photo-upload" className="cursor-pointer flex flex-col items-center justify-center w-full h-full relative z-10">
                                <div className="bg-green-600/50 p-5 rounded-full mb-5 group-hover:scale-110 group-hover:bg-green-500/80 transition-all duration-300 shadow-xl border border-green-400/30">
                                    <UploadCloud className="text-white" size={36} strokeWidth={2.5} />
                                </div>
                                <p className="text-white font-extrabold text-xl mb-2 drop-shadow-md">
                                    Drag and drop your photos here
                                </p>
                                <p className="text-green-200 text-base mb-4 font-medium">
                                    or <span className="text-white underline underline-offset-4 decoration-2 decoration-green-400 hover:text-green-300 transition-colors">Browse files</span>
                                </p>
                                <p className="text-green-100 text-xs font-bold tracking-widest bg-green-950/60 px-4 py-1.5 rounded-lg inline-block border border-green-700/50">
                                    JPG, PNG UP TO 10MB
                                </p>
                            </label>
                        </div>
                        {photos.length > 0 && (
                            <div className="flex flex-wrap gap-4 mt-6">
                                {photos.map((file, idx) => (
                                    <div key={idx} className="relative group">
                                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-green-400/80 shadow-xl">
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt="preview"
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        </div>
                                        <button
                                            type="button"
                                            className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-xl hover:bg-red-600 hover:scale-110"
                                            onClick={() => removePhoto(idx)}
                                        >
                                            <X size={16} strokeWidth={3} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer / Actions */}
                <div className="bg-green-950/50 px-8 py-8 sm:px-12 sm:py-10 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-green-600/30 backdrop-blur-xl">
                    <div className="flex items-center gap-3 text-green-200 text-sm font-medium bg-green-900/40 p-3 rounded-xl border border-green-700/50">
                        <div className="w-6 h-6 rounded-full bg-green-500/30 flex items-center justify-center border border-green-400/50 shrink-0">
                            <CheckCircle size={14} className="text-green-300" strokeWidth={3} />
                        </div>
                        <span>Your review will be <strong className="text-white">public</strong> and linked to your profile</span>
                    </div>

                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <button
                            type="button"
                            onClick={() => {
                                setSelectedReview("");
                                setRating(4);
                                setReviewText("");
                                setPhotos([]);
                                setErrors({});
                            }}
                            className="px-6 py-4 rounded-xl text-green-100 font-bold hover:bg-white/10 transition-colors w-full sm:w-auto"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-8 py-4 rounded-xl bg-white text-green-800 font-extrabold text-lg hover:bg-yellow-400 hover:text-green-900 hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_rgba(250,204,21,0.6)] w-full sm:w-auto text-center flex-1"
                        >
                            Submit Review
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default FeedbackForm;

