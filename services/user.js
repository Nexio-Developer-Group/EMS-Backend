// user services
const User = require('../models/User');
const otpService = require('../utils/otp');
const Otp = require('../models/otp');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

 
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

// user login service
async function loginUser(phone) {
  if (!phone) {
    throw new Error('phone is required');
  }
  const user = await User.findOne({ phone });
  if (!user) {
      const user_id = new mongoose.Types.ObjectId().toString();
       await User.create({ user_id, phone });
  }

   await otpService.generateAndSendOtp(phone);

  return { message: 'OTP sent for login. Please verify.' };
}

module.exports = { verifyOtp, loginUser };
