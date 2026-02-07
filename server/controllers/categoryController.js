const Category = require('../models/Category');
const Noun = require('../models/Noun');

// Get all categories (paged)
exports.getAllCategories = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 200);
    const skip = (page - 1) * limit;

    const [categories, total] = await Promise.all([
      Category.find()
        .sort({ categoryHe: 1, _id: 1 })
        .skip(skip)
        .limit(limit),
      Category.countDocuments()
    ]);

    const hasMore = skip + categories.length < total;

    res.json({
      categories,
      count: categories.length,
      total,
      page,
      limit,
      hasMore
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ 
      message: 'Error fetching categories', 
      error: error.message 
    });
  }
};

// Get category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json({ category });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ 
      message: 'Error fetching category', 
      error: error.message 
    });
  }
};

// Create new category
exports.createCategory = async (req, res) => {
  try {
    const { categoryHe } = req.body;

    const category = await Category.create({
      categoryHe
    });

    res.status(201).json({
      message: 'Category created successfully',
      category
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ 
      message: 'Error creating category', 
      error: error.message 
    });
  }
};

// Update category
exports.updateCategory = async (req, res) => {
  try {
    const { categoryHe } = req.body;

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { categoryHe },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({
      message: 'Category updated successfully',
      category
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ 
      message: 'Error updating category', 
      error: error.message 
    });
  }
};

// Delete category
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    await Noun.deleteMany({ category: req.params.id });

    res.json({
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ 
      message: 'Error deleting category', 
      error: error.message 
    });
  }
};
