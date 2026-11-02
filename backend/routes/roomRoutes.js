const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");

const {
  createRoom,
  joinRoom,
  getMySessions,
  getUpcomingInterviews,
  getRoomById,
  inviteToRoom,
  getRoomExecutionHistory,
  getRoomMessages,
} = require("../controllers/roomController");
const { createRoomValidator, joinRoomValidator } = require("../validators/roomValidator");

router.post("/create", protect, createRoomValidator, createRoom);
router.post("/join", protect, joinRoomValidator, joinRoom);
router.get("/my-sessions", protect, getMySessions);
router.get("/upcoming", protect, getUpcomingInterviews);
router.get("/:roomId", protect, getRoomById);
router.post("/:roomId/invite", protect, inviteToRoom);
router.get("/:roomId/history", protect, getRoomExecutionHistory);
router.get("/:roomId/messages", protect, getRoomMessages);

module.exports = router;