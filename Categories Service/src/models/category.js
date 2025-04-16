const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  attributes: [{ name: String, value: String }],
  image: { type: String, default: null }, // Store base64 image for categories only
  description: { type: String, default: '' }, // Description field
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Category', categorySchema);