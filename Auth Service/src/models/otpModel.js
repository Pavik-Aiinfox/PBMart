const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  mobile: { type: String, required: true, index: true },
  otp: { type: String, required: true },
  failedAttempts: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true, expires: 0 }, // Auto-remove after expiry
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('OTP', otpSchema);