const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const {
  executeCode,
  getAvailableEngines,
  getRoomExecutionHistory,
} = require("../controllers/executionController");

router.post("/execute", protect, executeCode);
router.get("/engines", protect, getAvailableEngines);
router.get("/rooms/:roomId/history", protect, getRoomExecutionHistory);

module.exports = router;
