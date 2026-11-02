const Scorecard = require("../models/Scorecard");
const Room = require("../models/Room");

// @desc  Create or update scorecard
// @route POST /api/scorecards
exports.createScorecard = async (req, res) => {
  try {
    const {
      roomId,
      candidateId,
      overallScore,
      passedTests,
      totalTests,
      remarks,
    } = req.body;

    const room = await Room.findOne({ roomId: roomId?.toUpperCase() });
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Only room host can create scorecards
    if (room.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only host can create scorecards" });
    }

    let scorecard = await Scorecard.findOne({
      roomId: roomId?.toUpperCase(),
      candidate: candidateId,
    });

    if (scorecard) {
      scorecard.overallScore = overallScore || scorecard.overallScore;
      scorecard.passedTestCases = passedTests || scorecard.passedTestCases;
      scorecard.totalTestCases = totalTests || scorecard.totalTestCases;
      scorecard.remarks = remarks || scorecard.remarks;
      scorecard.interviewer = req.user._id;
    } else {
      scorecard = await Scorecard.create({
        roomId: roomId?.toUpperCase(),
        room: room._id,
        candidate: candidateId,
        interviewer: req.user._id,
        overallScore,
        passedTestCases: passedTests,
        totalTestCases: totalTests,
        remarks,
        sessionDuration: room.endedAt ? room.endedAt - room.startedAt : 0,
      });
    }

    // Calculate grade
    if (overallScore >= 90) scorecard.grade = "A";
    else if (overallScore >= 80) scorecard.grade = "B";
    else if (overallScore >= 70) scorecard.grade = "C";
    else if (overallScore >= 60) scorecard.grade = "D";
    else scorecard.grade = "F";

    await scorecard.save();
    await scorecard.populate("candidate interviewer");

    res.status(201).json(scorecard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get scorecard
// @route GET /api/scorecards/:id
exports.getScorecard = async (req, res) => {
  try {
    const scorecard = await Scorecard.findById(req.params.id)
      .populate("candidate interviewer room");

    if (!scorecard) {
      return res.status(404).json({ message: "Scorecard not found" });
    }

    res.status(200).json(scorecard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get room scorecards
// @route GET /api/scorecards/room/:roomId
exports.getRoomScorecards = async (req, res) => {
  try {
    const scorecards = await Scorecard.find({
      roomId: req.params.roomId?.toUpperCase(),
    })
      .populate("candidate interviewer")
      .sort({ createdAt: -1 });

    res.status(200).json(scorecards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Submit scorecard (finalize)
// @route PUT /api/scorecards/:id/submit
exports.submitScorecard = async (req, res) => {
  try {
    const scorecard = await Scorecard.findById(req.params.id);

    if (!scorecard) {
      return res.status(404).json({ message: "Scorecard not found" });
    }

    if (scorecard.interviewer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only interviewer can submit" });
    }

    scorecard.isSubmitted = true;
    scorecard.submittedAt = new Date();
    await scorecard.save();

    res.status(200).json(scorecard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
