// models/Otp.js
const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    otp: {
      type: String, // store hashed OTP, not plain
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

// Automatically delete expired OTPs using TTL index
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 300 });

module.exports = mongoose.model("Otp", otpSchema);
