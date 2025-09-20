// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const roles = require("../config/roles");
const User = require("../models/user");

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
   

   const user = await User.findOne({ user_id: decoded.id });

    if (!user) return res.status(404).json({ message: "User not found" });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Check if user has sufficient role (hierarchy-based)
const requireRole = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const userRoleLevel = roles[req.user.roles];
    const requiredRoleLevel = roles[requiredRole];

    if (userRoleLevel >= requiredRoleLevel) {
      return next();
    } else {
      return res.status(403).json({ message: "Access denied" });
    }
  };
};

module.exports = { authMiddleware, requireRole };
