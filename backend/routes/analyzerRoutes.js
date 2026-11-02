const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const {
  generateAnalytics,
  getRoomAnalytics,
  getUserAnalytics,
  getSessionAnalytics,
  analyzeComplexity,
} = require("../controllers/analyzerController");

router.post("/generate", protect, generateAnalytics);
router.get("/room/:roomId", protect, getRoomAnalytics);
router.get("/user", protect, getUserAnalytics);
router.get("/session/:sessionId", protect, getSessionAnalytics);
router.post("/complexity", protect, analyzeComplexity);

module.exports = router;
