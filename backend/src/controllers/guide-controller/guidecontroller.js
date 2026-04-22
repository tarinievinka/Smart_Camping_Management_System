const Guide = require("../../models/guide-model/guidemodel");
const User = require("../../models/user-model/userModel");

// Create a new guide
exports.createGuide = async (req, res) => {
  try {
    const guide = new Guide(req.body);
    await guide.save();
    res.status(201).json(guide);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all guides
exports.getAllGuides = async (req, res) => {
  try {
    const guideService = require("../../services/guide-service/guideService");
    const guides = await guideService.getAllGuides();
    res.json(guides);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a guide by ID
exports.getGuideById = async (req, res) => {
  try {
    const guide = await Guide.findById(req.params.id);

    if (!guide) {
      return res.status(404).json({ message: "Guide not found" });
    }

    res.json(guide);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a guide
exports.updateGuide = async (req, res) => {
  try {
    const guide = await Guide.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!guide) {
      return res.status(404).json({ message: "Guide not found" });
    }

    res.json(guide);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete guide
exports.deleteGuide = async (req, res) => {
  try {
    const guide = await Guide.findByIdAndDelete(req.params.id);

    if (!guide) {
      return res.status(404).json({ message: "Guide not found" });
    }

    res.json({ message: "Guide deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Approve guide
exports.approveGuide = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "guide") {
      return res.status(400).json({ message: "User is not a guide applicant" });
    }

    // Update user approval status using the correct schema field
    user.guideStatus = 'approved';
    user.isActive = true;
    await user.save();

    // Prevent duplicate guide documents
    const existingGuide = await Guide.findOne({ email: user.email });
    if (existingGuide) {
      // Already approved — just return the existing guide
      return res.status(200).json({ message: "Guide already approved", guide: existingGuide });
    }

    // Create a new Guide document using the application data
    // NOTE: nic and age are required by the Guide schema — must be included
    const app = user.guideApplication || {};
    const guideData = {
      name:        app.fullName || user.name,
      email:       user.email,
      phone:       user.phone || '',
      experience:  Number(app.experience) || 0,   // Guide schema expects Number
      nic:         app.nic || '',                  // required field
      age:         Number(app.age) || 18,          // required field
      description: app.description || '',
      language:    app.languages ? app.languages.join(', ') : '',
      cv:          app.cv || '',
      userId:      user._id
    };

    const newGuide = new Guide(guideData);
    await newGuide.save();

    res.status(200).json({ message: "Guide approved successfully", guide: newGuide });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get my guide profile (for logged in guide)
exports.getMyGuideProfile = async (req, res) => {
  try {
    const guide = await Guide.findOne({ 
      $or: [
        { userId: req.user.id },
        { email: req.user.email }
      ]
    });
    if (!guide) return res.status(404).json({ message: "Guide profile not found" });
    res.json(guide);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};