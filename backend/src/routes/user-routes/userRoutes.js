const express = require('express');
const router = express.Router();
const userController = require('../../controllers/user-controller/userController');
const { protect, adminOnly } = require('../../middleware/authMiddleware');

// Public
router.post('/register', userController.register);
router.post('/login', userController.login);

// Authenticated user
router.get('/profile', protect, userController.getProfile);
router.put('/profile', protect, userController.updateProfile);

// Admin only
router.get('/', protect, adminOnly, userController.getAllUsers);
router.patch('/:id/status', protect, adminOnly, userController.setUserStatus);
router.delete('/:id', protect, adminOnly, userController.deleteUser);

module.exports = router;