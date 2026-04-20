const Campsite = require('../../models/campsite-model/CampsiteModel');

exports.createCampsite = async (req, res) => {
  try {
    const newCampsite = new Campsite({
      ...req.body,
      image: req.file ? `/uploads/${req.file.filename}` : '',
      amenities: req.body.amenities ? JSON.parse(req.body.amenities) : [],
      status: 'pending' // Enforce pending status upon creation for owner verification
    });
    
    await newCampsite.save();
    res.status(201).json({ success: true, data: newCampsite });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getAllCampsites = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }
    const campsites = await Campsite.find(filter);
    res.status(200).json({ success: true, data: campsites });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getCampsiteById = async (req, res) => {
  try {
    const campsite = await Campsite.findById(req.params.id);
    if (!campsite) {
      return res.status(404).json({ success: false, error: "Campsite not found" });
    }
    res.status(200).json({ success: true, data: campsite });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getSitesByOwner = async (req, res) => {
  try {
    const campsites = await Campsite.find({ ownerId: req.params.ownerId });
    res.status(200).json({ success: true, data: campsites });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const campsite = await Campsite.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!campsite) {
      return res.status(404).json({ success: false, error: "Campsite not found" });
    }
    res.status(200).json({ success: true, data: campsite });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.updateCampsite = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }
    if (req.body.amenities) {
      updateData.amenities = JSON.parse(req.body.amenities);
    }

    const campsite = await Campsite.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!campsite) {
      return res.status(404).json({ success: false, error: "Campsite not found" });
    }
    res.status(200).json({ success: true, data: campsite });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.deleteCampsite = async (req, res) => {
  try {
    const campsite = await Campsite.findByIdAndDelete(req.params.id);
    if (!campsite) {
      return res.status(404).json({ success: false, error: "Campsite not found" });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
