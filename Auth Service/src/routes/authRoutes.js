const express = require('express');
const router = express.Router();
const {register, requestOTP, verifyOTP, resendOTP } = require('../controllers/authController');
const { validateRequestOTP, validateVerifyOTP,validateRegister } = require('../middleware/validation');


router.post('/register', validateRegister, register);
router.post('/request-otp', validateRequestOTP, requestOTP);
router.post('/verify-otp', validateVerifyOTP, verifyOTP);
router.post('/resend-otp', validateRequestOTP, resendOTP);

module.exports = router;