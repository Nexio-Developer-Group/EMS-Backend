// adminRoutes
const express = require('express');
const router = express.Router();
const ReportingController = require('../controllers/ReportingController');
const { authMiddleware, requireRole } = require('../middlewares/authMiddleware');


// Route to create a new user (admin only)
router.get('/dashboard', authMiddleware, requireRole('admin'), ReportingController.getDashboardStats);  

module.exports = router;