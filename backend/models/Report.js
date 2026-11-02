const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
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
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reportType: {
      type: String,
      enum: ["anti-cheat", "performance", "technical", "conduct"],
      default: "technical",
    },
    title: {
      type: String,
      required: true,
    },
    description: String,
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "closed"],
      default: "open",
    },
    data: mongoose.Schema.Types.Mixed, // Flexible data storage
    resolvedAt: Date,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    comments: String,
  },
  { timestamps: true }
);

reportSchema.index({ roomId: 1, status: 1 });
reportSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Report", reportSchema);
