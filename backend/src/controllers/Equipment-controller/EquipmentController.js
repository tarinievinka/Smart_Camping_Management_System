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
    const data = { ...req.body };
    if (req.file) {
      data.imageUrl = `/uploads/${req.file.filename}`;  // save path
    }
    const equipment = await createEquipment(data);
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
    const data = { ...req.body };
    if (req.file) {
      data.imageUrl = `/uploads/${req.file.filename}`;  // update image if new one uploaded
    }
    const equipment = await updateEquipment(req.params.id, data);
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

// Update availability status
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