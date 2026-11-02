const executionService = require("../services/executionService");
const ExecutionHistory = require("../models/ExecutionHistory");

/**
 * POST /api/execute
 * Execute code with optional input
 */
exports.executeCode = async (req, res, next) => {
  try {
    const { code, language, stdin } = req.body;

    if (!code || !language) {
      return res.status(400).json({
        success: false,
        message: "code and language are required",
      });
    }

    const result = await executionService.executeCode(code, language, stdin || "");

    // Also save to history if roomId provided
    if (req.body.roomId) {
      const history = await ExecutionHistory.create({
        roomId: req.body.roomId.toUpperCase(),
        userId: req.user._id,
        code,
        language,
        stdin: stdin || "",
        stdout: result.stdout,
        stderr: result.stderr,
        compileOutput: result.compileOutput,
        status: result.status,
        time: result.time,
        memory: result.memory,
        engine: result.engine || "unknown",
      });

      await history.populate("userId", "name email profilePicture");
      result.executionId = history._id;
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/execute/engines
 * Report which execution engines are available
 */
exports.getAvailableEngines = async (req, res, next) => {
  try {
    const engines = {
      judge0: {
        available: !!process.env.JUDGE0_API_URL,
        url: process.env.JUDGE0_API_URL || "https://ce.judge0.com",
        hasApiKey: !!(
          process.env.JUDGE0_API_KEY &&
          process.env.JUDGE0_API_KEY !== "your_rapidapi_key_here"
        ),
      },
      local: {
        available: process.env.ENABLE_LOCAL_RUNNER !== "false",
        localRunnerEnabled: process.env.ENABLE_LOCAL_RUNNER !== "false",
        production: process.env.NODE_ENV === "production",
      },
      demo: {
        available: true,
        description: "Fallback demo mode for starter templates",
      },
    };

    // Try to detect available local compilers
    const localCompilers = await executionService.getAvailableCompilers();

    res.status(200).json({
      success: true,
      data: {
        engines,
        localCompilers,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/rooms/:roomId/history
 * Get execution history for a room
 */
exports.getRoomExecutionHistory = async (req, res, next) => {
  try {
    const { roomId } = req.params;

    const history = await ExecutionHistory.find({
      roomId: roomId.toUpperCase(),
    })
      .populate("userId", "name email profilePicture")
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    next(error);
  }
};
