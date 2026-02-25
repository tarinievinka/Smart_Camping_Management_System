const Equipment = require('../../models/Equipment-model/EquipmentModel');
const {
  createEquipment,
  getAllEquipment,
  getEquipmentById,
  updateEquipment,
  deleteEquipment,
  updateAvailabilityStatus
} = require('../../services/Equipment-service/EquipmentService');

// Create a new equipment item
exports.createEquipment = async (req, res) => {
  try {
    const equipment = await createEquipment(req.body);
    res.status(201).json(equipment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all equipment
exports.getAllEquipment = async (req, res) => {
  try {
    const equipment = await getAllEquipment();
    res.json(equipment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get equipment by ID
exports.getEquipmentById = async (req, res) => {
  try {
    const equipment = await getEquipmentById(req.params.id);
    if (!equipment) return res.status(404).json({ error: 'Equipment not found' });
    res.json(equipment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update equipment by ID
exports.updateEquipment = async (req, res) => {
  try {
    const equipment = await updateEquipment(req.params.id, req.body);
    if (!equipment) return res.status(404).json({ error: 'Equipment not found' });
    res.json(equipment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete equipment by ID
exports.deleteEquipment = async (req, res) => {
  try {
    const equipment = await deleteEquipment(req.params.id);
    if (!equipment) return res.status(404).json({ error: 'Equipment not found' });
    res.json({ message: 'Equipment deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update availability status (Available, Rented, Out of Stock, Deactivated)
exports.updateAvailabilityStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const equipment = await updateAvailabilityStatus(req.params.id, status);
    if (!equipment) return res.status(404).json({ error: 'Equipment not found' });
    res.json(equipment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};