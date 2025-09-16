const rateLimit = require('express-rate-limit');
const { body, param, validationResult } = require('express-validator');
const xss = require('xss');

// Rate limiting configurations
const createRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 create requests per windowMs
  message: {
    error: 'Too many accounts created from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const deleteRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 delete requests per windowMs
  message: {
    error: 'Too many delete requests from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
  if (req.body) {
    for (let key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = xss(req.body[key].trim());
      }
    }
  }
  
  if (req.params) {
    for (let key in req.params) {
      if (typeof req.params[key] === 'string') {
        req.params[key] = xss(req.params[key].trim());
      }
    }
  }
  
  if (req.query) {
    for (let key in req.query) {
      if (typeof req.query[key] === 'string') {
        req.query[key] = xss(req.query[key].trim());
      }
    }
  }
  
  next();
};

// Validation rules for customer creation
const validateCustomerCreation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('Valid email is required (max 255 characters)'),
  body('name')
    .isLength({ min: 1, max: 100 })
    .matches(/^[a-zA-Z0-9\s\-'\.]+$/)
    .withMessage('Name is required and must be 1-100 characters (letters, numbers, spaces, hyphens, apostrophes, and periods only)'),
  body('active')
    .optional()
    .isBoolean()
    .withMessage('Active must be a boolean value')
];

// Validation rules for customer update
const validateCustomerUpdate = [
  param('customerId')
    .isInt({ min: 1 })
    .withMessage('Customer ID must be a positive integer'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('Valid email is required (max 255 characters)'),
  body('name')
    .optional()
    .isLength({ min: 1, max: 100 })
    .matches(/^[a-zA-Z0-9\s\-'\.]+$/)
    .withMessage('Name must be 1-100 characters (letters, numbers, spaces, hyphens, apostrophes, and periods only)'),
  body('active')
    .optional()
    .isBoolean()
    .withMessage('Active must be a boolean value')
];

// Validation rules for customer ID parameter
const validateCustomerId = [
  param('customerId')
    .isInt({ min: 1 })
    .withMessage('Customer ID must be a positive integer')
];

// Error handling middleware for validation
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

module.exports = {
  createRateLimit,
  generalRateLimit,
  deleteRateLimit,
  sanitizeInput,
  validateCustomerCreation,
  validateCustomerUpdate,
  validateCustomerId,
  handleValidationErrors
};