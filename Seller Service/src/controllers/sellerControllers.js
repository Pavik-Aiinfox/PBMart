const Seller = require('../models/Seller');
const { signupSchema, signinSchema, requestSigninOtpSchema, registerPhoneSchema, verifyOtpSchema } = require('./../utils/sellerValidation');
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

    // Check for existing seller with the same phone_number
    let existingSeller = await Seller.findOne({ phone_number });
    if (existingSeller) {
      if (existingSeller.registration_status === 'completed') {
        logger.warn(`Signup attempt with existing completed profile: ${phone_number}`);
        return res.status(400).json({ message: 'Phone number already registered with a completed profile' });
      }
      // Update existing pending seller
      existingSeller.full_name = full_name;
      existingSeller.email = email;
      existingSeller.alternate_phone_number = alternate_phone_number;
      existingSeller.password_hash = password;
      existingSeller.business_name = business_name;
      existingSeller.business_type = business_type;
      existingSeller.address = address;
      existingSeller.gstin = gstin;
      existingSeller.pan_number = pan_number;
      existingSeller.website_url = website_url;

      let encryptedBankDetails = bank_details;
      if (bank_details?.account_number) {
        encryptedBankDetails = {
          ...bank_details,
          account_number: encrypt(bank_details.account_number),
        };
      }
      existingSeller.bank_details = encryptedBankDetails;

      existingSeller.profile_completion_percentage = calculateProfileCompletion({
        full_name, email, phone_number, alternate_phone_number, password_hash: password, business_name, business_type, address, gstin, pan_number, website_url, bank_details
      });
      existingSeller.registration_status = 'completed';
      await existingSeller.save();
      logger.info(`Existing pending seller updated during signup: ${phone_number}`);
    } else {
      // Create new seller if no pending profile exists
      const newSeller = new Seller({
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
        registration_status: 'completed',
      });
      await newSeller.save();
      existingSeller = newSeller;
      logger.info(`New seller created during signup: ${phone_number}`);
    }

    const verificationToken = generateVerificationToken(existingSeller);
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

const registerPhone = async (req, res, next) => {
  try {
    const { error } = registerPhoneSchema.validate(req.body);
    if (error) {
      logger.warn(`Validation error during phone registration: ${error.details[0].message}`);
      return res.status(400).json({ message: error.details[0].message });
    }

    const { phone_number } = req.body;
    const fixedOtp = '123456';

    let seller = await Seller.findOne({ phone_number });
    if (seller) {
      // Update existing phone number
      seller.phone_number = phone_number;
      seller.updated_at = new Date();
      seller.registration_status = 'pending'; // Ensure status is pending
      logger.info(`Phone number updated for seller: ${phone_number}`);
      await seller.save({ validateBeforeSave: false });
    } else {
      // Create new seller with minimal data
      seller = new Seller({
        phone_number,
        profile_completion_percentage: calculateProfileCompletion({ phone_number }),
        registration_status: 'pending', // Set as pending
      });
      logger.info(`New seller registered with phone: ${phone_number}`);
      await seller.save({ validateBeforeSave: false });
    }

    const token = generateToken(seller, '7d');
    logger.info(`OTP sent and JWT generated for phone: ${phone_number}, OTP: ${fixedOtp}`);

    res.status(200).json({
      message: 'Phone registration successful, OTP sent',
      otp: fixedOtp,
      token,
    });
  } catch (error) {
    logger.error(`Phone registration error: ${error.message}`);
    next(error);
  }
};

const verifyOtp = async (req, res, next) => {
  try {
    const { error } = verifyOtpSchema.validate(req.body);
    if (error) {
      logger.warn(`Validation error during OTP verification: ${error.details[0].message}`);
      return res.status(400).json({ message: error.details[0].message });
    }

    const { phone_number, otp } = req.body;
    const seller = await Seller.findOne({ phone_number });

    if (!seller) {
      logger.warn(`OTP verification attempt with non-existent phone: ${phone_number}`);
      return res.status(404).json({ message: 'Seller not found' });
    }

    if (otp !== '123456') {
      logger.warn(`Invalid OTP attempt for phone: ${phone_number}`);
      return res.status(401).json({ message: 'Invalid OTP' });
    }

    seller.is_verified = true;
    seller.verification_status = 'Verified';
    seller.updated_at = new Date();
    await seller.save();

    const token = generateToken(seller, '7d');
    logger.info(`OTP verified successfully for phone: ${phone_number}`);

    res.status(200).json({
      message: 'OTP verified successfully',
      token,
    });
  } catch (error) {
    logger.error(`OTP verification error: ${error.message}`);
    next(error);
  }
};

const getalldata = async (req, res, next) => {
  try {
    // Fetch all sellers from the database
    const sellers = await Seller.find();

    // Return success response with all seller data
    return res.status(200).json({
      success: true,
      message: 'All data retrieved successfully',
      data: sellers,
    });
  } catch (error) {
    logger.error(`Error in getalldata: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};


const getDataById = async (req, res, next) => {
  try {
    const { seller_id } = req.params;
    // Fetch seller data by ID from the database
    const seller = await Seller.findById(seller_id);
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found',
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Seller data retrieved successfully',
      data: seller,
    });
  } catch (error) {
    logger.error(`Error in getDataById: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}

module.exports = { signup, requestSigninOtp, signin, verifyPhoneNumber, registerPhone, verifyOtp, getalldata, getDataById };
