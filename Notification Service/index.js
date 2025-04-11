const express = require('express');
const mongoose = require('mongoose');
const logger = require('./src/config/logger'); 
const NotificationService = require('./src/services/notificationService'); 
const cors = require('cors');
const { STATUS_CODES, MESSAGES } = require('./src/utils/constants');    

require('dotenv').config();

const app = express();
app.use(express.json());

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => logger.info('Connected to MongoDB Atlas'))
  .catch((err) => logger.error(`MongoDB connection error: ${err.message}`));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(STATUS_CODES.OK).json({ success: true, message: MESSAGES.SERVICE_RUNNING });
});

// Start Notification Service
NotificationService.startListening()
  .then(() => logger.info('Notification Service started listening'))
  .catch((err) => logger.error(`Notification Service startup error: ${err.message}`));

const NOTIFICATION_PORT = process.env.NOTIFICATION_PORT || 3002;
app.listen(NOTIFICATION_PORT, () => logger.info(`Notification Service running on port ${NOTIFICATION_PORT}`));