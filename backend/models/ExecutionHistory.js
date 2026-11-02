const mongoose = require("mongoose");

const executionHistorySchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      uppercase: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      required: true,
    },
    stdin: {
      type: String,
      default: "",
    },
    stdout: {
      type: String,
      default: "",
    },
    stderr: {
      type: String,
      default: "",
    },
    compileOutput: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Accepted", "Compilation Error", "Runtime Error", "Time Limit Exceeded", "Error"],
      default: "Error",
    },
    time: {
      type: Number,
      default: 0,
    },
    memory: {
      type: Number,
      default: 0,
    },
    engine: {
      type: String,
      enum: ["judge0", "local", "demo", "unknown"],
      default: "unknown",
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: false }
);

// Compound index for efficient queries
executionHistorySchema.index({ roomId: 1, createdAt: -1 });
executionHistorySchema.index({ userId: 1, roomId: 1 });

module.exports = mongoose.model("ExecutionHistory", executionHistorySchema);
