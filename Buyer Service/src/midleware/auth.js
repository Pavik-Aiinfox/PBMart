const jwt = require('jsonwebtoken');
const logger = require('../config/logger');
const { errorResponse } = require('../utils/response');
const { STATUS_CODES, MESSAGES } = require('../utils/constants');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    logger.warn('No token provided in request');
    return errorResponse(res, MESSAGES.UNAUTHORIZED, STATUS_CODES.UNAUTHORIZED);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.buyerId = decoded.buyerId;
    next();
  } catch (error) {
    logger.warn(`Invalid token: ${error.message}`);
    return errorResponse(res, MESSAGES.UNAUTHORIZED, STATUS_CODES.UNAUTHORIZED);
  }
};

module.exports = { authenticateToken };