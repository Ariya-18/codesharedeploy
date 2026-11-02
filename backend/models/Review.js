const mongoose = require("mongoose");

const lineCommentSchema = new mongoose.Schema({
  lineNumber: {
    type: Number,
    required: true,
  },
  comment: {
    type: String,
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  resolvedAt: Date,
  isResolved: { type: Boolean, default: false },
});

const reviewSchema = new mongoose.Schema(
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
    sessionRecord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SessionRecord",
    },
    code: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      default: "javascript",
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Line-by-line comments
    lineComments: [lineCommentSchema],

    // Overall review
    overallComment: String,
    status: {
      type: String,
      enum: ["pending", "in-review", "approved", "rejected", "needs-revision"],
      default: "pending",
    },

    // Review metrics
    totalComments: { type: Number, default: 0 },
    resolvedComments: { type: Number, default: 0 },
    approvalDate: Date,

    // History
    revisions: [
      {
        code: String,
        changedAt: { type: Date, default: Date.now },
        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
  },
  { timestamps: true }
);

reviewSchema.index({ roomId: 1, author: 1 });
reviewSchema.index({ reviewer: 1, status: 1 });

module.exports = mongoose.model("Review", reviewSchema);
