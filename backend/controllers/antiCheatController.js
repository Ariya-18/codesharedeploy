const AntiCheatLog = require("../models/AntiCheatLog");
const Report = require("../models/Report");
const Room = require("../models/Room");

// @desc  Log anti-cheat event
// @route POST /api/anti-cheat/log
exports.logAntiCheatEvent = async (req, res) => {
  try {
    const { roomId, eventType, details } = req.body;

    const log = await AntiCheatLog.create({
      roomId: roomId?.toUpperCase(),
      user: req.user._id,
      eventType,
      details,
      severity: getSeverity(eventType),
    });

    // Create report for critical events
    if (log.severity === "critical" || log.severity === "high") {
      const room = await Room.findOne({ roomId: roomId?.toUpperCase() });
      if (room) {
        await Report.create({
          roomId: roomId?.toUpperCase(),
          room: room._id,
          user: req.user._id,
          reportType: "anti-cheat",
          title: `Anti-Cheat Alert: ${eventType}`,
          description: details,
          severity: log.severity === "critical" ? "critical" : "high",
        });
      }
    }

    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get anti-cheat logs for room (host only)
// @route GET /api/anti-cheat/room/:roomId
exports.getRoomAntiCheatLogs = async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId?.toUpperCase() });

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Only host can view logs
    if (room.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only host can view logs" });
    }

    const logs = await AntiCheatLog.find({ roomId: req.params.roomId?.toUpperCase() })
      .populate("user", "name email profilePicture")
      .sort({ createdAt: -1 });

    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get user's anti-cheat incidents
// @route GET /api/anti-cheat/user
exports.getUserAntiCheatLogs = async (req, res) => {
  try {
    const logs = await AntiCheatLog.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to determine severity
function getSeverity(eventType) {
  const criticalEvents = ["multiple-tabs", "external-paste"];
  const highEvents = ["tab-switch", "window-blur", "large-paste"];

  if (criticalEvents.includes(eventType)) return "critical";
  if (highEvents.includes(eventType)) return "high";
  return "low";
}
