const rateLimit = require('express-rate-limit');
const { body, param, validationResult } = require('express-validator');

// Rate limiting middleware
const createRateLimit = (windowMs = 15 * 60 * 1000, max = 100) => {
  return rateLimit({
    windowMs, // 15 minutes by default
    max, // limit each IP to max requests per windowMs
    message: {
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Different rate limits for different endpoints
const generalRateLimit = createRateLimit(15 * 60 * 1000, 100); // 100 requests per 15 minutes
const createCustomerRateLimit = createRateLimit(15 * 60 * 1000, 20);   // 20 creates per 15 minutes
const deleteRateLimit = createRateLimit(15 * 60 * 1000, 10);   // 10 deletes per 15 minutes

// Input validation middleware
const validateCustomerInput = [
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Name can only contain letters, spaces, hyphens, and apostrophes'),
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
      message: 'Invalid input data',
      errors: errors.array()
    });
  }
  next();
};

// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
  if (req.body) {
    // Remove any potential HTML/script tags and trim whitespace
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/<[^>]*>/g, '')
          .trim();
      }
    });
  }
  next();
};

module.exports = {
  generalRateLimit,
  createRateLimit,
  deleteRateLimit,
  validateCustomerInput,
  validateCustomerId,
  handleValidationErrors,
  sanitizeInput
};