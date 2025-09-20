// OTP generation and validation

// sendotp and save it to db
const crypto = require('crypto');
const Otp = require('../models/otp');

async function generateAndSendOtp(phone) {
  const otp = crypto.randomInt(100000, 999999).toString();

  // Save OTP to database
  await Otp.create({ phone, otp });
  

  // Send OTP to user's phone (implementation not shown)
  console.log(`Sending OTP ${otp} to ${phone}`);
}

// validate otp
async function validateOtp(phone, otp) {
  const record = await Otp.findOne({ phone, otp });
  return record ? true : false;
}

module.exports = { generateAndSendOtp, validateOtp };