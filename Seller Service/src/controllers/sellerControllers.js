const Seller = require('../models/Seller');
const { signupSchema, signinSchema, requestSigninOtpSchema } = require('./../utils/sellerValidation');
const { generateToken, generateVerificationToken, verifyToken } = require('../utils/jwtUtils');
const { calculateProfileCompletion } = require('../utils/profileCompletion');
const { encrypt } = require('../services/encryptionService');
const bcrypt = require('bcryptjs');
const logger = require('../config/logger');

const signup = async (req, res, next) => {
  try {
    const { error } = signupSchema.validate(req.body);
    if (error) {
      logger.warn(`Validation error during signup: ${error.details[0].message}`);
      return res.status(400).json({ message: error.details[0].message });
    }

    const {
      full_name, email, phone_number, alternate_phone_number, password, business_name, business_type, address,
      gstin, pan_number, website_url, bank_details
    } = req.body;

    const existingSeller = await Seller.findOne({ $or: [{ email }, { phone_number }, { alternate_phone_number }] });
    if (existingSeller) {
      logger.warn(`Signup attempt with existing email or phone: ${email}, ${phone_number}, ${alternate_phone_number}`);
      return res.status(400).json({ message: 'Email or phone number already exists' });
    }

    let encryptedBankDetails = bank_details;
    if (bank_details?.account_number) {
      encryptedBankDetails = {
        ...bank_details,
        account_number: encrypt(bank_details.account_number),
      };
    }

    const seller = new Seller({
      full_name,
      email,
      phone_number,
      alternate_phone_number,
      password_hash: password,
      business_name,
      business_type,
      address,
      gstin,
      pan_number,
      website_url,
      bank_details: encryptedBankDetails,
      profile_completion_percentage: calculateProfileCompletion({
        full_name, email, phone_number, alternate_phone_number, password_hash: password, business_name, business_type, address, gstin, pan_number, website_url, bank_details
      }),
    });

    await seller.save();

    const verificationToken = generateVerificationToken(seller);
    logger.info(`Verification token generated for phone: ${phone_number}`);

    res.status(201).json({ 
      message: 'Signup successful.',
      verificationToken
    });
  } catch (error) {
    logger.error(`Signup error: ${error.message}`);
    next(error);
  }
};

const requestSigninOtp = async (req, res, next) => {
  try {
    const { error } = requestSigninOtpSchema.validate(req.body);
    if (error) {
      logger.warn(`Validation error during OTP request: ${error.details[0].message}`);
      return res.status(400).json({ message: error.details[0].message });
    }

    // const { phone_number } = req.body;
    // const seller = await Seller.findOne({ phone_number });

    // Fixed OTP for testing
    const fixedOtp = '123456';
    logger.info(`OTP generated for phone: ${phone_number}, OTP: ${fixedOtp}`);

    res.json({ message: 'OTP sent successfully', otp: fixedOtp }); // Return OTP for testing
  } catch (error) {
    logger.error(`OTP request error: ${error.message}`);
    next(error);
  }
};

const signin = async (req, res, next) => {
  try {
    const { error } = signinSchema.validate(req.body);
    if (error) {
      logger.warn(`Validation error during signin: ${error.details[0].message}`);
      return res.status(400).json({ message: error.details[0].message });
    }

    const { phone_number, otp } = req.body;
    const seller = await Seller.findOne({ phone_number });
    if (!seller) {
      logger.warn(`Signin attempt with non-existent phone: ${phone_number}`);
      return res.status(401).json({ message: 'Invalid phone number or OTP' });
    }

    if (otp !== '123456') {
      logger.warn(`Invalid OTP attempt: ${phone_number}`);
      return res.status(401).json({ message: 'Invalid phone number or OTP' });
    }

    seller.last_login = new Date();
    await seller.save();

    const token = generateToken(seller, '7d');
    logger.info(`Seller signed in successfully: ${phone_number}`);
    res.json({ token, message: 'Signin successful' });
  } catch (error) {
    logger.error(`Signin error: ${error.message}`);
    next(error);
  }
};

const verifyPhoneNumber = async (req, res, next) => {
    try {
      const authHeader = req.header('Authorization');
      if (!authHeader) {
        logger.warn('No Authorization header provided');
        return res.status(400).json({ message: 'No Authorization header provided' });
      }
  
      if (!authHeader.startsWith('Bearer ')) {
        logger.warn('Invalid Authorization header format');
        return res.status(400).json({ message: 'Invalid Authorization header format' });
      }
  
      const token = authHeader.replace('Bearer ', '');
      if (!token) {
        logger.warn('No token provided in Authorization header');
        return res.status(400).json({ message: 'No token provided' });
      }
  
      const decoded = verifyToken(token);
      const seller = await Seller.findById(decoded.id);
      if (!seller) {
        logger.warn(`Verification attempt for non-existent seller: ${decoded.phone_number}`);
        return res.status(404).json({ message: 'Seller not found' });
      }
  
      if (seller.is_verified) {
        logger.info(`Phone number already verified: ${seller.phone_number}`);
        return res.status(200).json({ message: 'Phone number already verified' });
      }
  
      seller.is_verified = true;
      seller.verification_status = 'Verified';
      await seller.save();
  
      logger.info(`Phone number verified successfully: ${seller.phone_number}`);
      res.json({ message: 'Phone number verified successfully' });
    } catch (error) {
      logger.error(`Phone number verification error: ${error.message}`);
      next(error);
    }
  };
  

module.exports = { signup, requestSigninOtp, signin, verifyPhoneNumber };