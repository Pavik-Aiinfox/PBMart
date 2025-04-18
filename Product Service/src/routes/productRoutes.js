const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const { validateProduct, validateBulkUpload } = require('../middleware/validate');
const { authenticateJWT, authorizeSeller } = require('../middleware/authMiddleware');
const fs = require('fs'); // Required for bulk upload (CSV handling)

router.post('/', 
  process.env.NODE_ENV === 'development' ? (req, res, next) => next() : authenticateJWT,
  process.env.NODE_ENV === 'development' ? (req, res, next) => next() : authorizeSeller,
  validateProduct,
  async (req, res) => {
    try {
      console.log('Raw req.body:', req.body);
      const { name, description, price, stock, sellerId, categoryId,subCategoryId, images } = req.body;
      if (!name || !description || !price || !stock || !sellerId || !categoryId || !subCategoryId) {
        throw new Error('Missing required fields');
      }

      const imageBase64 = images || [];
      if (!Array.isArray(imageBase64)) {
        throw new Error('Images must be an array of base64 strings');
      }

      const product = new Product({
        name,
        description,
        price: Number(price),
        stock: Number(stock),
        sellerId: sellerId || 'test-seller',
        categoryId,
        subCategoryId,
        images: imageBase64,
      });
      await product.save();

      // Transform the response to include only desired fields
      const responseProduct = {
        id: product.id, // Assuming 'id' is the UUID field
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        sellerId: product.sellerId,
        categoryId: product.categoryId,
        subCategoryId: product.subCategoryId,
        images: product.images,
        status: product.status,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      };

      res.status(201).json({ success: true, data: responseProduct });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
);

router.put('/:id', async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      { id: req.params.id, sellerId: req.body.sellerId || 'test-seller' },
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    if (!product) throw new Error('Product not found or unauthorized');
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/:id', 
  process.env.NODE_ENV === 'development' ? (req, res, next) => next() : authenticateJWT,
  process.env.NODE_ENV === 'development' ? (req, res, next) => next() : authorizeSeller,
  async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      { id: req.params.id, sellerId: req.body.sellerId || 'test-seller' },
      { status: 'inactive', updatedAt: Date.now() },
      { new: true }
    );
    if (!product) throw new Error('Product not found or unauthorized');
    res.json({ success: true, message: 'Product soft deleted' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findOne({ id: req.params.id, status: 'active' });
    if (!product) throw new Error('Product not found');
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const { categoryId, subCategoryId, priceMin, priceMax, keyword } = req.query;
    let query = { status: 'active' };

    if (categoryId) query.categoryId = categoryId;
    if (subCategoryId) query.subCategoryId = subCategoryId;
    if (priceMin || priceMax) {
      query.price = {};
      if (priceMin) query.price.$gte = Number(priceMin);
      if (priceMax) query.price.$lte = Number(priceMax);
    }
    if (keyword) query.name = { $regex: keyword, $options: 'i' };

    const products = await Product.find(query);
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post('/bulk', 
  process.env.NODE_ENV === 'development' ? (req, res, next) => next() : authenticateJWT,
  process.env.NODE_ENV === 'development' ? (req, res, next) => next() : authorizeSeller,
  validateBulkUpload, 
  async (req, res) => {
  try {
    if (!req.file) throw new Error('No file uploaded');

    const products = [];
    fs.createReadStream(req.file.path)
      .pipe(csv.parse({ columns: true, trim: true }))
      .on('data', (data) => products.push(data))
      .on('end', async () => {
        const validProducts = products.map(p => ({
          ...p,
          price: Number(p.price),
          stock: Number(p.stock),
          sellerId: p.sellerId || 'test-seller',
          status: 'active',
          images: p.images ? p.images.split(',').map(img => img.trim()) : [] // Assuming CSV has image paths or base64
        }));
        await Product.insertMany(validProducts);
        res.json({ success: true, message: 'Bulk upload successful', count: validProducts.length });
      })
      .on('error', (error) => {
        res.status(400).json({ success: false, message: error.message });
      });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;