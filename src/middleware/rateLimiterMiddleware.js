const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger'); // Ensure you have a logger for tracking events

// Configurable rate limiter
const loginRateLimiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // Default: 15 minutes
  max: process.env.RATE_LIMIT_MAX_ATTEMPTS || 10, // Default: 10 attempts per window
  message: { error: 'Too many login attempts. Please try again later.' },
  standardHeaders: true, // Sends rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  handler: (req, res, next, options) => {
    logger.warn('Rate limit exceeded', { ip: req.ip, endpoint: req.originalUrl });
    res.setHeader('Retry-After', Math.ceil(options.windowMs / 1000));
    res.status(429).json({
      error: 'Too many requests. Please try again later.',
      retryAfter: Math.ceil(options.windowMs / 1000), // Retry time in seconds
    });
  },
});

module.exports = { loginRateLimiter };
