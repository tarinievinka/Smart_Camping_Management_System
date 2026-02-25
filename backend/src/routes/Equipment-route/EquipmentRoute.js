const express = require('express');
const router = express.Router();
const equipmentController = require('../../controllers/Equipment-controller/EquipmentController');

// Create a new equipment item
router.post('/add', equipmentController.createEquipment);

// Get all equipment
router.get('/display', equipmentController.getAllEquipment);

// Get equipment by ID
router.get('/:id', equipmentController.getEquipmentById);

// Update equipment by ID
router.put('/update/:id', equipmentController.updateEquipment);

// Delete equipment by ID
router.delete('/delete/:id', equipmentController.deleteEquipment);

// Update availability status
router.patch('/:id/status', equipmentController.updateAvailabilityStatus);

module.exports = router;