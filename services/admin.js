const jwt = require('jsonwebtoken');
const User = require('../models/user'); // make sure the path is correct

// optional: define role map if you want to use roleLevel numbers
const roleMap = { 1: 'user', 2: 'admin', 3: 'developer' };
 
async function createUserAndToken(userData, creatorUser) {
  const { user_id, name, email, phone, roles } = userData;

  if (!user_id || !name || !email || !phone) {
    throw new Error('user_id, name, email, and phone are required');
  }
 
  // Determine role
  let assignedRole = 'user';
  if (roles && roleMap[roles]) {
    // Hierarchy check: cannot assign role higher than creator
    if (creatorUser &&  creatorUser.roles > roles) {
      throw new Error('Cannot assign a higher role than your own');
    }
    assignedRole = roleMap[roles];
  }

  const user = await User.create({
    user_id,
    name,
    email,
    phone,
    roles: [assignedRole]
  });

  const token = jwt.sign(
    { id: user.user_id, phone: user.phone, roles: user.roles },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES || '7d' }
  );

  return { user, token };
}

module.exports = { createUserAndToken };
