const Joi = require('joi');
const logger = require('../config/logger');
const { errorResponse } = require('../utils/response');

const signUpSchema = Joi.object({
  fullName: Joi.string().required().messages({
    'string.empty': 'Full name is required'
  }),
  mobile: Joi.string().pattern(/^\d{10}$/).required().messages({
    'string.pattern.base': 'Mobile number must be 10 digits',
    'string.empty': 'Mobile number is required'
  }),
  email: Joi.string().email().optional(),
  businessName: Joi.string().optional(),
  panCardNumber: Joi.string().optional(),
  categories: Joi.array().items(Joi.string()).optional(),
  businessAddress: Joi.string().optional(),
  gstin: Joi.string().optional(),
  businessType: Joi.string().optional(),
  turnover: Joi.string().optional(),
  bankDetails: Joi.object({
    accountNumber: Joi.string().optional(),
    ifscCode: Joi.string().optional(),
    bankName: Joi.string().optional(),
    bankPlace: Joi.string().optional()
  }).optional(),
});

const signInSchema = Joi.object({
  mobile: Joi.string().pattern(/^\d{10}$/).required().messages({
    'string.pattern.base': 'Mobile number must be 10 digits',
    'string.empty': 'Mobile number is required'
  }),
  otp: Joi.string().required().messages({
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
  validateSignUp: validate(signUpSchema),
  validateSignIn: validate(signInSchema)
};