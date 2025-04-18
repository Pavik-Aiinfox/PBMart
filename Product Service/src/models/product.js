const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const productSchema = new mongoose.Schema({
  id: { type: String, default: uuidv4, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  images: [String],
  stock: { type: Number, required: true, min: 0 },
  sellerId: { type: String, required: true },
  categoryId: { type: String, required: true },
  subCategoryId: { type: String, required: true },
  status: { type: String, enum: ['active', 'inactive', 'outofstock'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, {
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret.id; // Keep custom UUID id
      delete ret._id; // Remove MongoDB _id
      delete ret.__v; // Remove version key
      return ret;
    },
  },
});

// Auto-update updatedAt on save or update
productSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() }); // Use set() for findOneAndUpdate
  next();
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;