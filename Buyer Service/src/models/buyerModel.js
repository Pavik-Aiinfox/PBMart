const mongoose = require('mongoose');

const buyerSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  mobile: { type: String, required: true, unique: true },
  email: { type: String, unique: true, sparse: true },
  businessName: String,
  panCardNumber: String,
  categories: [String],
  businessAddress: String,
  gstin: String,
  businessType: String,
  turnover: String,
  bankDetails: {
    accountNumber: String,
    ifscCode: String,
    bankName: String,
    bankPlace: String
  },
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
}, {
  timestamps: { updatedAt: 'updatedAt' }
});

buyerSchema.index({ mobile: 1 }, { unique: true });
buyerSchema.index({ email: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Buyer', buyerSchema, 'buyers');