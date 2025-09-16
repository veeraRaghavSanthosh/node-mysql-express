const rateLimit = require('express-rate-limit');

// General rate limiter for all requests
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil(15 * 60 / 60) + ' minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Stricter rate limiter for write operations (POST, PUT, DELETE)
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 write requests per windowMs
  message: {
    error: 'Too many write requests from this IP, please try again later.',
    retryAfter: Math.ceil(15 * 60 / 60) + ' minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Only apply to write operations
  skip: (req) => req.method === 'GET'
});

// Very strict rate limiter for delete all operations
const deleteLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 delete all requests per hour
  message: {
    error: 'Too many delete requests from this IP, please try again later.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  generalLimiter,
  strictLimiter,
  deleteLimiter
};