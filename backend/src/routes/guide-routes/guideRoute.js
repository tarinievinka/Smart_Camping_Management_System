const express = require("express");
const router = express.Router();

const guideController = require("../../controllers/guide-controller/guidecontroller");
const guideUploadController = require("../../controllers/upload-controller/guideUploadController");
const { upload } = require("../../middleware/guideUpload");

// Create guide
router.post("/add", guideController.createGuide);

// Image upload for guide profile / cover / gallery (stores file under /uploads)
router.post("/upload-image", (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message || "Invalid file upload" });
    }
    next();
  });
}, guideUploadController.uploadGuideImage);

// Get guides
router.get("/display", guideController.getAllGuides);

// Get  by ID
router.get("/update/:id", guideController.getGuideById);

// Update 
router.put("/update/:id", guideController.updateGuide);

// Delete guide
router.delete("/:id", guideController.deleteGuide);

module.exports = router;