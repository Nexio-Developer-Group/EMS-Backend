// adminRoutes
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admincontroller');
const { authMiddleware, requireRole } = require('../middlewares/authMiddleware');

// Route to create a new user (admin only)
router.post('/create-user', authMiddleware, requireRole('admin'), adminController.createUser);

module.exports = router;