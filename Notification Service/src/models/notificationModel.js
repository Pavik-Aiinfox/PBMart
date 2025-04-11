const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  mobile: { type: String, required: true },
  message: { type: String, required: true },
  sentAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);