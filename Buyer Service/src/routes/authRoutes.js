const express = require('express');
const router = express.Router();
const { signUp, signIn, verifyOTP } = require('../controllers/authController');
const { validateSignUp, validateSignIn, validateVerifyOTP } = require('../midleware/validation');
const { authenticateToken } = require('../midleware/auth');

router.post('/signup', validateSignUp, signUp);
router.post('/signin', validateSignIn, signIn);
router.post('/verifyOTP', validateVerifyOTP, verifyOTP);

router.get('/profile', authenticateToken, (req, res) => {
  res.json({ success: true, message: 'Protected route accessed', buyerId: req.buyerId });
});

module.exports = router;