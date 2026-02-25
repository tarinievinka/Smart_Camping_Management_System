const express = require("express");
const router = express.Router();

const guideController = require("../../controllers/guide-controller/guidecontroller");

// Create new guide
router.post("/add", guideController.createGuide);

// Get all guides
router.get("/display", guideController.getAllGuides);

// Get guide by ID
router.get("/update/:id", guideController.getGuideById);

// Update guide
router.put("/update/:id", guideController.updateGuide);

// Delete guide
router.delete("/:id", guideController.deleteGuide);

module.exports = router;