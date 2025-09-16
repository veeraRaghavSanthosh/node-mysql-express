const rateLimit = require('express-rate-limit');
const { body, param, validationResult } = require('express-validator');
const xss = require('xss');
const helmet = require('helmet');

// Rate limiting configuration
const createRateLimit = (windowMs = 15 * 60 * 1000, max = 100, message = 'Too many requests') => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: message,
      retryAfter: Math.round(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Different rate limits for different operations
const rateLimits = {
  // General API rate limit
  general: createRateLimit(15 * 60 * 1000, 100, 'Too many requests from this IP, please try again later'),
  
  // Stricter limit for create/update/delete operations
  mutations: createRateLimit(15 * 60 * 1000, 20, 'Too many create/update/delete requests, please try again later'),
  
  // Very strict limit for delete all operations
  deleteAll: createRateLimit(60 * 60 * 1000, 3, 'Too many bulk delete requests, please try again in an hour')
};

// Input validation rules
const validationRules = {
  createCustomer: [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail()
      .isLength({ max: 255 })
      .withMessage('Email must be less than 255 characters'),
    
    body('name')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Name must be between 1 and 100 characters')
      .matches(/^[a-zA-Z0-9\s\-_.]+$/)
      .withMessage('Name contains invalid characters'),
    
    body('active')
      .optional()
      .isBoolean()
      .withMessage('Active must be a boolean value')
  ],
  
  updateCustomer: [
    param('customerId')
      .isInt({ min: 1 })
      .withMessage('Customer ID must be a positive integer'),
    
    body('email')
      .optional()
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail()
      .isLength({ max: 255 })
      .withMessage('Email must be less than 255 characters'),
    
    body('name')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Name must be between 1 and 100 characters')
      .matches(/^[a-zA-Z0-9\s\-_.]+$/)
      .withMessage('Name contains invalid characters'),
    
    body('active')
      .optional()
      .isBoolean()
      .withMessage('Active must be a boolean value')
  ],
  
  getCustomer: [
    param('customerId')
      .isInt({ min: 1 })
      .withMessage('Customer ID must be a positive integer')
  ]
};

// XSS sanitization middleware
const sanitizeInput = (req, res, next) => {
  if (req.body) {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = xss(req.body[key]);
      }
    }
  }
  
  if (req.params) {
    for (const key in req.params) {
      if (typeof req.params[key] === 'string') {
        req.params[key] = xss(req.params[key]);
      }
    }
  }
  
  if (req.query) {
    for (const key in req.query) {
      if (typeof req.query[key] === 'string') {
        req.query[key] = xss(req.query[key]);
      }
    }
  }
  
  next();
};

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
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
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

module.exports = {
  rateLimits,
  validationRules,
  sanitizeInput,
  handleValidationErrors,
  securityHeaders
};