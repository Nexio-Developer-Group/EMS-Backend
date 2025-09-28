// Admin Controller
const { mongo, default: mongoose } = require('mongoose');
const User = require('../models/User');
const adminservices = require('../services/admin');

// Create a new user (admin function)
async function createUser(req, res) {
  try {
    const { name, email, phone, roles } = req.body;
    if (!name || !email || !phone) return res.status(400).json({ message: 'name, email, phone are required' });

    const user_id = new mongoose.Types.ObjectId().toString();

    const { user, token } = await adminservices.createUserAndToken({ user_id, name, email, phone, roles }, req.user);
    return res.status(201).json({ user, token });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}
module.exports = { createUser };