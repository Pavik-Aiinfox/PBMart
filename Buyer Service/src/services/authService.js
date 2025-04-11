const jwt = require('jsonwebtoken');
const Buyer = require('../models/buyerModel');
const logger = require('../config/logger');
const { FIXED_OTP, MESSAGES } = require('../utils/constants');

class AuthService {
  static async signUp(buyerData) {
    const {
      fullName, mobile, email, businessName, panCardNumber, categories,
      businessAddress, gstin, businessType, turnover, accountNumber,
      ifscCode, bankName, bankPlace
    } = buyerData;

    const existingBuyer = await Buyer.findOne({ $or: [{ mobile }, { email }] });
    if (existingBuyer) {
      throw new Error(MESSAGES.BUYER_EXISTS);
    }

    const buyer = new Buyer({
      fullName,
      mobile,
      email,
      businessName,
      panCardNumber,
      categories,
      businessAddress,
      gstin,
      businessType,
      turnover,
      bankDetails: { accountNumber, ifscCode, bankName, bankPlace }
    });
    const token = jwt.sign(
        { buyerId: buyer._id,
            fullName: buyer.fullName,
            mobile: buyer.mobile,
            email: buyer.email,
         },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

    await buyer.save();
    logger.info(`New buyer registered: ${buyer._id}`);
    return { buyerId: buyer._id, token };
  }

  static async signIn({ mobile, otp }) {
    if (otp !== FIXED_OTP) {
      throw new Error(MESSAGES.INVALID_OTP);
    }

    const buyer = await Buyer.findOne({ mobile });
    if (!buyer) {
      throw new Error(MESSAGES.BUYER_NOT_FOUND);
    }

    const token = jwt.sign(
      { buyerId: buyer._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    logger.info(`Successful signin for buyer: ${buyer._id}`);
    return { buyerId: buyer._id, token };
  }
}

module.exports = AuthService;