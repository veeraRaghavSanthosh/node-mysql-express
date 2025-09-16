const rateLimit = require('express-rate-limit');
const { body, param, validationResult } = require('express-validator');
const helmet = require('helmet');

// Rate limiting configuration
const createRateLimit = (windowMs = 15 * 60 * 1000, max = 100, message = 'Too many requests') => {
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// General rate limit - 100 requests per 15 minutes
const generalLimiter = createRateLimit();

// Strict rate limit for write operations - 20 requests per 15 minutes
const strictLimiter = createRateLimit(15 * 60 * 1000, 20, 'Too many write requests');

// Validation middleware for customer data
const validateCustomer = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  body('active')
    .optional()
    .isBoolean()
    .withMessage('Active must be a boolean value'),
];

// Validation middleware for customer ID parameter
const validateCustomerId = [
  param('customerId')
    .isInt({ min: 1 })
    .withMessage('Customer ID must be a positive integer'),
];

// Middleware to handle validation errors
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

// Security headers middleware
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
});

module.exports = {
  generalLimiter,
  strictLimiter,
  validateCustomer,
  validateCustomerId,
  handleValidationErrors,
  securityHeaders
};