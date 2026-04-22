const express = require('express');
const router = express.Router();
const campsiteController = require('../../controllers/campsite-controller/campsiteController');
const upload = require('../../config/upload'); 
<<<<<<< HEAD

// Create a new campsite with image upload
router.post('/add', upload.single('image'), campsiteController.createCampsite);
=======
const { protect, admin, campsiteOwner } = require('../../utils/auth');

// Create a new campsite with image upload (authenticated owners)
router.post('/add', protect, campsiteOwner, upload.single('image'), campsiteController.createCampsite);
>>>>>>> 72d49f97b953854ffc2cce76cb28c3b75c102fd7

// Get all campsites
router.get('/display', campsiteController.getAllCampsites);

<<<<<<< HEAD
=======
// Get campsites for the logged-in owner
router.get('/mine', protect, campsiteOwner, campsiteController.getMyCampsites);

>>>>>>> 72d49f97b953854ffc2cce76cb28c3b75c102fd7
// Get a specific campsite
router.get('/:id', campsiteController.getCampsiteById);

// Get campsites by owner
router.get('/owner/:ownerId', campsiteController.getSitesByOwner);

// Update a campsite with optional new image upload
<<<<<<< HEAD
router.put('/update/:id', upload.single('image'), campsiteController.updateCampsite);
=======
router.put('/update/:id', protect, campsiteOwner, upload.single('image'), campsiteController.updateCampsite);
>>>>>>> 72d49f97b953854ffc2cce76cb28c3b75c102fd7

// Update approval status (admin)
router.put('/update-status/:id', campsiteController.updateStatus);

// Delete a campsite
<<<<<<< HEAD
router.delete('/delete/:id', campsiteController.deleteCampsite);
=======
router.delete('/delete/:id', protect, campsiteOwner, campsiteController.deleteCampsite);
>>>>>>> 72d49f97b953854ffc2cce76cb28c3b75c102fd7

module.exports = router;
