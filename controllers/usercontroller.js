// user controller
const userService = require('../services/user');
// user signUp controller
async function signUp(req, res) {
  try {
    const { phone, email, name } = req.body;
      await userService.signUpUser({ name, email, phone });
    res.status(201).json({ msg: 'User registered successfully, OTP sent' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

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

module.exports = { signUp, verifyOtp };