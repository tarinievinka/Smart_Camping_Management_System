import React, { useEffect, useState } from "react";
import './MyReviews.css';
import axios from "axios";
import { useNavigate } from "react-router-dom";

const MyReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Edit State
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ rating: 5, comment: '', targetType: '', sessionDate: '' });
  const [editError, setEditError] = useState('');

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/api/feedback/display");
      setReviews(response.data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      alert("Failed to load reviews. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/feedback/delete/${id}`);
      setReviews(reviews.filter((r) => r._id !== id));
      alert("Review deleted successfully!");
    } catch (error) {
      console.error("Error deleting review:", error);
      alert(error.response?.data?.error || "Failed to delete review.");
    }
  };

  const isEditable = (createdAt) => {
    if (!createdAt) return true; // If somehow missing, allow edit safely
    const reviewDate = new Date(createdAt);
    const daysDiff = (Date.now() - reviewDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff <= 7;
  };

  const handleEditClick = (review) => {
    if (!isEditable(review.createdAt)) {
      alert("This review is older than 7 days and can no longer be edited.");
      return;
    }
    setEditingId(review._id);
    setEditForm({
      rating: review.rating || 5,
      comment: review.comment || review.description || '',
      targetType: review.targetType || 'Campsite',
      sessionDate: review.sessionDate ? new Date(review.sessionDate).toISOString().split('T')[0] : '',
    });
    setEditError('');
  };

  const handleEditSubmit = async (e, id) => {
    e.preventDefault();
    
    // Validation
    if (!editForm.targetType) {
      setEditError("Review type is required.");
      return;
    }
    if (!editForm.comment.trim()) {
      setEditError("Comment cannot be empty.");
      return;
    }
    if (editForm.comment.trim().length < 10) {
      setEditError("Comment must be at least 10 characters.");
      return;
    }
    if (!editForm.sessionDate) {
      setEditError("Session date is required.");
      return;
    }

    try {
      const payload = {
        rating: Number(editForm.rating),
        comment: editForm.comment,
        targetType: editForm.targetType,
        sessionDate: editForm.sessionDate
      };
      
      await axios.put(`http://localhost:5000/api/feedback/update/${id}`, payload);
      
      // Update state locally
      setReviews(reviews.map((r) => r._id === id ? { ...r, ...payload } : r));
      setEditingId(null);
      alert("Review updated successfully!");
    } catch (error) {
      console.error("Error updating review:", error);
      setEditError(error.response?.data?.error || "Failed to update review.");
    }
  };

  return (
    <div className="my-reviews-layout">
      <aside className="sidebar">
        <div className="logo">Smart Camp<br /><span>Management System</span></div>
        <nav>
          <ul>
            <li onClick={() => navigate("/")}>Dashboard</li>
            <li onClick={() => navigate("/")}>Campsites</li>
            <li onClick={() => navigate("/")}>Equipment</li>
            <li onClick={() => navigate("/")}>Guides</li>
            <li className="admin-link" onClick={() => navigate("/admin/feedback")} style={{ color: '#059669', fontWeight: 'bold' }}>Admin Dashboard</li>
          </ul>
        </nav>
        <div className="pro-member">
          <div>Unlock unlimited reviews and HD photos.</div>
          <button>Upgrade Now</button>
        </div>
      </aside>
      <main className="main-content">
        <header className="reviews-header">
          <h1>My Reviews</h1>
        </header>
        <section className="stats">
          <div className="stat">
            <div>Total Reviews</div>
            <div className="stat-value">{reviews.length} <span className="stat-change">+3 this month</span></div>
          </div>
          <div className="stat">
            <div>Average Rating</div>
            <div className="stat-value">4.8 <span className="stars">★★★★★</span></div>
          </div>
          <div className="stat">
            <div>Helpful Votes</div>
            <div className="stat-value">156 <span className="stat-badge">Top 5% contributor</span></div>
          </div>
        </section>
        <section className="filters">
          <button className="active">All</button>
          <button>Campsites</button>
          <button>Equipment</button>
          <span className="sort">Sort by: <b>Newest First</b></span>
        </section>
        <section className="reviews-list">
          {loading ? (
            <p>Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <p>No reviews found. Be the first to write one!</p>
          ) : (
            reviews.map(review => (
              <div className="review-card" key={review._id}>
                <img className="review-image" src={review.image || "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=2070&auto=format&fit=crop"} alt={review.title || review.targetType} />
                <div className="review-details">
                  
                  {editingId === review._id ? (
                    // EDIT MODE
                    <form onSubmit={(e) => handleEditSubmit(e, review._id)} style={{ width: '100%' }}>
                      <div style={{ marginBottom: '10px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Type</label>
                        <select 
                          value={editForm.targetType} 
                          onChange={(e) => setEditForm({...editForm, targetType: e.target.value})}
                          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '100%', maxWidth: '200px' }}
                        >
                          <option value="Campsite">Campsite</option>
                          <option value="Equipment">Equipment</option>
                          <option value="Guide">Guide</option>
                        </select>
                      </div>

                      <div style={{ marginBottom: '10px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Session Date</label>
                        <input 
                          type="date"
                          value={editForm.sessionDate}
                          onChange={(e) => setEditForm({...editForm, sessionDate: e.target.value})}
                          max={new Date().toISOString().split("T")[0]}
                          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '100%', maxWidth: '200px' }}
                        />
                      </div>

                      <div style={{ marginBottom: '10px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Rating</label>
                        <select 
                          value={editForm.rating} 
                          onChange={(e) => setEditForm({...editForm, rating: e.target.value})}
                          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '100%', maxWidth: '100px' }}
                        >
                          {[1,2,3,4,5].map(num => (
                            <option key={num} value={num}>{num} Star{num > 1 ? 's' : ''}</option>
                          ))}
                        </select>
                      </div>

                      <div style={{ marginBottom: '10px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Comment</label>
                        <textarea 
                          value={editForm.comment}
                          onChange={(e) => setEditForm({...editForm, comment: e.target.value})}
                          rows="4"
                          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '100%', resize: 'vertical' }}
                        />
                      </div>

                      {editError && <div style={{ color: 'red', marginBottom: '10px', fontSize: '14px' }}>{editError}</div>}
                      
                      <div className="review-actions" style={{ justifyContent: 'flex-start', marginTop: '10px' }}>
                        <button type="submit" style={{ background: '#15803d', color: 'white', border: 'none' }}>Save Changes</button>
                        <button type="button" onClick={() => setEditingId(null)} style={{ background: '#6b7280', color: 'white', border: 'none' }}>Cancel</button>
                      </div>
                    </form>
                  ) : (
                    // VIEW MODE
                    <>
                      <div className="review-meta" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                        <span className={`review-type ${review.targetType?.toLowerCase() || 'campsite'}`}>{review.targetType || 'Campsite'}</span>
                        <span className="review-verified">Verified</span>
                        <span className="review-date">Reviewed: {new Date(review.createdAt || Date.now()).toLocaleDateString()}</span>
                        {review.sessionDate && (
                          <span className="review-date" style={{fontStyle: 'italic', background: '#e5e7eb', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', color: '#374151'}}>
                            Event Date: {new Date(review.sessionDate).toLocaleDateString()}
                          </span>
                        )}
                        <span className="review-rating" style={{marginLeft: 'auto'}}>{'★'.repeat(review.rating || 5)}{'☆'.repeat(5 - (review.rating || 5))}</span>
                      </div>
                      <h2>{review.title || `${review.targetType || 'Item'} Review`}</h2>
                      <p>{review.comment || review.description}</p>
                      <div className="review-actions">
                        <span>{review.helpful || 0} Helpful</span>
                        <span>{review.comments || 0} Comments</span>
                        
                        {isEditable(review.createdAt) ? (
                          <button onClick={() => handleEditClick(review)}>Edit</button>
                        ) : (
                          <button style={{ opacity: 0.5, cursor: 'not-allowed' }} title="Edit time (7 days) has expired" disabled>Edit</button>
                        )}

                        <button className="delete" onClick={() => handleDelete(review._id)}>Delete</button>
                      </div>
                    </>
                  )}
                  
                </div>
              </div>
            ))
          )}
        </section>
        <button className="load-more">Load More Reviews</button>
      </main>
    </div>
  );
};

export default MyReviews;
