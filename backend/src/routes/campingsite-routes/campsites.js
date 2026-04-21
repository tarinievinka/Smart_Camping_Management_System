import express from 'express';
import Campsite from '../../models/camping-site-models/Campsite.js';
import { protect, admin, campsiteOwner } from '../../utils/auth.js';

const router = express.Router();

// @route   GET /api/campsites
// @access  Public - optionally filter by location and date
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.location) {
      filter.location = { $regex: req.query.location, $options: 'i' };
    }
    // date-based availability filter not enforced on campsite level (reservations handle it)
    // but we can at minimum return available ones
    if (req.query.available === 'true') {
      filter.availability = true;
    }
    const campsites = await Campsite.find(filter).populate('owner', 'username email');
    res.json(campsites);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/campsites/mine
// @access  Private/CampsiteOwner
router.get('/mine', protect, campsiteOwner, async (req, res) => {
  try {
    const campsites = await Campsite.find({ owner: req.user._id });
    res.json(campsites);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/campsites/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const campsite = await Campsite.findById(req.params.id).populate('owner', 'username email');
    if (campsite) res.json(campsite);
    else res.status(404).json({ message: 'Campsite not found' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/campsites
// @access  Private/CampsiteOwner or Admin
router.post('/', protect, campsiteOwner, async (req, res) => {
  try {
    const campsite = new Campsite({
      title: req.body.title,
      price: req.body.price,
      description: req.body.description,
      location: req.body.location,
      amenities: req.body.amenities || [],
      images: req.body.images || [],
      availability: req.body.availability !== undefined ? req.body.availability : true,
      minBookingDays: req.body.minBookingDays || 1,
      maxBookingDays: req.body.maxBookingDays || 30,
      owner: req.user.role === 'campsite-owner' ? req.user._id : null,
    });
    const created = await campsite.save();
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/campsites/:id
// @access  Private/Owner of that site or Admin
router.put('/:id', protect, campsiteOwner, async (req, res) => {
  try {
    const campsite = await Campsite.findById(req.params.id);
    if (!campsite) return res.status(404).json({ message: 'Campsite not found' });

    // Owner can only update their own
    if (req.user.role === 'campsite-owner' && String(campsite.owner) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to edit this campsite' });
    }

    Object.assign(campsite, {
      title: req.body.title || campsite.title,
      price: req.body.price || campsite.price,
      description: req.body.description || campsite.description,
      location: req.body.location || campsite.location,
      amenities: req.body.amenities || campsite.amenities,
      images: req.body.images || campsite.images,
      availability: req.body.availability !== undefined ? req.body.availability : campsite.availability,
      minBookingDays: req.body.minBookingDays || campsite.minBookingDays,
      maxBookingDays: req.body.maxBookingDays || campsite.maxBookingDays,
    });

    const updated = await campsite.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/campsites/:id
// @access  Private/Owner or Admin
router.delete('/:id', protect, campsiteOwner, async (req, res) => {
  try {
    const campsite = await Campsite.findById(req.params.id);
    if (!campsite) return res.status(404).json({ message: 'Campsite not found' });

    if (req.user.role === 'campsite-owner' && String(campsite.owner) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to delete this campsite' });
    }

    await Campsite.deleteOne({ _id: campsite._id });
    res.json({ message: 'Campsite removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
