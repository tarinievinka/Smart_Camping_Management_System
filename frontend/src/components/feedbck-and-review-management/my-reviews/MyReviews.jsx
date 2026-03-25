import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Star, Pencil, Trash2, X, ChevronDown, MapPin, PenSquare, User, Upload } from "lucide-react";
import ReviewSidebar from "../ReviewSidebar";

const MyReviews = () => {
  const CURRENT_USER_ID = "507f1f77bcf86cd799439011";
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const navigate = useNavigate();

  const [editingReview, setEditingReview] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editForm, setEditForm] = useState({ rating: 5, title: "", comment: "", imageFiles: [], existingImageUrls: [], imagePreviews: [] });
  const [editError, setEditError] = useState("");

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/api/feedback/display");
      const myOnly = (response.data || []).filter(
        (item) => String(item.userId || "") === CURRENT_USER_ID
      );
      setReviews(myOnly);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      alert("Failed to load reviews. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [CURRENT_USER_ID]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await axios.delete(`http://localhost:5000/api/feedback/delete/${deleteTarget._id}`);
      setReviews(reviews.filter((r) => r._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (error) {
      console.error("Error deleting review:", error);
      alert(error.response?.data?.error || "Failed to delete review.");
    }
  };

  const isEditable = (createdAt) => {
    return true; // Unrestricted edit/delete on requested user reviews
  };

  const handleDeleteClick = (review) => {
    if (!isEditable(review.createdAt)) {
      alert("This review is older than 7 days and can no longer be deleted.");
      return;
    }
    setDeleteTarget(review);
  };

  const openEditModal = (review) => {
    if (!isEditable(review.createdAt)) {
      alert("This review is older than 7 days and can no longer be edited.");
      return;
    }
    setEditingReview(review);
    const urls = review.imageUrls && review.imageUrls.length > 0 
      ? review.imageUrls 
      : (review.imageUrl ? [review.imageUrl] : []);

    setEditForm({
      rating: review.rating || 5,
      title: review.title || `${review.targetType || "Review"} Review`,
      comment: review.comment || review.description || "",
      imageFiles: [],
      existingImageUrls: urls,
      imagePreviews: urls.map(url => `http://localhost:5000${url}`)
    });
    setEditError("");
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.comment.trim()) {
      setEditError("Comment cannot be empty.");
      return;
    }
    if (editForm.comment.trim().length < 10) {
      setEditError("Comment must be at least 10 characters.");
      return;
    }
    if (!editingReview) {
      setEditError("No review selected.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("rating", Number(editForm.rating));
      formData.append("title", editForm.title);
      formData.append("comment", editForm.comment);
      if (editForm.existingImageUrls && editForm.existingImageUrls.length > 0) {
        // Can append multiple times for array
        editForm.existingImageUrls.forEach(url => formData.append("existingImageUrls", url));
      } else {
        formData.append("clearImages", "true");
      }
      
      if (editForm.imageFiles && editForm.imageFiles.length > 0) {
        editForm.imageFiles.forEach(file => formData.append("images", file));
      }
      
      const response = await axios.put(`http://localhost:5000/api/feedback/update/${editingReview._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      setReviews(reviews.map((r) => r._id === editingReview._id ? { ...r, ...response.data } : r));
      setEditingReview(null);
      setEditError("");
    } catch (error) {
      console.error("Error updating review:", error);
      setEditError(error.response?.data?.error || "Failed to update review.");
    }
  };

  const filteredReviews = useMemo(() => {
    const typeFiltered = reviews.filter((review) => {
      if (typeFilter === "all") return true;
      return String(review.targetType || "").toLowerCase() === typeFilter;
    });

    return [...typeFiltered].sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      if (sortBy === "oldest") return dateA - dateB;
      return dateB - dateA;
    });
  }, [reviews, typeFilter, sortBy]);

  const renderStars = (value) => {
    const ratingValue = Number(value || 0);
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={18}
            className={star <= ratingValue ? "fill-amber-400 text-amber-400" : "text-slate-300"}
          />
        ))}
      </div>
    );
  };

  const getDefaultImage = (type) => {
    switch (type?.toLowerCase()) {
      case "guide":
        return "https://4wdtalk-bucket.s3.amazonaws.com/wp-content/uploads/2022/12/08152957/Choose-Your-Camp-Site-Wisely.jpg"; // Guide/team setting up camp
      case "equipment":
        return "https://tse2.mm.bing.net/th/id/OIP.LCRUcFi1_XIFWGNas2MT_gHaFF?rs=1&pid=ImgDetMain&o=7&rm=3"; // Backpack and gear
      case "campsite":
      default:
        return "https://th.bing.com/th/id/R.baf72e8e2a93d38451872149f5e6bcbe?rik=eNG83xsl%2bhxAOQ&riu=http%3a%2f%2fayamaya.com%2fcdn%2fshop%2farticles%2fayamaya-tent-and-gear-essential-camping-gear-mainblogimg.webp%3fv%3d1714687718&ehk=dXWZMI%2fE08jg5f0%2bnYNd6WQnHB0yfxMnDSGr5oY6iOQ%3d&risl=&pid=ImgRaw&r=0"; // Classic campsite
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <ReviewSidebar />

      <div className="flex-1 h-screen overflow-y-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">My Reviews</h1>
          </div>
          
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-sm self-start sm:self-auto">
            <button
              type="button"
              onClick={() => navigate("/feedback")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-white transition-all"
            >
              <PenSquare size={16} />
              Submit Review
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-white text-slate-900 shadow-sm border border-slate-200 transition-all pointer-events-none"
            >
              <User size={16} />
              My Reviews
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="appearance-none bg-white border border-slate-200 rounded-lg px-4 py-2.5 pr-10 text-sm font-semibold min-w-[170px] focus:outline-none focus:ring-2 focus:ring-slate-300"
            >
              <option value="all">All Types</option>
              <option value="campsite">Locations</option>
              <option value="guide">Guides</option>
              <option value="equipment">Equipment</option>
            </select>
            <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 border-t-transparent mb-4"></div>
            <p className="text-slate-500 font-medium">Loading your reviews...</p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm max-w-2xl mx-auto my-10">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-5 border border-slate-100">
              <PenSquare size={32} className="text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">No Reviews Found</h3>
            <p className="text-slate-500 text-base max-w-sm mx-auto mb-8">
              {typeFilter !== "all" ? "You don't have any reviews matching this filter." : "You haven't written any reviews yet. Share your experiences with the community!"}
            </p>
            <button 
              onClick={() => navigate("/feedback")} 
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors shadow-sm"
            >
              <PenSquare size={18} />
              Write Your First Review
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredReviews.map((review) => {
              const editable = isEditable(review.createdAt);
              return (
                <div key={review._id} className="group border border-slate-200 rounded-2xl p-4 bg-white shadow-sm hover:shadow-md transition-all duration-300 hover:border-slate-300">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex gap-3 overflow-x-auto sm:w-64 shrink-0 pb-3 sleek-scrollbar snap-x">
                      {(review.imageUrls && review.imageUrls.length > 0 
                        ? review.imageUrls.map(url => `http://localhost:5000${url}`) 
                        : [review.imageUrl ? `http://localhost:5000${review.imageUrl}` : review.image || getDefaultImage(review.targetType)]
                      ).map((src, i) => (
                        <img
                          key={i}
                          className="w-full sm:w-48 sm:h-32 rounded-xl object-cover border border-slate-200 shadow-sm hover:shadow-md transition-shadow shrink-0 snap-center"
                          src={src}
                          alt={`${review.title || review.targetType} ${i + 1}`}
                        />
                      ))}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-50 border border-slate-200 text-xs font-semibold">
                            <MapPin size={12} />
                            {review.targetType || "Type"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(review)}
                            disabled={!editable}
                            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-lg border text-sm font-semibold ${
                              editable ? "border-slate-300 hover:bg-slate-50" : "border-slate-200 text-slate-400 cursor-not-allowed"
                            }`}
                          >
                            <Pencil size={14} />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteClick(review)}
                            disabled={!editable}
                            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-lg border text-sm font-semibold ${
                              editable ? "border-slate-300 hover:bg-slate-50" : "border-slate-200 text-slate-400 cursor-not-allowed"
                            }`}
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </div>
                      </div>

                      <h3 className="text-2xl font-bold text-slate-900 leading-tight mb-2 group-hover:text-green-600 transition-colors">
                        {review.targetName || review.title || `${review.targetType || "Review"} Review`}
                      </h3>
                      <div className="flex items-center gap-3 mb-2">
                        {renderStars(review.rating)}
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span className="text-slate-500 font-medium text-sm">
                          By <span className="text-slate-700 font-bold">{review.userName || review.userId?.name || "Anonymous User"}</span>
                        </span>
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span className="text-slate-500 font-medium text-sm">
                          {new Date(review.createdAt || Date.now()).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                      </div>
                      <h4 className="text-xl font-semibold text-slate-900 mb-1">
                        {review.title || "Great experience"}
                      </h4>
                      <p className="text-slate-700 text-lg leading-relaxed mb-2">
                        {review.comment || review.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      </div>

      {editingReview && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl border border-slate-200 p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold">Edit Review</h3>
              <button type="button" onClick={() => setEditingReview(null)} className="text-slate-500 hover:text-slate-800">
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-base font-semibold mb-1">Rating</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button" onClick={() => setEditForm({ ...editForm, rating: star })}>
                      <Star size={34} className={star <= Number(editForm.rating) ? "fill-amber-400 text-amber-400" : "text-slate-300"} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-base font-semibold mb-1">Review</label>
                <textarea
                  value={editForm.comment}
                  onChange={(e) => setEditForm({ ...editForm, comment: e.target.value })}
                  rows={4}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-slate-300"
                />
              </div>
              <div>
                <label className="block text-base font-semibold mb-1">Update Photos (Optional)</label>
                {editForm.imagePreviews.length === 0 ? (
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-6 h-6 mb-1 text-slate-400" />
                      <p className="text-sm text-slate-500 font-semibold">Click to upload new photos</p>
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files).slice(0, 5);
                        if (files.length) {
                          setEditForm({ ...editForm, imageFiles: files, imagePreviews: files.map(file => URL.createObjectURL(file)) });
                        }
                      }}
                    />
                  </label>
                ) : (
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-3">
                        {editForm.imagePreviews.map((preview, idx) => (
                            <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border border-slate-200">
                                <img src={preview} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => {
                                        const newExisting = [...editForm.existingImageUrls];
                                        const newFiles = [...editForm.imageFiles];
                                        const newPreviews = [...editForm.imagePreviews];
                                        
                                        if (idx < newExisting.length) {
                                            newExisting.splice(idx, 1);
                                        } else {
                                            newFiles.splice(idx - newExisting.length, 1);
                                        }
                                        newPreviews.splice(idx, 1);
                                        
                                        setEditForm({ ...editForm, existingImageUrls: newExisting, imageFiles: newFiles, imagePreviews: newPreviews });
                                    }}
                                    className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-black/80 rounded-full text-white transition-colors"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                        
                        {editForm.imagePreviews.length < 5 && (
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
                                        const remaining = 5 - editForm.imagePreviews.length;
                                        const newFiles = files.slice(0, remaining);
                                        if (newFiles.length) {
                                            setEditForm({ 
                                              ...editForm, 
                                              imageFiles: [...editForm.imageFiles, ...newFiles], 
                                              imagePreviews: [...editForm.imagePreviews, ...newFiles.map(f => URL.createObjectURL(f))] 
                                            });
                                        }
                                    }}
                                />
                            </label>
                        )}
                    </div>
                  </div>
                )}
              </div>
              {editError && <p className="text-red-500 text-sm">{editError}</p>}
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setEditingReview(null)} className="px-4 py-2 rounded-lg border border-slate-300 font-semibold">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-slate-900 text-white font-semibold">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-2xl border border-slate-200 p-6 shadow-lg">
            <h3 className="text-2xl font-bold mb-3">Delete Review</h3>
            <p className="text-slate-700 text-base mb-6">Are you sure you want to delete this review? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setDeleteTarget(null)} className="px-4 py-2 rounded-lg border border-slate-300 font-semibold">
                Cancel
              </button>
              <button type="button" onClick={confirmDelete} className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyReviews;
