const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const helmet = require('helmet');
const { body, param, validationResult } = require('express-validator');
const xss = require('xss');

// Rate limiting configuration
const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: message,
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        error: message,
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
  });
};

// General API rate limiting (100 requests per 15 minutes)
const apiLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  100,
  'Too many requests from this IP, please try again later.'
);

// Strict rate limiting for write operations (10 requests per minute)
const strictLimiter = createRateLimit(
  60 * 1000, // 1 minute
  10,
  'Too many write requests from this IP, please try again later.'
);

// Very strict rate limiting for delete operations (5 requests per 5 minutes)
const deleteLimiter = createRateLimit(
  5 * 60 * 1000, // 5 minutes
  5,
  'Too many delete requests from this IP, please try again later.'
);

// Speed limiter to slow down requests after threshold
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // allow 50 requests per windowMs without delay
  delayMs: 500, // add 500ms delay per request after delayAfter
  maxDelayMs: 20000, // maximum delay of 20 seconds
});

// Input validation rules
const customerValidationRules = () => {
  return [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address')
      .isLength({ max: 100 })
      .withMessage('Email must be less than 100 characters'),
    body('name')
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Name must be between 1 and 50 characters')
      .matches(/^[a-zA-Z\s'-]+$/)
      .withMessage('Name can only contain letters, spaces, hyphens, and apostrophes'),
    body('active')
      .optional()
      .isBoolean()
      .withMessage('Active field must be a boolean value')
  ];
};

const customerIdValidation = () => {
  return [
    param('customerId')
      .isInt({ min: 1 })
      .withMessage('Customer ID must be a positive integer')
      .toInt()
  ];
};

// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
  if (req.body) {
    for (let key in req.body) {
      if (typeof req.body[key] === 'string') {
        // Remove XSS attempts and trim whitespace
        req.body[key] = xss(req.body[key].trim());
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

// Request logging middleware for security monitoring
const securityLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent') || 'Unknown';
  
  console.log(`[${timestamp}] ${req.method} ${req.path} - IP: ${ip} - User-Agent: ${userAgent}`);
  
  // Log potentially suspicious activity
  if (req.body && JSON.stringify(req.body).length > 10000) {
    console.warn(`[SECURITY] Large request body detected from IP: ${ip}`);
  }
  
  next();
};

module.exports = {
  apiLimiter,
  strictLimiter,
  deleteLimiter,
  speedLimiter,
  customerValidationRules,
  customerIdValidation,
  sanitizeInput,
  handleValidationErrors,
  securityHeaders,
  securityLogger
};