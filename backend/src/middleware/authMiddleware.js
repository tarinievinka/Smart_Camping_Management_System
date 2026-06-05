const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('../utils/jwtConfig');

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : authHeader.trim();
  if (!token || token === 'undefined' || token === 'null') {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    req.user = jwt.verify(token, getJwtSecret());
    next();
  } catch (err) {
    const message =
      err.name === 'TokenExpiredError'
        ? 'Session expired. Please sign in again.'
        : 'Invalid token. Please sign out and sign in again.';
    res.status(401).json({ error: message });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admins only' });
  next();
};

module.exports = { protect, adminOnly };