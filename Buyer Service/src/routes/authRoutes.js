const express = require('express');
const router = express.Router();
const { signUp, signIn } = require('../controllers/authController');
const { validateSignUp, validateSignIn } = require('../midleware/validation');
const { authenticateToken } = require('../midleware/auth');

router.post('/signup', validateSignUp, signUp);
router.post('/signin', validateSignIn, signIn);

// Example protected route
router.get('/profile', authenticateToken, (req, res) => {
  res.json({ success: true, message: 'Protected route accessed', buyerId: req.buyerId });
});

module.exports = router;