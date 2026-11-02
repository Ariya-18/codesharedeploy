const sessionRecordService = require('../services/sessionRecordService');
const Room = require('../models/Room');

// @desc  Start a recording for a room
// @route POST /api/recordings/start
exports.startRecording = async (req, res) => {
  try {
    const { roomId } = req.body;
    const room = await Room.findOne({ roomId: roomId?.toUpperCase() });

    if (!room) return res.status(404).json({ message: "Room not found" });
    if (room.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the room host can start a recording" });
    }

    const recording = await sessionRecordService.startRecording(room.roomId, room, req.user);
    res.status(201).json(recording);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Finalize a recording
// @route POST /api/recordings/:id/finalize
exports.finalizeRecording = async (req, res) => {
  try {
    const recording = await sessionRecordService.getRecording(req.params.id);
    if (!recording) return res.status(404).json({ message: "Recording not found" });
    if (!recording.participants.some((participant) => participant.userId.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: "You are not part of this recording" });
    }

    const finalized = await sessionRecordService.endRecording(req.params.id);
    res.status(200).json(finalized);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get a session recording by its ID
// @route GET /api/recordings/:id
exports.getRecording = async (req, res) => {
  try {
    const recording = await sessionRecordService.getRecording(req.params.id);
    if (!recording) {
      return res.status(404).json({ message: "Recording not found" });
    }
    res.status(200).json(recording);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get all recordings for a room
// @route GET /api/recordings/room/:roomId
exports.getRoomRecordings = async (req, res) => {
  try {
    const recordings = await sessionRecordService.getRoomRecordings(req.params.roomId);
    res.status(200).json(recordings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
