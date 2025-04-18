const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config');
const logger = require('../config/logger');

const generateToken = (seller, expiresIn = '7d') => {
  try {
    return jwt.sign({ id: seller._id, phone_number: seller.phone_number }, jwtSecret, { expiresIn });
  } catch (error) {
    logger.error(`Error generating JWT: ${error.message}`);
    throw error;
  }
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, jwtSecret);
  } catch (error) {
    logger.error(`Error verifying JWT: ${error.message}`);
    throw error;
  }
};

const generateVerificationToken = (seller) => {
  try {
    return jwt.sign({ id: seller._id, phone_number: seller.phone_number }, jwtSecret, { expiresIn: '24h' });
  } catch (error) {
    logger.error(`Error generating verification token: ${error.message}`);
    throw error;
  }
};

module.exports = { generateToken, verifyToken, generateVerificationToken };