const Category = require('../models/category');

const getHierarchy = async (categoryId) => {
  const category = await Category.findById(categoryId).populate('parentId');
  if (!category) return null;
  const hierarchy = [category];
  let parent = category.parentId;
  while (parent) {
    const parentCategory = await Category.findById(parent).populate('parentId');
    hierarchy.unshift(parentCategory);
    parent = parentCategory.parentId;
  }
  return hierarchy;
};

module.exports = { getHierarchy };