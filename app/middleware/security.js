// Security middleware for input sanitization and rate limiting
// Note: This implementation uses basic sanitization. In production, consider using libraries like DOMPurify for client-side or more robust server-side sanitization

// Mock rate limiting implementation (replace with express-rate-limit in production)
const createRateLimit = (windowMs = 15 * 60 * 1000, max = 100, message = 'Too many requests') => {
  const requests = new Map();
  
  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    // Clean old entries
    for (const [ip, data] of requests.entries()) {
      if (now - data.resetTime > windowMs) {
        requests.delete(ip);
      }
    }
    
    if (!requests.has(key)) {
      requests.set(key, { count: 1, resetTime: now });
      return next();
    }
    
    const userData = requests.get(key);
    if (now - userData.resetTime > windowMs) {
      requests.set(key, { count: 1, resetTime: now });
      return next();
    }
    
    if (userData.count >= max) {
      return res.status(429).json({
        error: message,
        retryAfter: Math.ceil((windowMs - (now - userData.resetTime)) / 1000)
      });
    }
    
    userData.count++;
    next();
  };
};

// Rate limiting configurations
const generalRateLimit = createRateLimit(15 * 60 * 1000, 100, 'Too many requests from this IP');
const writeRateLimit = createRateLimit(15 * 60 * 1000, 20, 'Too many write requests from this IP');
const deleteRateLimit = createRateLimit(15 * 60 * 1000, 5, 'Too many delete requests from this IP');

// Input validation functions
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateName = (name) => {
  return typeof name === 'string' && name.trim().length >= 1 && name.length <= 100;
};

const validateCustomerId = (id) => {
  const numId = parseInt(id);
  return !isNaN(numId) && numId > 0;
};

// Input sanitization middleware
const sanitizeRequest = (req, res, next) => {
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/[<>\"'&]/g, (match) => {
        const htmlEntities = {
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#x27;',
          '&': '&amp;'
        };
        return htmlEntities[match];
      })
      .trim();
  };

  const sanitizeObject = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (typeof obj[key] === 'string') {
          obj[key] = sanitizeString(obj[key]);
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitizeObject(obj[key]);
        }
      }
    }
    return obj;
  };

  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  if (req.params) {
    req.params = sanitizeObject(req.params);
  }

  next();
};

// Validation middleware for customer creation
const validateCustomerCreate = (req, res, next) => {
  const errors = [];

  if (!req.body) {
    return res.status(400).json({
      error: 'Request body is required'
    });
  }

  if (!req.body.email || !validateEmail(req.body.email)) {
    errors.push({
      field: 'email',
      message: 'Valid email address is required'
    });
  }

  if (!req.body.name || !validateName(req.body.name)) {
    errors.push({
      field: 'name',
      message: 'Name is required and must be between 1 and 100 characters'
    });
  }

  if (req.body.active !== undefined && typeof req.body.active !== 'boolean') {
    errors.push({
      field: 'active',
      message: 'Active must be a boolean value'
    });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors
    });
  }

  next();
};

// Validation middleware for customer update
const validateCustomerUpdate = (req, res, next) => {
  const errors = [];

  if (!req.body) {
    return res.status(400).json({
      error: 'Request body is required'
    });
  }

  if (!validateCustomerId(req.params.customerId)) {
    errors.push({
      field: 'customerId',
      message: 'Customer ID must be a positive integer'
    });
  }

  if (req.body.email && !validateEmail(req.body.email)) {
    errors.push({
      field: 'email',
      message: 'Please provide a valid email address'
    });
  }

  if (req.body.name && !validateName(req.body.name)) {
    errors.push({
      field: 'name',
      message: 'Name must be between 1 and 100 characters'
    });
  }

  if (req.body.active !== undefined && typeof req.body.active !== 'boolean') {
    errors.push({
      field: 'active',
      message: 'Active must be a boolean value'
    });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors
    });
  }

  next();
};

// Validation middleware for customer ID parameters
const validateCustomerId = (req, res, next) => {
  if (!validateCustomerId(req.params.customerId)) {
    return res.status(400).json({
      error: 'Validation failed',
      details: [{
        field: 'customerId',
        message: 'Customer ID must be a positive integer'
      }]
    });
  }
  next();
};

// Security headers middleware
const securityHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
};

module.exports = {
  generalRateLimit,
  writeRateLimit,
  deleteRateLimit,
  sanitizeRequest,
  validateCustomerCreate,
  validateCustomerUpdate,
  validateCustomerId,
  securityHeaders
};