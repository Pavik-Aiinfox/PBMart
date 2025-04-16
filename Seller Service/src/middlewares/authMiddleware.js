const { verifyToken } = require('../utils/jwtUtils');
const logger = require('../config/logger');

const authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    logger.warn('No token provided');
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = verifyToken(token);
    req.seller = decoded;
    next();
  } catch (error) {
    logger.error(`Invalid token: ${error.message}`);
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = authMiddleware;