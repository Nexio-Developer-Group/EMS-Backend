// routes/itemRoutes.js
const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const { authMiddleware, requireRole } = require('../middlewares/authMiddleware');

// Get all items with filters, pagination, and sorting (admin only)
router.get('/', authMiddleware, requireRole('admin'), itemController.getAllItems);

// Create a new item (admin only)
router.post('/', authMiddleware, requireRole('admin'), itemController.createItem);

// Update an item by ID (admin only)
router.put('/:id', authMiddleware, requireRole('admin'), itemController.updateItem);

// Delete an item by ID (admin only)
router.delete('/:id', authMiddleware, requireRole('admin'), itemController.deleteItem);

// Get a single item by ID (admin only)
router.get('/:id', authMiddleware, requireRole('admin'), itemController.getItemById);

// Search items by query (admin only)
router.get('/search', authMiddleware, requireRole('admin'), itemController.searchItems);

// Add a rating to an item by ID (admin only)
router.post('/:id/rating', authMiddleware, requireRole('admin'), itemController.addRating);

module.exports = router;
