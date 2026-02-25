const express = require('express');
const router = express.Router();
const feedbackController = require('../../controllers/feedback-controller/feedbackController');

// Create
router.post('/add', feedbackController.createFeedback);

// Get all
router.get('/display', feedbackController.getAllFeedbacks);

// Get by ID
router.get('/:id', feedbackController.getFeedbackById);

// Update
router.put('/update/:id', feedbackController.updateFeedback);

// Delete
router.delete('/delete/:id', feedbackController.deleteFeedback);

// Analytics
router.get('/analytics/average', feedbackController.getAverageRating);
router.get('/analytics/top', feedbackController.getTopRated);

module.exports = router;