const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const productSchema = new mongoose.Schema({
  id: { type: String, default: uuidv4, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  images: [String], // Can store base64 strings or file paths
  stock: { type: Number, required: true, min: 0 },
  sellerId: { type: String, required: true },
  categoryId: { type: String, required: true },
  status: { type: String, enum: ['active', 'inactive', 'outofstock'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Auto-update updatedAt on save or update
productSchema.pre('findOneAndUpdate', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;