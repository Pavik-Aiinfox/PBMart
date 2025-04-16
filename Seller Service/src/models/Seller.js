const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const sellerSchema = new mongoose.Schema({
  full_name: { type: String, required: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, maxlength: 255 },
  phone_number: { type: String, required: true, unique: true, maxlength: 15 },
  alternate_phone_number: { type: String, required: true, unique: true, maxlength: 15 },
  password_hash: { type: String, required: true, maxlength: 255 },
  business_name: { type: String, required: true, maxlength: 255 },
  gstin: { type: String, maxlength: 15, sparse: true },
  pan_number: { type: String, maxlength: 10, sparse: true },
  business_type: {
    type: String,
    required: true,
    enum: ['Manufacturer', 'Wholesaler', 'Retailer', 'Service'],
  },
  address: {
    line1: { type: String, required: true, maxlength: 255 },
    line2: { type: String, maxlength: 255 },
    city: { type: String, required: true, maxlength: 100 },
    state: { type: String, required: true, maxlength: 100 },
    postal_code: { type: String, required: true, maxlength: 10 },
    country: { type: String, required: true, default: 'India', maxlength: 100 },
  },
  website_url: { type: String, maxlength: 255 },
  registration_date: { type: Date, required: true, default: Date.now },
  is_verified: { type: Boolean, required: true, default: false },
  last_login: { type: Date },
  verification_status: {
    type: String,
    required: true,
    enum: ['Pending', 'Verified', 'Rejected'],
    default: 'Pending',
  },
  profile_completion_percentage: { type: Number, required: true, default: 0, min: 0, max: 100 },
  bank_details: {
    account_number: { type: String, maxlength: 100 }, // Increased to handle encrypted value
    ifsc_code: { type: String, maxlength: 11 },
    bank_name: { type: String, maxlength: 100 },
    account_holder_name: { type: String, maxlength: 100 },
  },
  created_at: { type: Date, required: true, default: Date.now },
  updated_at: { type: Date, required: true, default: Date.now },
});

// Index only for verification_status
sellerSchema.index({ verification_status: 1 });

// Pre-save hook for password hashing
sellerSchema.pre('save', async function (next) {
  if (this.isModified('password_hash')) {
    this.password_hash = await bcrypt.hash(this.password_hash, 10);
  }
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model('Seller', sellerSchema);