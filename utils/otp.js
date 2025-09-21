const crypto = require('crypto');
const Otp = require('../models/otp');
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID ;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE;

const client = twilio(accountSid, authToken);

// Generate and send OTP
async function generateAndSendOtp(phone) {
  const otp = crypto.randomInt(1000, 9999).toString();

  // Save OTP to DB (overwrite old OTP for same phone)
  await Otp.findOneAndUpdate(
    { phone },
    { otp, createdAt: new Date() },
    { upsert: true, new: true }
  );

  // Send OTP via Twilio
  await client.messages.create({
    body: `Your OTP is: ${otp}`,
    from: twilioPhone,
    to: phone.startsWith('+') ? phone : `+91${phone}` // auto add +91 if missing
  });

  return { success: true, phone };
}

// Validate OTP
async function validateOtp(phone, otp) {
  const record = await Otp.findOne({ phone, otp });
  if (!record) return false;

  // Delete OTP once used
  await Otp.deleteOne({ _id: record._id });
  return true;
}

module.exports = { generateAndSendOtp, validateOtp };
