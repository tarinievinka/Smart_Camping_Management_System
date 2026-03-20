

import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Star, UploadCloud, MessageSquare, MapPin, X, CheckCircle, ChevronDown, AlertCircle } from "lucide-react";

const starLabels = ["Terrible", "Bad", "Okay", "Good", "Very Good"];

const FeedbackForm = () => {
    const [selectedReview, setSelectedReview] = useState("");
    const [sessionDate, setSessionDate] = useState("");
    const [rating, setRating] = useState(4);
    const [hover, setHover] = useState(null);
    const [reviewText, setReviewText] = useState("");
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = {};

        if (!selectedReview) {
            newErrors.selectedReview = "Please select what you are reviewing.";
        }

        if (!sessionDate) {
            newErrors.sessionDate = "Please select the date of your session.";
        } else {
            const selectedDate = new Date(sessionDate);
            const today = new Date();
            if (selectedDate > today) {
                newErrors.sessionDate = "Session date cannot be in the future.";
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

        const feedbackData = {
            userId: "507f1f77bcf86cd799439011",
            targetType: selectedReview.charAt(0).toUpperCase() + selectedReview.slice(1),
            targetId: "507f1f77bcf86cd799439012",
            sessionDate: sessionDate,
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
            setSessionDate("");
            setRating(4);
            setReviewText("");
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

                    {/* When was your session? */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold tracking-widest text-green-200 uppercase flex items-center gap-2">
                            When was your session?
                        </label>
                        <div className="relative">
                            <input
                                type="date"
                                value={sessionDate}
                                onChange={(e) => {
                                    setSessionDate(e.target.value);
                                    if (errors.sessionDate) setErrors({ ...errors, sessionDate: "" });
                                }}
                                max={new Date().toISOString().split("T")[0]}
                                className={`w-full appearance-none bg-green-950/40 border-2 ${errors.sessionDate ? 'border-red-400 focus:ring-red-400' : 'border-green-600/50 focus:ring-green-400 focus:border-green-400'} text-white rounded-2xl px-5 py-4 text-lg focus:outline-none focus:ring-4 focus:ring-opacity-20 transition-all font-medium cursor-pointer backdrop-blur-sm`}
                            />
                        </div>
                        {errors.sessionDate && (
                            <div className="text-red-300 text-sm mt-2 font-semibold flex items-center gap-1.5 animate-pulse">
                                <AlertCircle size={16} />
                                {errors.sessionDate}
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
                                setSessionDate("");
                                setRating(4);
                                setReviewText("");
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

