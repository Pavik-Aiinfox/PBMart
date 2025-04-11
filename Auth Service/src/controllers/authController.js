const AuthService = require('../services/authService');
const { successResponse, errorResponse } = require('../utils/response');
const { STATUS_CODES, MESSAGES } = require('../utils/constants');
const logger = require('../config/logger');

const requestOTP = async (req, res) => {
  try {
    const { mobile } = req.body;
    const result = await AuthService.requestOTP(mobile);
    successResponse(res, result, MESSAGES.OTP_SENT);
  } catch (error) {
    logger.error(`Request OTP error: ${error.message}`);
    const status = {
      [MESSAGES.MOBILE_IN_USE]: STATUS_CODES.BAD_REQUEST,
      [MESSAGES.TOO_MANY_REQUESTS]: STATUS_CODES.TOO_MANY_REQUESTS
    }[error.message] || STATUS_CODES.SERVER_ERROR;
    errorResponse(res, error.message, status);
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { mobile, otp } = req.body;
    const result = await AuthService.verifyOTP(mobile, otp);
    successResponse(res, result, MESSAGES.SIGNUP_SUCCESS);
  } catch (error) {
    logger.error(`Verify OTP error: ${error.message}`);
    const status = {
      [MESSAGES.INVALID_OTP]: STATUS_CODES.BAD_REQUEST,
      [MESSAGES.TOO_MANY_ATTEMPTS]: STATUS_CODES.BAD_REQUEST
    }[error.message] || STATUS_CODES.SERVER_ERROR;
    errorResponse(res, error.message, status);
  }
};

const resendOTP = async (req, res) => {
  try {
    const { mobile } = req.body;
    const result = await AuthService.resendOTP(mobile);
    successResponse(res, result, MESSAGES.OTP_SENT);
  } catch (error) {
    logger.error(`Resend OTP error: ${error.message}`);
    const status = {
      [MESSAGES.MOBILE_IN_USE]: STATUS_CODES.BAD_REQUEST,
      [MESSAGES.TOO_MANY_REQUESTS]: STATUS_CODES.TOO_MANY_REQUESTS
    }[error.message] || STATUS_CODES.SERVER_ERROR;
    errorResponse(res, error.message, status);
  }
};

module.exports = { requestOTP, verifyOTP, resendOTP };