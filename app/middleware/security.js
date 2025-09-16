const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const { body, param, validationResult } = require('express-validator');

// Rate limiting configuration
const createRateLimiter = (windowMs = 15 * 60 * 1000, max = 100, message = 'Too many requests') => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: message,
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Skip successful requests for backward compatibility
    skipSuccessfulRequests: false,
    // Custom key generator for more flexible rate limiting
    keyGenerator: (req) => {
      return req.ip || req.connection.remoteAddress;
    }
  });
};

// Speed limiting configuration
const createSpeedLimiter = (windowMs = 15 * 60 * 1000, delayAfter = 50, delayMs = 500) => {
  return slowDown({
    windowMs,
    delayAfter,
    delayMs,
    maxDelayMs: 20000,
    // Skip successful requests for backward compatibility
    skipSuccessfulRequests: false
  });
};

// Different rate limits for different operations
const rateLimiters = {
  // Stricter limits for write operations
  create: createRateLimiter(15 * 60 * 1000, 20, 'Too many create requests'),
  update: createRateLimiter(15 * 60 * 1000, 30, 'Too many update requests'),
  delete: createRateLimiter(15 * 60 * 1000, 10, 'Too many delete requests'),
  
  // More lenient limits for read operations
  read: createRateLimiter(15 * 60 * 1000, 100, 'Too many read requests'),
  
  // General API rate limit
  general: createRateLimiter(15 * 60 * 1000, 200, 'Too many API requests')
};

// Speed limiters
const speedLimiters = {
  api: createSpeedLimiter(15 * 60 * 1000, 100, 100)
};

// Input validation rules for customer data
const customerValidationRules = {
  create: [
    body('email')
      .optional()
      .isEmail()
      .normalizeEmail()
      .isLength({ max: 255 })
      .withMessage('Email must be valid and less than 255 characters'),
    
    body('name')
      .optional()
      .trim()
      .isLength({ min: 1, max: 255 })
      .matches(/^[a-zA-Z0-9\s\-_.]+$/)
      .withMessage('Name must be 1-255 characters and contain only letters, numbers, spaces, hyphens, underscores, and dots'),
    
    body('active')
      .optional()
      .isBoolean()
      .withMessage('Active must be a boolean value')
  ],
  
  update: [
    param('customerId')
      .isInt({ min: 1 })
      .withMessage('Customer ID must be a positive integer'),
    
    body('email')
      .optional()
      .isEmail()
      .normalizeEmail()
      .isLength({ max: 255 })
      .withMessage('Email must be valid and less than 255 characters'),
    
    body('name')
      .optional()
      .trim()
      .isLength({ min: 1, max: 255 })
      .matches(/^[a-zA-Z0-9\s\-_.]+$/)
      .withMessage('Name must be 1-255 characters and contain only letters, numbers, spaces, hyphens, underscores, and dots'),
    
    body('active')
      .optional()
      .isBoolean()
      .withMessage('Active must be a boolean value')
  ],
  
  findOne: [
    param('customerId')
      .isInt({ min: 1 })
      .withMessage('Customer ID must be a positive integer')
  ],
  
  delete: [
    param('customerId')
      .isInt({ min: 1 })
      .withMessage('Customer ID must be a positive integer')
  ]
};

// Validation error handler middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array().map(error => ({
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
  // Sanitize body parameters
  if (req.body) {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        // Remove potentially dangerous characters while preserving functionality
        req.body[key] = req.body[key]
          .replace(/[<>]/g, '') // Remove < and > to prevent XSS
          .trim(); // Remove leading/trailing whitespace
      }
    }
  }
  
  // Sanitize URL parameters
  if (req.params) {
    for (const key in req.params) {
      if (typeof req.params[key] === 'string') {
        req.params[key] = req.params[key]
          .replace(/[<>]/g, '')
          .trim();
      }
    }
  }
  
  next();
};

// Security headers middleware (using helmet concepts but maintaining compatibility)
const securityHeaders = (req, res, next) => {
  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Don't cache sensitive data
  if (req.method !== 'GET') {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  
  next();
};

module.exports = {
  rateLimiters,
  speedLimiters,
  customerValidationRules,
  handleValidationErrors,
  sanitizeInput,
  securityHeaders
};