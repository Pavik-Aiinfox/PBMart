const jwt = require('jsonwebtoken');
const logger = require('../config/logger');

const authenticateJWT = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Expect { sub: userId, role: 'seller' | 'buyer' | 'admin' }
    next();
  } catch (error) {
    logger.error('JWT verification failed:', error.message);
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

const authorizeSeller = (req, res, next) => {
  if (!req.user || req.user.role !== 'seller') {
    return res.status(403).json({ success: false, message: 'Seller role required' });
  }
  next();
};

module.exports = { authenticateJWT, authorizeSeller };