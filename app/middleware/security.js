const rateLimit = require('express-rate-limit');
const { body, param, validationResult } = require('express-validator');
const helmet = require('helmet');

// Rate limiting middleware
const createRateLimit = (windowMs = 15 * 60 * 1000, max = 100, message = 'Too many requests') => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: message,
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// General rate limiter (100 requests per 15 minutes)
const generalLimiter = createRateLimit();

// Stricter rate limiter for write operations (20 requests per 15 minutes)
const strictLimiter = createRateLimit(15 * 60 * 1000, 20, 'Too many write requests');

// Very strict rate limiter for delete operations (5 requests per 15 minutes)
const deleteLimiter = createRateLimit(15 * 60 * 1000, 5, 'Too many delete requests');

// Input validation middleware
const validateCustomerInput = [
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('Email must be valid and less than 255 characters'),
  
  body('name')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Name must be 1-100 characters and contain only letters, spaces, hyphens, and apostrophes'),
  
  body('active')
    .optional()
    .isBoolean()
    .withMessage('Active must be a boolean value'),
];

const validateCustomerId = [
  param('customerId')
    .isInt({ min: 1 })
    .withMessage('Customer ID must be a positive integer'),
];

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// Sanitize request body to prevent XSS and injection attacks
const sanitizeInput = (req, res, next) => {
  if (req.body) {
    // Remove any HTML tags and script content
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/<[^>]*>/g, '')
          .trim();
      }
    }
  }
  next();
};

module.exports = {
  helmet,
  generalLimiter,
  strictLimiter,
  deleteLimiter,
  validateCustomerInput,
  validateCustomerId,
  handleValidationErrors,
  sanitizeInput
};