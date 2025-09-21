// user controller
const { data } = require('autoprefixer');
const userService = require('../services/user');

// user verify OTP controller
async function verifyOtp(req, res) {
  try {
    const { phone, otp } = req.body;
    const { user, token } = await userService.verifyOtp(phone, otp);
    res.status(200).json({ 
      status : 1,
      data : {
        token : token,
        user : user
      },
      error : null,
      message : "User verified successfully"});
  } catch (error) {
    res.status(400).json({ 
      status : 0,
      data : null,
      message : "User verification failed",
      error: error.message });
  }
}

// user login controller
async function login(req, res) {
  try {
    const { phone } = req.body;
    const { message } = await userService.loginUser(phone);
    res.status(200).json({ 
      status : 1,
      data : null,
      error : null,
      msg: message });
  } catch (error) {
    res.status(400).json({ 
      status : 0,
      data : null,
      message : "Login failed",
      error: error.message });
  }
}

module.exports = { verifyOtp, login };