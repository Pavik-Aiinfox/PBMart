const jwt = require('jsonwebtoken');
const amqp = require('amqplib');
const OTP = require('../models/otpModel');
const logger = require('../config/logger');
const { 
  STATUS_CODES, 
  MESSAGES, 
  OTP_EXPIRY_MINUTES, 
  MAX_FAILED_ATTEMPTS, 
  JWT_EXPIRY, 
  USER_ROLE 
} = require('../utils/constants');

// RabbitMQ connection for notifications
// let notificationChannel;

// async function connectRabbitMQ() {
//   try {
//     const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost:5672');
//     notificationChannel = await connection.createChannel();
//     await notificationChannel.assertQueue('notification_queue', { durable: true });
//     logger.info('AuthService connected to RabbitMQ for notifications');
//   } catch (error) {
//     logger.error(`RabbitMQ connection error: ${error.message}`);
//     throw error;
//   }
// }

// connectRabbitMQ();

// Mask mobile number
function maskMobile(mobile) {
  return `+91-XXXXXX${mobile.slice(-4)}`;
}

// In-memory rate limiter (kept as-is for now)
const rateLimiter = new Map();

class AuthService {
  
  static async validateMobile(mobile) {
    if (!/^\d{10}$/.test(mobile)) {
      throw new Error('Mobile number must be 10 digits');
    }
  }

  static checkRateLimit(mobile) {
    const now = Date.now() / 1000;
    const window = parseInt(process.env.RAPIDMQ_WINDOW, 10) || 3600; // 1 hour default
    const maxRequests = parseInt(process.env.RAPIDMQ_RATE_LIMIT, 10) || 3; // 3 requests default

    const record = rateLimiter.get(mobile) || { count: 0, start: now };
    if (now - record.start > window) {
      record.count = 0;
      record.start = now;
    }

    if (record.count >= maxRequests) {
      throw new Error(MESSAGES.TOO_MANY_REQUESTS);
    }

    record.count += 1;
    rateLimiter.set(mobile, record);
  }

  static generateOTP() {
    return "123456"; // Fixed for testing, revert to random later if needed
    // For random OTP: return Math.floor(100000 + Math.random() * 900000).toString();
  }

  static async storeOTP(mobile, otp) {
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
    await OTP.deleteOne({ mobile });
    const otpDoc = new OTP({ mobile, otp, expiresAt });
    await otpDoc.save();
    logger.info(`OTP stored for mobile: ${mobile}`);
  }

  static async requestOTP(mobile) {
    await this.validateMobile(mobile);
    this.checkRateLimit(mobile);

    const otp = this.generateOTP();
    await this.storeOTP(mobile, otp);

    // Publish OTP to Notification Service via RabbitMQ
    if (notificationChannel) {
      const message = JSON.stringify({ mobile, otp });
      notificationChannel.sendToQueue('notification_queue', Buffer.from(message), { persistent: true });
      logger.info(`OTP ${otp} sent to notification queue for mobile: ${mobile}`);
    } else {
      logger.warn('RabbitMQ channel not initialized, skipping notification');
    }

    logger.info(`OTP ${otp} generated for mobile: ${mobile} (SMS pending)`);
    return { message: MESSAGES.OTP_SENT, maskedMobile: maskMobile(mobile) };
  }

  static async verifyOTP(mobile, otp) {
    const otpDoc = await OTP.findOne({ mobile });
    if (!otpDoc) {
      throw new Error(MESSAGES.INVALID_OTP);
    }

    if (otpDoc.failedAttempts >= MAX_FAILED_ATTEMPTS) {
      await OTP.deleteOne({ _id: otpDoc._id });
      throw new Error(MESSAGES.TOO_MANY_ATTEMPTS);
    }

    if (otpDoc.otp !== otp || otpDoc.expiresAt < new Date()) {
      otpDoc.failedAttempts += 1;
      await otpDoc.save();
      throw new Error(MESSAGES.INVALID_OTP);
    }

    const userId = `${mobile}-${Date.now()}`;
    const token = jwt.sign(
      { userId, role: USER_ROLE },
      process.env.JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    await OTP.deleteOne({ _id: otpDoc._id });
    rateLimiter.delete(mobile);

    logger.info(`User ${userId} authenticated successfully`);
    return { userId, token, maskedMobile: maskMobile(mobile) };
  }

  static async resendOTP(mobile) {
    await this.validateMobile(mobile);
    this.checkRateLimit(mobile);

    const otp = this.generateOTP();
    await this.storeOTP(mobile, otp);

    // Publish OTP to Notification Service via RabbitMQ
    if (notificationChannel) {
      const message = JSON.stringify({ mobile, otp });
      notificationChannel.sendToQueue('notification_queue', Buffer.from(message), { persistent: true });
      logger.info(`OTP ${otp} resent to notification queue for mobile: ${mobile}`);
    } else {
      logger.warn('RabbitMQ channel not initialized, skipping notification');
    }

    logger.info(`New OTP ${otp} resent for mobile: ${mobile} (SMS pending)`);
    return { message: MESSAGES.OTP_SENT, maskedMobile: maskMobile(mobile) };
  }
}

module.exports = AuthService;