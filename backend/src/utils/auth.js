const jwt = require('jsonwebtoken');
<<<<<<< HEAD
const User = require('../models/user-model/userModel');
=======
const User = require('../models/user-models/User');
>>>>>>> 0314994bf65062d852853dc4a3f58bba40113109

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) return res.status(401).json({ message: 'User not found' });
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }
  if (!token) return res.status(401).json({ message: 'Not authorized, no token' });
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as an admin' });
  }
};

const campsiteOwner = (req, res, next) => {
<<<<<<< HEAD
  if (req.user && (req.user.role === 'campsite_owner' || req.user.role === 'admin')) {
=======
  if (req.user && (req.user.role === 'campsite-owner' || req.user.role === 'admin')) {
>>>>>>> 0314994bf65062d852853dc4a3f58bba40113109
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as a campsite owner' });
  }
};

module.exports = { protect, admin, campsiteOwner };
