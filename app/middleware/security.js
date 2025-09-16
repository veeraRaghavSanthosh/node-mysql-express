const rateLimit = require('express-rate-limit');
const { body, param, validationResult } = require('express-validator');
const helmet = require('helmet');

// Rate limiting middleware
const createRateLimit = (windowMs = 15 * 60 * 1000, max = 100) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// General rate limit (100 requests per 15 minutes)
const generalRateLimit = createRateLimit();

// Strict rate limit for write operations (20 requests per 15 minutes)
const strictRateLimit = createRateLimit(15 * 60 * 1000, 20);

// Very strict rate limit for delete operations (5 requests per 15 minutes)
const deleteRateLimit = createRateLimit(15 * 60 * 1000, 5);

// Helmet configuration for security headers
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// Input validation rules
const customerValidationRules = () => {
  return [
    body('email')
      .optional()
      .isEmail()
      .normalizeEmail()
      .isLength({ max: 255 })
      .withMessage('Please provide a valid email address (max 255 characters)'),
    body('name')
      .optional()
      .isString()
      .trim()
      .isLength({ min: 1, max: 255 })
      .withMessage('Name must be a string between 1 and 255 characters')
      .matches(/^[a-zA-Z0-9\s\-_.]+$/)
      .withMessage('Name can only contain letters, numbers, spaces, hyphens, underscores, and dots'),
    body('active')
      .optional()
      .isBoolean()
      .withMessage('Active must be a boolean value')
  ];
};

const customerCreateValidationRules = () => {
  return [
    body('email')
      .exists()
      .withMessage('Email is required')
      .isEmail()
      .normalizeEmail()
      .isLength({ max: 255 })
      .withMessage('Please provide a valid email address (max 255 characters)'),
    body('name')
      .exists()
      .withMessage('Name is required')
      .isString()
      .trim()
      .isLength({ min: 1, max: 255 })
      .withMessage('Name must be a string between 1 and 255 characters')
      .matches(/^[a-zA-Z0-9\s\-_.]+$/)
      .withMessage('Name can only contain letters, numbers, spaces, hyphens, underscores, and dots'),
    body('active')
      .optional()
      .isBoolean()
      .withMessage('Active must be a boolean value')
  ];
};

const customerIdValidationRules = () => {
  return [
    param('customerId')
      .isInt({ min: 1 })
      .withMessage('Customer ID must be a positive integer')
  ];
};

// Validation error handler middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(error => ({
        field: error.param,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
  // Remove any undefined or null values from req.body
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (req.body[key] === undefined || req.body[key] === null) {
        delete req.body[key];
      }
      // Trim string values
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    });
  }
  next();
};

module.exports = {
  generalRateLimit,
  strictRateLimit,
  deleteRateLimit,
  helmetConfig,
  customerValidationRules,
  customerCreateValidationRules,
  customerIdValidationRules,
  handleValidationErrors,
  sanitizeInput
};