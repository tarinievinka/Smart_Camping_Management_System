const feedbackService = require('../../services/feedback-service/feedbackService');
const {
  isValidRating,
  isValidTargetType,
  generateEditableTime,
  sanitizeComment
} = require('../../utils/feedbackUtils');

// Create
exports.createFeedback = async (req, res) => {
  try {
    const { rating, targetType, comment } = req.body;

    if (!isValidRating(rating))
      return res.status(400).json({ error: "Invalid rating" });

    if (!isValidTargetType(targetType))
      return res.status(400).json({ error: "Invalid target type" });

    req.body.comment = sanitizeComment(comment);
    req.body.editableUntil = generateEditableTime();

    const feedback = await feedbackService.createFeedback(req.body);
    res.status(201).json(feedback);
  } catch (err) {
    console.error('Feedback creation error:', err); // Log full error for debugging
    res.status(400).json({ error: err.message });
  }
};

// Get all
exports.getAllFeedbacks = async (req, res) => {
  try {
    const data = await feedbackService.getAllFeedbacks();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get by ID
exports.getFeedbackById = async (req, res) => {
  try {
    const data = await feedbackService.getFeedbackById(req.params.id);
    if (!data) return res.status(404).json({ error: "Not found" });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update
exports.updateFeedback = async (req, res) => {
  try {
    const data = await feedbackService.updateFeedback(req.params.id, req.body);
    if (!data) return res.status(404).json({ error: "Not found" });
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete
exports.deleteFeedback = async (req, res) => {
  try {
    const data = await feedbackService.deleteFeedback(req.params.id);
    if (!data) return res.status(404).json({ error: "Not found" });
    res.json({ message: "Feedback deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Average rating
exports.getAverageRating = async (req, res) => {
  try {
    const data = await feedbackService.getAverageRating();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Top rated
exports.getTopRated = async (req, res) => {
  try {
    const data = await feedbackService.getTopRated();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};