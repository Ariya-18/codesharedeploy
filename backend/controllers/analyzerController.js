const analyticsService = require("../services/analyticsService");

// @desc  Generate analytics for a session
// @route POST /api/analyze/generate
exports.generateAnalytics = async (req, res) => {
  try {
    const { recordingId } = req.body;

    const analytics = await analyticsService.generateAnalytics(recordingId, req.user._id);
    res.status(201).json(analytics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get analytics for a room
// @route GET /api/analyze/room/:roomId
exports.getRoomAnalytics = async (req, res) => {
  try {
    const analytics = await analyticsService.getRoomAnalytics(req.params.roomId);
    res.status(200).json(analytics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get user's analytics
// @route GET /api/analyze/user
exports.getUserAnalytics = async (req, res) => {
  try {
    const analytics = await analyticsService.getUserAnalytics(req.user._id);
    res.status(200).json(analytics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get session analytics
// @route GET /api/analyze/session/:sessionId
exports.getSessionAnalytics = async (req, res) => {
  try {
    const analytics = await analyticsService.getSessionAnalytics(req.params.sessionId);
    if (!analytics) {
      return res.status(404).json({ message: "Analytics not found" });
    }
    res.status(200).json(analytics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Analyze code complexity (LLM call - server-side key)
// @route POST /api/analyze/complexity
exports.analyzeComplexity = async (req, res) => {
  try {
    const { code, language } = req.body;

    if (!code) {
      return res.status(400).json({ message: "Code is required" });
    }

    // Mock complexity analysis - in production, call LLM API
    const timeComplexity = "O(n)"; // Placeholder
    const spaceComplexity = "O(1)"; // Placeholder
    const feedback =
      "The code looks efficient. Consider edge cases for large inputs."; // Placeholder

    res.status(200).json({
      timeComplexity,
      spaceComplexity,
      feedback,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
