// user routes
const express = require('express');
const router = express.Router();
const userController = require('../controllers/usercontroller');
const { authMiddleware } = require('../middlewares/authMiddleware');

// routes
router.post('/verify-otp', userController.verifyOtp);
router.post('/login', userController.login);

module.exports = router;
