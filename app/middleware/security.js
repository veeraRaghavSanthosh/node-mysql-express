// Basic rate limiting and input sanitization without external dependencies
// This maintains backward compatibility while adding security features

// Simple in-memory rate limiting store
const rateLimitStore = new Map();

// Rate limiting middleware
const createRateLimit = (windowMs = 15 * 60 * 1000, max = 100, message = 'Too many requests') => {
  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    // Clean up old entries
    for (const [ip, data] of rateLimitStore.entries()) {
      if (now - data.windowStart > windowMs) {
        rateLimitStore.delete(ip);
      }
    }
    
    // Get or create entry for this IP
    let entry = rateLimitStore.get(key);
    if (!entry || now - entry.windowStart > windowMs) {
      entry = {
        count: 0,
        windowStart: now
      };
      rateLimitStore.set(key, entry);
    }
    
    // Check if limit exceeded
    if (entry.count >= max) {
      return res.status(429).json({
        error: message,
        retryAfter: Math.ceil((windowMs - (now - entry.windowStart)) / 1000)
      });
    }
    
    // Increment counter
    entry.count++;
    
    // Set headers
    res.set({
      'X-RateLimit-Limit': max,
      'X-RateLimit-Remaining': Math.max(0, max - entry.count),
      'X-RateLimit-Reset': new Date(entry.windowStart + windowMs).toISOString()
    });
    
    next();
  };
};

// General rate limit for all routes
const generalRateLimit = createRateLimit(15 * 60 * 1000, 100, 'Too many requests from this IP, please try again later');

// Stricter rate limit for write operations (POST, PUT, DELETE)
const writeRateLimit = createRateLimit(15 * 60 * 1000, 20, 'Too many write requests from this IP, please try again later');

// Very strict rate limit for delete all operations
const deleteAllRateLimit = createRateLimit(60 * 60 * 1000, 5, 'Too many delete all requests from this IP, please try again later');

// Basic XSS protection function
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
};

// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
  // Sanitize body parameters
  if (req.body && typeof req.body === 'object') {
    for (const key in req.body) {
      if (req.body.hasOwnProperty(key) && typeof req.body[key] === 'string') {
        req.body[key] = sanitizeString(req.body[key]);
      }
    }
  }
  
  // Sanitize query parameters
  if (req.query && typeof req.query === 'object') {
    for (const key in req.query) {
      if (req.query.hasOwnProperty(key) && typeof req.query[key] === 'string') {
        req.query[key] = sanitizeString(req.query[key]);
      }
    }
  }
  
  // Sanitize URL parameters
  if (req.params && typeof req.params === 'object') {
    for (const key in req.params) {
      if (req.params.hasOwnProperty(key) && typeof req.params[key] === 'string') {
        req.params[key] = sanitizeString(req.params[key]);
      }
    }
  }
  
  next();
};

// Email validation function
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Customer validation middleware
const validateCustomer = (req, res, next) => {
  const errors = [];
  
  if (req.body.email !== undefined) {
    if (typeof req.body.email !== 'string') {
      errors.push({ field: 'email', message: 'Email must be a string' });
    } else if (req.body.email.length === 0) {
      errors.push({ field: 'email', message: 'Email cannot be empty' });
    } else if (req.body.email.length > 255) {
      errors.push({ field: 'email', message: 'Email must be less than 255 characters' });
    } else if (!isValidEmail(req.body.email)) {
      errors.push({ field: 'email', message: 'Please provide a valid email address' });
    }
  }
  
  if (req.body.name !== undefined) {
    if (typeof req.body.name !== 'string') {
      errors.push({ field: 'name', message: 'Name must be a string' });
    } else if (req.body.name.length === 0) {
      errors.push({ field: 'name', message: 'Name cannot be empty' });
    } else if (req.body.name.length > 100) {
      errors.push({ field: 'name', message: 'Name must be less than 100 characters' });
    } else if (!/^[a-zA-Z0-9\s\-_\.]+$/.test(req.body.name)) {
      errors.push({ field: 'name', message: 'Name contains invalid characters' });
    }
  }
  
  if (req.body.active !== undefined) {
    if (typeof req.body.active !== 'boolean' && req.body.active !== 'true' && req.body.active !== 'false' && req.body.active !== 1 && req.body.active !== 0) {
      errors.push({ field: 'active', message: 'Active must be a boolean value' });
    }
  }
  
  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors
    });
  }
  
  next();
};

// Customer creation validation (stricter - requires email and name)
const validateCustomerCreation = (req, res, next) => {
  const errors = [];
  
  // Email is required for creation
  if (!req.body.email) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else {
    if (typeof req.body.email !== 'string') {
      errors.push({ field: 'email', message: 'Email must be a string' });
    } else if (req.body.email.length === 0) {
      errors.push({ field: 'email', message: 'Email cannot be empty' });
    } else if (req.body.email.length > 255) {
      errors.push({ field: 'email', message: 'Email must be less than 255 characters' });
    } else if (!isValidEmail(req.body.email)) {
      errors.push({ field: 'email', message: 'Please provide a valid email address' });
    }
  }
  
  // Name is required for creation
  if (!req.body.name) {
    errors.push({ field: 'name', message: 'Name is required' });
  } else {
    if (typeof req.body.name !== 'string') {
      errors.push({ field: 'name', message: 'Name must be a string' });
    } else if (req.body.name.length === 0) {
      errors.push({ field: 'name', message: 'Name cannot be empty' });
    } else if (req.body.name.length > 100) {
      errors.push({ field: 'name', message: 'Name must be less than 100 characters' });
    } else if (!/^[a-zA-Z0-9\s\-_\.]+$/.test(req.body.name)) {
      errors.push({ field: 'name', message: 'Name contains invalid characters' });
    }
  }
  
  // Active field validation (optional)
  if (req.body.active !== undefined) {
    if (typeof req.body.active !== 'boolean' && req.body.active !== 'true' && req.body.active !== 'false' && req.body.active !== 1 && req.body.active !== 0) {
      errors.push({ field: 'active', message: 'Active must be a boolean value' });
    }
  }
  
  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors
    });
  }
  
  next();
};

// Customer ID validation
const validateCustomerId = (req, res, next) => {
  const customerId = req.params.customerId;
  
  if (!customerId) {
    return res.status(400).json({
      error: 'Customer ID is required'
    });
  }
  
  const id = parseInt(customerId, 10);
  if (isNaN(id) || id <= 0) {
    return res.status(400).json({
      error: 'Customer ID must be a positive integer'
    });
  }
  
  // Convert to integer for consistency
  req.params.customerId = id;
  next();
};

module.exports = {
  generalRateLimit,
  writeRateLimit,
  deleteAllRateLimit,
  sanitizeInput,
  validateCustomer,
  validateCustomerCreation,
  validateCustomerId
};
