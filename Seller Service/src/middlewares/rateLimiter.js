const rateLimit = require('express-rate-limit');
const logger = require('../config/logger');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts, please try again later.',
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({ message: 'Too many login attempts, please try again later.' });
  },
});

const otpRequestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: 'Too many OTP requests, please try again later.',
  handler: (req, res) => {
    logger.warn(`OTP request limit exceeded for IP: ${req.ip}`);
    res.status(429).json({ message: 'Too many OTP requests, please try again later.' });
  },
});

module.exports = { loginLimiter, otpRequestLimiter };