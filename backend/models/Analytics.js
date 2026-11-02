const mongoose = require("mongoose");

const analyticsSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      uppercase: true,
      index: true,
    },
    sessionRecord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SessionRecord",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Time metrics
    totalSessionTime: { type: Number, default: 0 }, // milliseconds
    activeTime: { type: Number, default: 0 }, // milliseconds actually typing/coding
    idleTime: { type: Number, default: 0 }, // milliseconds

    // Code metrics
    totalLinesAdded: { type: Number, default: 0 },
    totalLinesDeleted: { type: Number, default: 0 },
    totalCharactersAdded: { type: Number, default: 0 },
    totalCharactersDeleted: { type: Number, default: 0 },

    // Typing metrics
    averageTypingSpeed: { type: Number, default: 0 }, // chars per minute
    peakTypingSpeed: { type: Number, default: 0 }, // chars per minute
    totalKeystrokes: { type: Number, default: 0 },

    // Execution metrics
    totalExecutions: { type: Number, default: 0 },
    successfulExecutions: { type: Number, default: 0 },
    failedExecutions: { type: Number, default: 0 },
    compilationErrors: { type: Number, default: 0 },
    runtimeErrors: { type: Number, default: 0 },
    averageExecutionTime: { type: Number, default: 0 }, // seconds

    // Languages used
    languagesUsed: [
      {
        language: String,
        count: Number,
        timeSpent: Number, // milliseconds
      },
    ],

    // Chat metrics
    messagesCount: { type: Number, default: 0 },
    averageMessageLength: { type: Number, default: 0 },

    // Participation metrics
    mostActivePeriod: String, // "hh:mm - hh:mm"
    contributionPercentage: { type: Number, default: 0 }, // % of total changes

    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

analyticsSchema.index({ roomId: 1, user: 1 });
analyticsSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Analytics", analyticsSchema);
