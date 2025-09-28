const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authMiddleware, requireRole } = require('../middlewares/authMiddleware');


// Get all categories
router.get('/', authMiddleware, requireRole('admin'), categoryController.getAllCategories);

// Create a new category
router.post('/', authMiddleware, requireRole('admin'), categoryController.createCategory);

// Update a category by ID
router.put('/:id', authMiddleware, requireRole('admin'), categoryController.updateCategory);

// Delete a category by ID
router.delete('/:id', authMiddleware, requireRole('admin'), categoryController.deleteCategory);

// Get a single category by ID
router.get('/:id', authMiddleware, requireRole('admin'), categoryController.getCategoryById);


module.exports = router;
