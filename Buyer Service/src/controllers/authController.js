const AuthService = require('../services/authService');
const { successResponse, errorResponse } = require('../utils/response');
const { STATUS_CODES, MESSAGES } = require('../utils/constants');
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
    const result = await AuthService.signIn(req.body);
    successResponse(res, result, MESSAGES.SIGNIN_SUCCESS);
  } catch (error) {
    logger.error(`Signin error: ${error.message}`);
    const status = error.message === MESSAGES.BUYER_NOT_FOUND ? 
      STATUS_CODES.NOT_FOUND : STATUS_CODES.BAD_REQUEST;
    errorResponse(res, error.message, status);
  }
};

module.exports = { signUp, signIn };