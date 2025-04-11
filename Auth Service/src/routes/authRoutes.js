const express = require('express');
const router = express.Router();
const { requestOTP, verifyOTP, resendOTP } = require('../controllers/authController');
const { validateRequestOTP, validateVerifyOTP } = require('../middleware/validation');

router.post('/request-otp', validateRequestOTP, requestOTP);
router.post('/verify-otp', validateVerifyOTP, verifyOTP);
router.post('/resend-otp', validateRequestOTP, resendOTP);

module.exports = router;