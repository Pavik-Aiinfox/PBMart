const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const sellerSchema = new mongoose.Schema({
  seller_id: { type: String, default: uuidv4 },
  full_name: { type: String, required: false, maxlength: 100 },
  email: { type: String, required: false, unique: true, maxlength: 255, sparse: true },
  phone_number: { type: String, required: true, unique: true, maxlength: 15 },
  alternate_phone_number: { type: String, required: false, unique: true, maxlength: 15, sparse: true },
  password_hash: { type: String, required: false, maxlength: 255 },
  business_name: { type: String, required: false, maxlength: 255 },
  gstin: { type: String, maxlength: 15, sparse: true },
  pan_number: { type: String, maxlength: 10, sparse: true },
  business_type: {
    type: String,
    required: false,
    enum: ['Manufacturer', 'Wholesaler', 'Retailer', 'Service'],
  },
  address: {
    line1: { type: String, required: false, maxlength: 255 },
    line2: { type: String, maxlength: 255 },
    city: { type: String, required: false, maxlength: 100 },
    state: { type: String, required: false, maxlength: 100 },
    postal_code: { type: String, required: false, maxlength: 10 },
    country: { type: String, required: false, default: 'India', maxlength: 100 },
  },
  website_url: { type: String, maxlength: 255 },
  registration_date: { type: Date, required: false, default: Date.now },
  is_verified: { type: Boolean, required: false, default: false },
  last_login: { type: Date },
  verification_status: {
    type: String,
    required: false,
    enum: ['Pending', 'Verified', 'Rejected'],
    default: 'Pending',
  },
  profile_completion_percentage: { type: Number, required: false, default: 0, min: 0, max: 100 },
  bank_details: {
    account_number: { type: String, maxlength: 100 },
    ifsc_code: { type: String, maxlength: 11 },
    bank_name: { type: String, maxlength: 100 },
    account_holder_name: { type: String, maxlength: 100 },
  },
  created_at: { type: Date, required: false, default: Date.now },
  updated_at: { type: Date, required: false, default: Date.now },
  registration_status: { type: String, enum: ['pending', 'completed'], default: 'pending' }, // New field
});

// Indexes
sellerSchema.index({ email: 1 }, { unique: true, sparse: true });
sellerSchema.index({ phone_number: 1 }, { unique: true, sparse: false });
sellerSchema.index({ alternate_phone_number: 1 }, { unique: true, sparse: true });
sellerSchema.index({ verification_status: 1 });

// Pre-save hook
sellerSchema.pre('save', async function (next) {
  if (this.isModified('password_hash') && this.password_hash) {
    this.password_hash = await bcrypt.hash(this.password_hash, 10);
  }
  this.updated_at = Date.now();
  next();
});

const Seller = mongoose.model('Seller', sellerSchema);

module.exports = Seller;