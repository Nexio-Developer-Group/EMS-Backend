// user services
const User = require('../models/user');
const otpService = require('../utils/otp');
const Otp = require('../models/otp');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// user signUp service
async function signUpUser({ name, email, phone }) {
  if (!name || !email || !phone) {
    throw new Error('name, email, phone are required');
  }
  // Check if user already exists
  const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
  if (existingUser) {
    throw new Error('User already exists');
  }

  // call otp service to send OTP
  await otpService.generateAndSendOtp(phone);
  const user_id = new mongoose.Types.ObjectId().toString();

  const user = await User.create({ user_id, name, email, phone });

  return user;
}

// verify OTP service
async function verifyOtp(phone, otp) {
  const isValid = await otpService.validateOtp(phone, otp);
  if (!isValid) {
    throw new Error('Invalid OTP');
  }

  // delete OTP after verification (optional)
  await Otp.deleteOne({ phone, otp });

  const user = await User.findOne({ phone });
  if (!user) {
    throw new Error('User not found');
  }

  // generate token (optional)
  const token = jwt.sign(
    { id: user.user_id, phone: user.phone, roles: user.roles },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES || '7d' }
  );

  return { user, token };
}

module.exports = { signUpUser, verifyOtp };
