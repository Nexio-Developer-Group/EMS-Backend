const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { createAndSendOtp, verifyOtpCode } = require('../services/otpService');


async function signup(req, res) {
try {
const { name, email, phone } = req.body;
if (!name || !email || !phone) return res.status(400).json({ message: 'name, email, phone are required' });


const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
if (existingUser) return res.status(400).json({ message: 'User already exists, please login' });


await createAndSendOtp(phone);

 
return res.json({ message: 'OTP sent for signup. Please verify.', tempUser: { name, email, phone } });
} catch (err) {
return res.status(500).json({ message: err.message });
}
}


// ===== VERIFY SIGNUP =====
async function verifySignup(req, res) {
try {
const { name, email, phone, otp } = req.body;
if (!name || !email || !phone || !otp) return res.status(400).json({ message: 'all fields required' });


await verifyOtpCode(phone, otp);


let user = await User.findOne({ phone });
if (user) return res.status(400).json({ message: 'User already exists, use login' });


user = await User.create({ name, email, phone });


const token = jwt.sign(
{ sub: user._id, phone: user.phone, roles: user.roles },
process.env.JWT_SECRET,
{ expiresIn: process.env.JWT_EXPIRES || '7d' }
);


return res.json({ token, user: { id: user._id, name: user.name, email: user.email, phone: user.phone, roles: user.roles } });
} catch (err) {
return res.status(400).json({ message: err.message });
}
}

// ===== LOGIN =====
async function login(req, res) {
try {
const { phone } = req.body;
if (!phone) return res.status(400).json({ message: 'phone is required' });


const user = await User.findOne({ phone });
if (!user) return res.status(404).json({ message: 'User not found, please signup' });


await createAndSendOtp(phone);
return res.json({ message: 'OTP sent for login' });
} catch (err) {
return res.status(500).json({ message: err.message });
}
}


// ===== VERIFY LOGIN =====
async function verifyLogin(req, res) {
try {
const { phone, otp } = req.body;
if (!phone || !otp) return res.status(400).json({ message: 'phone and otp are required' });


await verifyOtpCode(phone, otp);


const user = await User.findOne({ phone });
if (!user) return res.status(404).json({ message: 'User not found, please signup' });


const token = jwt.sign(
{ sub: user._id, phone: user.phone, roles: user.roles },
process.env.JWT_SECRET,
{ expiresIn: process.env.JWT_EXPIRES || '7d' }
);


return res.json({ token, user: { id: user._id, name: user.name, email: user.email, phone: user.phone, roles: user.roles } });
} catch (err) {
return res.status(400).json({ message: err.message });
}
}


module.exports = { signup, verifySignup, login, verifyLogin };
