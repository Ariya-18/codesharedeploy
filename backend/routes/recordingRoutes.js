const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const {
	startRecording,
	finalizeRecording,
	getRecording,
	getRoomRecordings,
} = require("../controllers/recordingController");

router.post("/start", protect, startRecording);
router.post("/:id/finalize", protect, finalizeRecording);
router.get("/:id", protect, getRecording);
router.get("/room/:roomId", protect, getRoomRecordings);

module.exports = router;
