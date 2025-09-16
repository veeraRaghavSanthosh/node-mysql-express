const { body, param, validationResult } = require('express-validator');

// Validation rules for customer creation
const validateCustomerCreate = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .escape()
    .withMessage('Name must be between 1 and 100 characters'),
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
    .withMessage('Please provide a valid email address'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .escape()
    .withMessage('Name must be between 1 and 100 characters'),
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

// Middleware to handle validation errors
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

module.exports = {
  validateCustomerCreate,
  validateCustomerUpdate,
  validateCustomerId,
  handleValidationErrors
};