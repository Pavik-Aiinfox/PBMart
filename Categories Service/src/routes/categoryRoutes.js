const express = require('express');
const router = express.Router();
const Category = require('../models/category');
const { validateCategory } = require('../middleware/validate');
const { authenticateJWT } = require('../middleware/auth');
const axios = require('axios');

// POST /api/categories - Create a single category (no JWT required)
router.post('/', validateCategory, async (req, res) => {
  try {
    const { name, parentId, attributes, image, description } = req.body;
    if (parentId) {
      const parent = await Category.findById(parentId);
      if (!parent) return res.status(400).json({ success: false, message: 'Parent category not found' });
    }
    const category = new Category({ name, parentId, attributes, image, description });
    await category.save();
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// POST /api/categories/add - Create a category with subcategories (no JWT required)
router.post('/add', validateCategory, async (req, res) => {
  try {
    const { name, parentId, attributes, image, description, subcategories } = req.body;
    if (parentId) {
      const parent = await Category.findById(parentId);
      if (!parent) return res.status(400).json({ success: false, message: 'Parent category not found' });
    }
    const category = new Category({ name, parentId, attributes, image, description });
    await category.save();
    let savedSubcategories = [];
    if (subcategories && subcategories.length > 0) {
      savedSubcategories = await Promise.all(
        subcategories.map(async (sub) => {
          const subcategory = new Category({
            name: sub.name,
            parentId: category._id,
            description: sub.description || '',
          });
          await subcategory.save();
          return subcategory;
        })
      );
    }
    res.status(201).json({
      success: true,
      data: { ...category.toObject(), subcategories: savedSubcategories },
      message: 'Category and subcategories added successfully',
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PUT /api/categories/:id - Update a category (JWT required)
router.put('/:id', authenticateJWT, validateCategory, async (req, res) => {
  try {
    const { name, parentId, attributes, image, description } = req.body;
    if (parentId) {
      const parent = await Category.findById(parentId);
      if (!parent) return res.status(400).json({ success: false, message: 'Parent category not found' });
    }
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, parentId, attributes, image, description, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    if (!category) throw new Error('Category not found');
    res.json({ success: true, data: category });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// DELETE /api/categories/:id - Delete a category (JWT required)
router.delete('/:id', authenticateJWT, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) throw new Error('Category not found');
    const subcategories = await Category.find({ parentId: req.params.id });
    if (subcategories.length > 0) {
      return res.status(409).json({ success: false, message: 'Category has subcategories' });
    }
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

// GET /api/categories/:id - Get a category (no JWT required)
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).populate('parentId');
    if (!category) throw new Error('Category not found');
    const subcategories = await Category.find({ parentId: req.params.id });
    res.json({ success: true, data: { ...category.toObject(), subcategories } });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

// GET /api/categories - Get all categories (no JWT required)
router.get('/', async (req, res) => {
  console.log('GET /api/categories hit');
  try {
    const { parentId } = req.query;
    const query = parentId ? { parentId } : {};
    const categories = await Category.find(query);
    console.log('Found categories:', categories.length);
    const categoriesWithSubcategories = await Promise.all(
      categories.map(async (category) => {
        const subcategories = await Category.find({ parentId: category._id });
        console.log(`Subcategories for ${category.name}:`, subcategories.length);
        return { ...category.toObject(), subcategories };
      })
    );
    console.log('Returning categories:', categoriesWithSubcategories.length);
    res.json({ success: true, data: categoriesWithSubcategories });
  } catch (error) {
    console.error('Error in GET /api/categories:', error);
    res.status(400).json({ success: false, message: error.message });
  }
});

// GET /api/categories/:id/subcategories - Get category with subcategories (no JWT required)
router.get('/:id/subcategories', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).select('name description image');
    if (!category) throw new Error('Category not found');
    const subcategories = await Category.find({ parentId: req.params.id }).select('name description');
    res.json({ 
      success: true, 
      data: { 
        _id: category._id,
        name: category.name,
        description: category.description,
        image: category.image,
        subcategories 
      } 
    });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

module.exports = router;