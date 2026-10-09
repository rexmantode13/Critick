const rateLimit = require('express-rate-limit');

// General API Rate Limiter (generous ceiling, bypass in dev)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'development' ? 5000 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'development' || req.ip === '127.0.0.1' || req.ip === '::1',
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.',
  },
});

// Auth Limiter (Login/Register)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'development' ? 500 : 50,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'development' || req.ip === '127.0.0.1' || req.ip === '::1',
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
});

// Search Limiter (120 requests per minute)
const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: process.env.NODE_ENV === 'development' ? 1000 : 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Search rate limit exceeded. Please slow down.',
  },
});

module.exports = {
  apiLimiter,
  authLimiter,
  searchLimiter,
};
