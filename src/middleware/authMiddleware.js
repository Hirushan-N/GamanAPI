const jwt = require('jsonwebtoken');
const logger = require('../utils/logger'); // Import logger for better tracking

// Middleware to authenticate token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    logger.warn('Unauthorized access attempt without token', { endpoint: req.originalUrl });
    return res.status(401).json({ error: 'Unauthorized access. Token required.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      logger.warn('Expired token attempt', { endpoint: req.originalUrl, error: err.message });
      return res.status(403).json({ error: 'Token has expired. Please log in again.' });
    }
    logger.error('Invalid token attempt', { endpoint: req.originalUrl, error: err.message });
    return res.status(403).json({ error: 'Invalid token. Authentication failed.' });
  }
};

// Middleware to authorize specific roles
const authorizeRoles = (roles) => (req, res, next) => {
  if (req.user && roles.includes(req.user.role)) {
    next();
  } else {
    logger.warn('Access denied due to insufficient role', { role: req.user ? req.user.role : 'none', endpoint: req.originalUrl });
    return res.status(403).json({ error: `Access denied. Only users with roles: ${roles.join(', ')} can access this endpoint.` });
  }
};

module.exports = { authenticateToken, authorizeRoles };
