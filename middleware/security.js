const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const validator = require('validator');
const xss = require('xss');

// Rate limiting configuration
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
    handler: (req, res) => {
      res.status(429).json({
        error: message,
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
  });
};

// Different rate limits for different endpoints
const rateLimits = {
  // General API rate limit
  general: createRateLimit(15 * 60 * 1000, 100, 'Too many requests from this IP'),
  
  // Stricter rate limit for sensitive operations
  strict: createRateLimit(15 * 60 * 1000, 20, 'Too many requests for this operation'),
  
  // Very strict for authentication-related endpoints
  auth: createRateLimit(15 * 60 * 1000, 5, 'Too many authentication attempts')
};

// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
  // Sanitize request body
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  
  // Sanitize query parameters
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query);
  }
  
  // Sanitize URL parameters
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeObject(req.params);
  }
  
  next();
};

// Recursive object sanitization
const sanitizeObject = (obj) => {
  const sanitized = {};
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      
      if (typeof value === 'string') {
        // Remove XSS attempts
        sanitized[key] = xss(value.trim());
        
        // Additional validation for common injection patterns
        sanitized[key] = sanitized[key]
          .replace(/[<>]/g, '') // Remove angle brackets
          .replace(/javascript:/gi, '') // Remove javascript: protocol
          .replace(/on\w+\s*=/gi, ''); // Remove event handlers
          
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        sanitized[key] = sanitizeObject(value);
      } else if (Array.isArray(value)) {
        sanitized[key] = value.map(item => 
          typeof item === 'string' ? xss(item.trim()) : 
          typeof item === 'object' ? sanitizeObject(item) : item
        );
      } else {
        sanitized[key] = value;
      }
    }
  }
  
  return sanitized;
};

// Validation middleware for specific fields
const validateCustomerInput = (req, res, next) => {
  const errors = [];
  
  if (req.body) {
    // Email validation
    if (req.body.email && !validator.isEmail(req.body.email)) {
      errors.push('Invalid email format');
    }
    
    // Name validation (letters, spaces, hyphens only)
    if (req.body.name && !/^[a-zA-Z\s\-']{1,100}$/.test(req.body.name)) {
      errors.push('Name must contain only letters, spaces, hyphens, and apostrophes (max 100 characters)');
    }
    
    // Phone validation (basic format)
    if (req.body.phone && !/^\+?[\d\s\-\(\)]{10,15}$/.test(req.body.phone)) {
      errors.push('Invalid phone number format');
    }
    
    // Address validation
    if (req.body.address && req.body.address.length > 500) {
      errors.push('Address must be less than 500 characters');
    }
  }
  
  // ID parameter validation
  if (req.params.id && !validator.isInt(req.params.id, { min: 1 })) {
    errors.push('Invalid ID parameter');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors
    });
  }
  
  next();
};

// SQL injection prevention middleware
const preventSQLInjection = (req, res, next) => {
  const checkForSQLInjection = (value) => {
    if (typeof value !== 'string') return false;
    
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
      /('|(\\')|(;)|(\\;)|(--)|(\*)|(%)|(\|))/,
      /(\b(OR|AND)\b.*?=.*?=)/i,
      /(1=1|1=0)/i
    ];
    
    return sqlPatterns.some(pattern => pattern.test(value));
  };
  
  const checkObject = (obj) => {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        if (typeof value === 'string' && checkForSQLInjection(value)) {
          return true;
        } else if (typeof value === 'object' && value !== null) {
          if (checkObject(value)) return true;
        }
      }
    }
    return false;
  };
  
  if (req.body && checkObject(req.body)) {
    return res.status(400).json({
      error: 'Invalid input detected'
    });
  }
  
  if (req.query && checkObject(req.query)) {
    return res.status(400).json({
      error: 'Invalid query parameters detected'
    });
  }
  
  if (req.params && checkObject(req.params)) {
    return res.status(400).json({
      error: 'Invalid URL parameters detected'
    });
  }
  
  next();
};

module.exports = {
  rateLimits,
  sanitizeInput,
  validateCustomerInput,
  preventSQLInjection,
  helmet: helmet()
};