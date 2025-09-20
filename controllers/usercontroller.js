// user controller
const userService = require('../services/user');

// user verify OTP controller
async function verifyOtp(req, res) {
  try {
    const { phone, otp } = req.body;
    const { user, token } = await userService.verifyOtp(phone, otp);
    res.status(200).json({ msg: 'OTP verified successfully', user, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// user login controller
async function login(req, res) {
  try {
    const { phone } = req.body;
    const { message } = await userService.loginUser(phone);
    res.status(200).json({ msg: message });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

module.exports = { verifyOtp, login };