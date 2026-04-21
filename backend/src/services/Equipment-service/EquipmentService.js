const Equipment = require('../../models/Equipment-model/EquipmentModel');

const createEquipment = async (data) => {
  const equipment = new Equipment(data);
  return await equipment.save();
};

const getAllEquipment = async () => {
  const equipments = await Equipment.find().lean();
  
  // Aggregate feedback to get average rating per equipment
  const Feedback = require('../../models/feedback-model/FeedbackModel');
  const feedbacks = await Feedback.find({ targetType: 'Equipment' }).lean();
  
  return equipments.map(eq => {
    // Match exactly like EquipmentDetail.jsx: by targetId OR targetName
    const eqFeedbacks = feedbacks.filter(f => {
      const idMatch = f.targetId && f.targetId.toString() === eq._id.toString();
      const nameMatch = f.targetName && f.targetName.trim().toLowerCase() === eq.name.trim().toLowerCase();
      return idMatch || nameMatch;
    });
    
    const reviewCount = eqFeedbacks.length;
    const averageRating = reviewCount > 0 
      ? eqFeedbacks.reduce((sum, f) => sum + f.rating, 0) / reviewCount 
      : 0;

    return {
      ...eq,
      averageRating,
      reviewCount
    };
  });
};

const getEquipmentById = async (id) => {
  return await Equipment.findById(id);
};

const updateEquipment = async (id, data) => {
  return await Equipment.findByIdAndUpdate(id, data, { new: true });
};

const deleteEquipment = async (id) => {
  return await Equipment.findByIdAndDelete(id);
};

const updateAvailabilityStatus = async (id, status) => {
  const equipment = await Equipment.findById(id);
  if (!equipment) return null;
  equipment.availabilityStatus = status;
  await equipment.save();
  return equipment;
};

// ── NEW: reduce stock when user confirms a booking ──────────
const reduceStock = async (id, quantity, mode) => {
  const equipment = await Equipment.findById(id);
  if (!equipment) return null;

  // Reduce stock by the booked quantity — never go below 0
  const newStock = Math.max(0, equipment.stockQuantity - quantity);
  equipment.stockQuantity = newStock;

  // Auto-update status based on new stock + booking mode
  if (newStock === 0) {
    // Rented = all units are currently rented out (can come back)
    // Out of Stock = units are sold permanently
    equipment.availabilityStatus = mode === 'rent' ? 'Rented' : 'Out of Stock';
  } else {
    // Still has stock — keep as Available
    equipment.availabilityStatus = 'Available';
  }

  return await equipment.save();
};

module.exports = {
  createEquipment,
  getAllEquipment,
  getEquipmentById,
  updateEquipment,
  deleteEquipment,
  updateAvailabilityStatus,
  reduceStock,           
};