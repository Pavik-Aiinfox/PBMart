const express = require('express');
const router = express.Router();
const Category = require('../models/category');
const { authenticateJWT } = require('../middleware/auth');
const { validateCategory } = require('../middleware/validate');
const axios = require('axios');

router.post('/', validateCategory, async (req, res) => {
  try {
    const { name, parentId, attributes } = req.body;
    if (parentId) {
      const parent = await Category.findById(parentId);
      if (!parent) return res.status(400).json({ success: false, message: 'Parent category not found' });
    }
    const category = new Category({ name, parentId, attributes });
    await category.save();
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/:id', validateCategory, async (req, res) => {
  try {
    const { name, parentId, attributes } = req.body;
    if (parentId) {
      const parent = await Category.findById(parentId);
      if (!parent) return res.status(400).json({ success: false, message: 'Parent category not found' });
    }
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, parentId, attributes, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    if (!category) throw new Error('Category not found');
    res.json({ success: true, data: category });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) throw new Error('Category not found');

    // Check for subcategories
    const subcategories = await Category.find({ parentId: req.params.id });
    if (subcategories.length > 0) {
      return res.status(409).json({ success: false, message: 'Category has subcategories' });
    }

    // Check for products (call Product Service)
    const productResponse = await axios.get(`http://localhost:3004/api/products?categoryId=${req.params.id}`);
    if (productResponse.data.data.length > 0) {
      return res.status(409).json({ success: false, message: 'Category has associated products' });
    }

    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    res.status(error.response?.status || 400).json({ success: false, message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).populate('parentId');
    if (!category) throw new Error('Category not found');

    // Fetch subcategories
    const subcategories = await Category.find({ parentId: req.params.id });
    res.json({ success: true, data: { ...category.toObject(), subcategories } });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const { parentId } = req.query;
    const query = parentId ? { parentId } : {};
    const categories = await Category.find(query);
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;