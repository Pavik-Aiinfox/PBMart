const express = require('express');
const router = express.Router();
const { signup, requestSigninOtp, signin, verifyPhoneNumber } = require('../controllers/sellerControllers');
const { loginLimiter, otpRequestLimiter } = require('../middlewares/rateLimiter');

router.post('/signup', signup);
router.post('/request-signin-otp', otpRequestLimiter, requestSigninOtp);
router.post('/signin', loginLimiter, signin);
router.get('/verify-PhoneNumber', verifyPhoneNumber);

module.exports = router;