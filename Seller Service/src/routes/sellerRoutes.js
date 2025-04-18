const express = require('express');
const router = express.Router();
const { signup, requestSigninOtp, signin, verifyPhoneNumber, registerPhone, verifyOtp, getalldata,getDataById } = require('../controllers/sellerControllers');
const { loginLimiter, otpRequestLimiter } = require('../middlewares/rateLimiter');

router.post('/signup', signup);
router.post('/request-signin-otp', otpRequestLimiter, requestSigninOtp);
router.post('/signin', loginLimiter, signin);
router.get('/verify-PhoneNumber', verifyPhoneNumber);
router.post('/register-phone', registerPhone);
router.post('/verify-otp', verifyOtp);
router.get('/get-data', getalldata);
router.get('/get-data/:id', getDataById);

module.exports = router;