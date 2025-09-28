// routes/billRoutes.js
const express = require('express');
const router = express.Router();
const billController = require('../controllers/billController');
const { authMiddleware, requireRole } = require('../middlewares/authMiddleware');

// Create a new bill (admin only)
router.post('/', authMiddleware, requireRole('admin'), billController.createBill);

// Edit a bill by ID (admin only)
router.put('/:id', authMiddleware, requireRole('admin'), billController.editBill);

// Update bill status by ID (admin only)
router.patch('/:id/status', authMiddleware, requireRole('admin'), billController.updateBillStatus);

// Delete a bill by ID (admin only)
router.delete('/:id', authMiddleware, requireRole('admin'), billController.deleteBill);

// Get bill by billId (admin only)
router.get('/id/:billId', authMiddleware, requireRole('admin'), billController.getBillByBillId);

// Get all bills with optional filters (admin only)
router.get('/all', authMiddleware, requireRole('admin'), billController.getAllBills);

// Search users by phone number (admin only)
router.get('/users/search', authMiddleware, requireRole('admin'), billController.searchUserByPhone);

// Get bills by user phone number (admin only)
router.get('/user', authMiddleware, requireRole('admin'), billController.getBillsByUserPhone);

module.exports = router;
