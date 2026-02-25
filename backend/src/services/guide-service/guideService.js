const Guide = require("../../models-guide-management/guide.model");

// Create guide
const createGuide = async (data) => {
  const guide = new Guide(data);
  return await guide.save();
};

// Get all guides
const getAllGuides = async () => {
  return await Guide.find();
};

// Get guide by ID
const getGuideById = async (id) => {
  return await Guide.findById(id);
};

// Update guide
const updateGuide = async (id, data) => {
  return await Guide.findByIdAndUpdate(id, data, { new: true });
};

// Delete guide
const deleteGuide = async (id) => {
  return await Guide.findByIdAndDelete(id);
};

// Update guide availability (extra useful for camping system)
const updateGuideAvailability = async (id, availability) => {
  const guide = await Guide.findById(id);
  if (!guide) return null;

  guide.availability = availability;
  await guide.save();

  return guide;
};

module.exports = {
  createGuide,
  getAllGuides,
  getGuideById,
  updateGuide,
  deleteGuide,
  updateGuideAvailability
};