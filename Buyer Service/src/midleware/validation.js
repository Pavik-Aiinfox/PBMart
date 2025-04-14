const Joi = require('joi');
const logger = require('../config/logger');
const { errorResponse } = require('../utils/response');

const signUpSchema = Joi.object({
  fullName: Joi.string().required().messages({
    'string.empty': 'Full name is required',
  }),
  mobile: Joi.string().pattern(/^\d{10}$/).required().messages({
    'string.pattern.base': 'Mobile number must be 10 digits',
    'string.empty': 'Mobile number is required',
  }),
  email: Joi.string().email().max(255).optional().messages({
    'string.email': 'Invalid email format',
    'string.max': 'Email must not exceed 255 characters',
  }),
  businessName: Joi.string().max(100).optional(),
  panCardNumber: Joi.string().pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/).optional().messages({
    'string.pattern.base': 'Invalid PAN card number format',
  }),
  categories: Joi.array().items(Joi.string()).optional(),
  businessAddress: Joi.string().max(500).optional(),
  gstin: Joi.string().pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9]{1}Z[0-9A-Z]{1}$/).optional().messages({
    'string.pattern.base': 'Invalid GSTIN format',
  }),
  businessType: Joi.string().optional(),
  turnover: Joi.string().optional(),
  bankDetails: Joi.object({
    accountNumber: Joi.string().optional(),
    ifscCode: Joi.string().pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/).optional().messages({
      'string.pattern.base': 'Invalid IFSC code format',
    }),
    bankName: Joi.string().optional(),
    bankPlace: Joi.string().optional(),
  }).optional(),
});

const signInSchema = Joi.object({
  mobile: Joi.string().pattern(/^\d{10}$/).required().messages({
    'string.pattern.base': 'Mobile number must be 10 digits',
    'string.empty': 'Mobile number is required',
  }),
});

const verifyOTPSchema = Joi.object({
  mobile: Joi.string().pattern(/^\d{10}$/).required().messages({
    'string.pattern.base': 'Mobile number must be 10 digits',
    'string.empty': 'Mobile number is required',
  }),
  otp: Joi.string().required().messages({
    'string.empty': 'OTP is required',
  }),
});

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const errorMessage = error.details.map((detail) => detail.message).join(', ');
      logger.warn(`Validation failed: ${errorMessage}`);
      return errorResponse(res, errorMessage);
    }
    next();
  };
};

module.exports = {
  validateSignUp: validate(signUpSchema),
  validateSignIn: validate(signInSchema),
  validateVerifyOTP: validate(verifyOTPSchema),
};