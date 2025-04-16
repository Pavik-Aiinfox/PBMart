const Joi = require('joi');

const signupSchema = Joi.object({
  full_name: Joi.string().max(100).required(),
  email: Joi.string().email().max(255).required(),
  phone_number: Joi.string().max(15).required(),
  alternate_phone_number: Joi.string().max(15).required(),
  password: Joi.string()
    .min(8)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])'))
    .required(),
  business_name: Joi.string().max(255).required(),
  business_type: Joi.string().valid('Manufacturer', 'Wholesaler', 'Retailer', 'Service').required(),
  address: Joi.object({
    line1: Joi.string().max(255).required(),
    line2: Joi.string().max(255).optional(),
    city: Joi.string().max(100).required(),
    state: Joi.string().max(100).required(),
    postal_code: Joi.string().max(10).required(),
    country: Joi.string().max(100).default('India'),
  }).required(),
  gstin: Joi.string().max(15).optional(),
  pan_number: Joi.string().max(10).optional(),
  website_url: Joi.string().max(255).optional(),
  bank_details: Joi.object({
    account_number: Joi.string().max(50).optional(),
    ifsc_code: Joi.string().max(11).optional(),
    bank_name: Joi.string().max(100).optional(),
    account_holder_name: Joi.string().max(100).optional(),
  }).optional(),
});

const signinSchema = Joi.object({
  phone_number: Joi.string().max(15).required(),
  otp: Joi.string().valid('123456').required(),
});

const requestSigninOtpSchema = Joi.object({
  phone_number: Joi.string().max(15).required(),
});

module.exports = { signupSchema, signinSchema, requestSigninOtpSchema };