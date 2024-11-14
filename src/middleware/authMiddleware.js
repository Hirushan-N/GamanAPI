const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid token.' });
  }
};

const authorizeRoles = (roles) => (req, res, next) => {
  if ((req.user && roles.includes(req.user.role)) || roles.includes('commuter')) {
    next();
  } else {
    res.status(403).json({ error: `Access denied. Only users with the roles: ${roles.join(', ')} are allowed.` });
  }
};

module.exports = { authenticateToken, authorizeRoles };
