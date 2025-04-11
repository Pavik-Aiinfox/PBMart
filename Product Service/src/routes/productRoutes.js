const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const { validateProduct, validateBulkUpload } = require('../middleware/validate');
const { authenticateJWT, authorizeSeller } = require('../middleware/authMiddleware');

router.post('/', 
  process.env.NODE_ENV === 'development' ? (req, res, next) => next() : authenticateJWT,
  process.env.NODE_ENV === 'development' ? (req, res, next) => next() : authorizeSeller,
  validateProduct,
  async (req, res) => {
  try {
    // Debug logs
    console.log('Request Body:', req.body);
    console.log('Request Files:', req.files);

    const { name, description, price, stock, sellerId, categoryId } = req.body;
    if (!name || !description || !price || !stock || !sellerId || !categoryId) {
      throw new Error('Missing required fields');
    }

    // Handle images
    const imagePaths = req.files && req.files['images'] 
      ? req.files['images'].map(file => `/uploads/${file.filename}`)
      : [];

    const product = new Product({
      name,
      description,
      price: Number(price),
      stock: Number(stock),
      sellerId: sellerId || 'test-seller',
      categoryId,
      images: imagePaths,
    });
    await product.save();
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/:id', 
  process.env.NODE_ENV === 'development' ? (req, res, next) => next() : authenticateJWT,
  process.env.NODE_ENV === 'development' ? (req, res, next) => next() : authorizeSeller,
  validateProduct, 
  async (req, res) => {
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
    const { categoryId, priceMin, priceMax, keyword } = req.query;
    let query = { status: 'active' };

    if (categoryId) query.categoryId = categoryId;
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