const AuthService = require('../services/authService');
const { successResponse, errorResponse } = require('../utils/response');
const { STATUS_CODES, MESSAGES, FIXED_OTP } = require('../utils/constants');
const logger = require('../config/logger');

const signUp = async (req, res) => {
  try {
    const result = await AuthService.signUp(req.body);
    successResponse(res, result, MESSAGES.SIGNUP_SUCCESS);
  } catch (error) {
    logger.error(`Signup error: ${error.message}`);
    const status = error.message === MESSAGES.BUYER_EXISTS ? 
      STATUS_CODES.BAD_REQUEST : STATUS_CODES.SERVER_ERROR;
    errorResponse(res, error.message, status);
  }
};

const signIn = async (req, res) => {
  try {
    const { mobile } = req.body;
    
    const userExists = await AuthService.checkUserExists(mobile);
    
    if (!userExists) {
      return errorResponse(
        res,
        'User not registered. Please sign up first.',
        STATUS_CODES.NOT_FOUND
      );
    }

    const otp = FIXED_OTP;
    await AuthService.sendOTP(mobile, otp);

    successResponse(res, { mobile, otpSent: true }, 'OTP sent successfully');
  } catch (error) {
    logger.error(`Signin error: ${error.message}`);
    errorResponse(res, error.message, STATUS_CODES.SERVER_ERROR);
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { mobile, otp } = req.body;
    if (otp !== FIXED_OTP) {
      return errorResponse(res, MESSAGES.INVALID_OTP, STATUS_CODES.BAD_REQUEST);
    }

    const result = await AuthService.signIn({ mobile });
    successResponse(res, result, 'Login successful');
  } catch (error) {
    logger.error(`OTP verification error: ${error.message}`);
    errorResponse(res, error.message, STATUS_CODES.SERVER_ERROR);
  }
};

module.exports = { signUp, signIn, verifyOTP };