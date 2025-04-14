const Joi = require('joi');
const logger = require('../config/logger');
const { errorResponse } = require('../utils/response');


const registerSchema = Joi.object({
  mobile: Joi.string().pattern(/^\d{10}$/).required().messages({
    'string.pattern.base': 'Mobile number must be 10 digits',
    'string.empty': 'Mobile number is required'
  })
});
const requestOTPSchema = Joi.object({
  mobile: Joi.string().pattern(/^\d{10}$/).required().messages({
    'string.pattern.base': 'Mobile number must be 10 digits',
    'string.empty': 'Mobile number is required'
  })
});

const verifyOTPSchema = Joi.object({
  mobile: Joi.string().pattern(/^\d{10}$/).required().messages({
    'string.pattern.base': 'Mobile number must be 10 digits',
    'string.empty': 'Mobile number is required'
  }),
  otp: Joi.string().length(6).required().messages({
    'string.length': 'OTP must be 6 digits',
    'string.empty': 'OTP is required'
  })
});

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      logger.warn(`Validation failed: ${error.details[0].message}`);
      return errorResponse(res, error.details[0].message);
    }
    next();
  };
};

module.exports = {
  validateRequestOTP: validate(requestOTPSchema),
  validateVerifyOTP: validate(verifyOTPSchema),
  validateRegister: validate(registerSchema)
};