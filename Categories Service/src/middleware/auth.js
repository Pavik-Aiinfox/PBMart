const jwt = require('jsonwebtoken');

const authenticateJWT = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'No token provided' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ success: false, message: 'Invalid token' });
    req.user = decoded;
    if (req.user.role !== 'admin' && req.method !== 'GET') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    next();
  });
};

module.exports = { authenticateJWT };