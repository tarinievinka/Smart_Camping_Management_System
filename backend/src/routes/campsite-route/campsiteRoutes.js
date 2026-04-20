const express = require('express');
const router = express.Router();
const campsiteController = require('../../controllers/campsite-controller/campsiteController');
const upload = require('../../config/upload'); 

// Create a new campsite with image upload
router.post('/add', upload.single('image'), campsiteController.createCampsite);

// Get all campsites
router.get('/display', campsiteController.getAllCampsites);

// Get a specific campsite
router.get('/:id', campsiteController.getCampsiteById);

// Get campsites by owner
router.get('/owner/:ownerId', campsiteController.getSitesByOwner);

// Update a campsite with optional new image upload
router.put('/update/:id', upload.single('image'), campsiteController.updateCampsite);

// Update approval status (admin)
router.put('/update-status/:id', campsiteController.updateStatus);

// Delete a campsite
router.delete('/delete/:id', campsiteController.deleteCampsite);

module.exports = router;
