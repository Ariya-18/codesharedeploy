const mongoose = require("mongoose");

const scorecardSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      uppercase: true,
      index: true,
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    interviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    sessionRecord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SessionRecord",
    },

    // Session Details
    sessionDuration: { type: Number, default: 0 }, // milliseconds
    startTime: { type: Date, default: Date.now },
    endTime: Date,
    languagesUsed: [String],

    // Test Results
    totalTestCases: { type: Number, default: 0 },
    passedTestCases: { type: Number, default: 0 },
    failedTestCases: { type: Number, default: 0 },

    // Code Quality
    codeQualityScore: { type: Number, min: 0, max: 100, default: 0 },
    readabilityScore: { type: Number, min: 0, max: 100, default: 0 },
    efficiencyScore: { type: Number, min: 0, max: 100, default: 0 },

    // Overall Score
    overallScore: { type: Number, min: 0, max: 100, default: 0 },
    grade: {
      type: String,
      enum: ["A", "B", "C", "D", "F"],
    },

    // Feedback
    strengths: [String],
    areasForImprovement: [String],
    remarks: String,
    mentorComments: String,

    // Status
    isSubmitted: { type: Boolean, default: false },
    submittedAt: Date,
    isApproved: { type: Boolean, default: false },
    approvedAt: Date,
  },
  { timestamps: true }
);

scorecardSchema.index({ roomId: 1, candidate: 1 });
scorecardSchema.index({ candidate: 1, createdAt: -1 });

module.exports = mongoose.model("Scorecard", scorecardSchema);
