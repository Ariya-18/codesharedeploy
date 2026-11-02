const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const {
  logAntiCheatEvent,
  getRoomAntiCheatLogs,
  getUserAntiCheatLogs,
} = require("../controllers/antiCheatController");

router.post("/log", protect, logAntiCheatEvent);
router.get("/room/:roomId", protect, getRoomAntiCheatLogs);
router.get("/user", protect, getUserAntiCheatLogs);

module.exports = router;
