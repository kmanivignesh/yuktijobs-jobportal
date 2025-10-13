const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  let token;
  try {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ message: 'User not found' });

    req.user = user; // ✅ attach user to request
    next();
  } catch (err) {
    console.error('Auth middleware error:', err); // log error
    res.status(401).json({ message: 'Token invalid', error: err.message });
  }
};

// Recruiter-only access
exports.recruiterOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'No user found in request' });
  }
  if (req.user.role !== 'recruiter') {
    return res.status(403).json({ message: 'Access denied: Recruiters only' });
  }
  next();
};
