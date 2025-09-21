const Category = require('../models/Category');

// Create a new category
const createCategory = async (req, res) => {
  try {
    const category = await Category.createCategory(req.body);
    res.status(201).json({
      status: 1,
      data: category,
      message: 'Category created successfully',
      error: null
    });
  } catch (error) {
    res.status(400).json({
      status: 0,
      data: null,
      message: 'Failed to create category',
      error: error.message
    });
  }
};

// Update a category
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedCategory = await Category.updateCategory(id, req.body);
    if (!updatedCategory) {
      return res.status(404).json({
        status: 0,
        data: null,
        message: 'Category not found',
        error: 'No category with this ID'
      });
    }
    res.json({
      status: 1,
      data: updatedCategory,
      message: 'Category updated successfully',
      error: null
    });
  } catch (error) {
    res.status(400).json({
      status: 0,
      data: null,
      message: 'Failed to update category',
      error: error.message
    });
  }
};

// Delete a category
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCategory = await Category.deleteCategory(id);
    if (!deletedCategory) {
      return res.status(404).json({
        status: 0,
        data: null,
        message: 'Category not found',
        error: 'No category with this ID'
      });
    }
    res.json({
      status: 1,
      data: deletedCategory,
      message: 'Category deleted successfully',
      error: null
    });
  } catch (error) {
    res.status(400).json({
      status: 0,
      data: null,
      message: 'Failed to delete category',
      error: error.message
    });
  }
};

// Get a single category by ID
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.getCategoryById(id);
    if (!category) {
      return res.status(404).json({
        status: 0,
        data: null,
        message: 'Category not found',
        error: 'No category with this ID'
      });
    }
    res.json({
      status: 1,
      data: category,
      message: 'Category fetched successfully',
      error: null
    });
  } catch (error) {
    res.status(400).json({
      status: 0,
      data: null,
      message: 'Failed to fetch category',
      error: error.message
    });
  }
};

// Get all categories
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.getAllCategories();
    res.json({
      status: 1,
      data: categories,
      message: 'Categories fetched successfully',
      error: null
    });
  } catch (error) {
    res.status(400).json({
      status: 0,
      data: null,
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
};

// Export each function separately
module.exports = {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryById,
  getAllCategories,
};
