const mongoose = require('mongoose');

const antiCheatSchema = new mongoose.Schema({
  roomId: { type: String, required: true, uppercase: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['tab-switch', 'window-blur', 'large-paste'], required: true },
  details: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('AntiCheatLog', antiCheatSchema);
