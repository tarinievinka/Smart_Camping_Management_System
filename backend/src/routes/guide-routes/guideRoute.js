const express = require("express");
const router = express.Router();

const guideController = require("../../controllers/guide-controller/guidecontroller");

// Create guide
router.post("/add", guideController.createGuide);

// Get guides
router.get("/display", guideController.getAllGuides);

// Get  by ID
router.get("/update/:id", guideController.getGuideById);

// Update 
router.put("/update/:id", guideController.updateGuide);

// Delete guide
router.delete("/:id", guideController.deleteGuide);

module.exports = router;