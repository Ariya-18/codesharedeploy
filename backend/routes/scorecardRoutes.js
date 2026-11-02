const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const {
  createScorecard,
  getScorecard,
  getRoomScorecards,
  submitScorecard,
} = require("../controllers/scorecardController");

router.post("/", protect, createScorecard);
router.get("/:id", protect, getScorecard);
router.get("/room/:roomId", protect, getRoomScorecards);
router.put("/:id/submit", protect, submitScorecard);

module.exports = router;
