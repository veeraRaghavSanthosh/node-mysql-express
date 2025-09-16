const { logger } = require('../utils/logger');

/**
 * Enhanced Authentication Middleware with comprehensive logging
 * Provides trace-level debugging and respects log level configuration
 */

/**
 * Extract relevant request information for logging
 */
function getRequestInfo(req) {
  return {
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress,
    timestamp: new Date().toISOString(),
    headers: {
      authorization: req.headers.authorization ? '[PRESENT]' : '[MISSING]',
      contentType: req.headers['content-type'],
      origin: req.headers.origin
    }
  };
}

/**
 * Main authentication middleware with logging
 */
const authMiddleware = (req, res, next) => {
  const requestInfo = getRequestInfo(req);
  const authLogger = logger.child({ component: 'auth', requestId: generateRequestId() });
  
  // Trace: Log entry into authentication middleware
  authLogger.trace('Authentication middleware invoked', requestInfo);
  
  try {
    // Debug: Log authentication attempt
    authLogger.debug('Processing authentication request', {
      path: req.path,
      method: req.method,
      hasAuthHeader: !!req.headers.authorization
    });

    // Check if this is a public route that doesn't need authentication
    const publicRoutes = ['/health', '/status', '/ping'];
    if (publicRoutes.includes(req.path)) {
      authLogger.trace('Public route accessed, skipping authentication', { path: req.path });
      return next();
    }

    // Trace: Log authentication header analysis
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      authLogger.debug('No authorization header found');
      authLogger.warn('Authentication failed - missing authorization header', {
        path: req.path,
        ip: requestInfo.ip
      });
      
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Authorization header is missing'
      });
    }

    // Trace: Log header parsing
    authLogger.trace('Authorization header present, parsing token');
    
    // Extract token from Bearer header
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : authHeader;
    
    if (!token || token.trim().length === 0) {
      authLogger.debug('Empty or invalid token format');
      authLogger.warn('Authentication failed - invalid token format', {
        path: req.path,
        ip: requestInfo.ip
      });
      
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid token format'
      });
    }

    // Trace: Log token validation process
    authLogger.trace('Token extracted, validating', { 
      tokenLength: token.length,
      tokenPrefix: token.substring(0, 10) + '...' // Log only first 10 chars for security
    });

    // TODO: Implement actual token validation logic here
    // For now, we'll simulate basic validation
    const isValidToken = validateToken(token, authLogger);
    
    if (!isValidToken) {
      authLogger.warn('Authentication failed - invalid token', {
        path: req.path,
        ip: requestInfo.ip,
        tokenPrefix: token.substring(0, 10) + '...'
      });
      
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid or expired token'
      });
    }

    // Debug: Log successful authentication
    authLogger.debug('Authentication successful', {
      path: req.path,
      userId: req.user?.id || 'unknown'
    });

    // Trace: Log middleware completion
    authLogger.trace('Authentication middleware completed successfully');
    
    next();

  } catch (error) {
    // Error: Log any unexpected errors
    authLogger.error('Authentication middleware error', {
      error: error.message,
      stack: error.stack,
      path: req.path,
      ip: requestInfo.ip
    });

    res.status(500).json({
      error: 'Internal server error',
      message: 'Authentication processing failed'
    });
  }
};

/**
 * Token validation function with logging
 * This is a placeholder - implement your actual validation logic
 */
function validateToken(token, authLogger) {
  authLogger.trace('Starting token validation');
  
  try {
    // Placeholder validation logic
    // In a real implementation, you would:
    // 1. Verify JWT signature
    // 2. Check expiration
    // 3. Validate claims
    // 4. Check against database/cache
    
    authLogger.trace('Performing token format validation');
    
    // Simple validation for demo - accept tokens longer than 10 characters
    if (token.length < 10) {
      authLogger.debug('Token validation failed - too short', { length: token.length });
      return false;
    }
    
    // Simulate additional validation steps
    authLogger.trace('Token format validation passed');
    authLogger.trace('Checking token expiration (simulated)');
    authLogger.trace('Validating token signature (simulated)');
    
    // For demo purposes, reject tokens containing 'invalid'
    if (token.toLowerCase().includes('invalid')) {
      authLogger.debug('Token validation failed - contains invalid marker');
      return false;
    }
    
    authLogger.trace('Token validation completed successfully');
    return true;
    
  } catch (error) {
    authLogger.error('Token validation error', {
      error: error.message,
      tokenPrefix: token.substring(0, 10) + '...'
    });
    return false;
  }
}

/**
 * Generate a unique request ID for tracing
 */
function generateRequestId() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

/**
 * Optional: Create a more specific auth logger for different auth types
 */
const createAuthLogger = (authType = 'default') => {
  return logger.child({ component: 'auth', authType });
};

/**
 * Optional: Middleware for API key authentication with logging
 */
const apiKeyAuthMiddleware = (req, res, next) => {
  const authLogger = logger.child({ component: 'auth', type: 'apikey' });
  
  authLogger.trace('API Key authentication middleware invoked');
  
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    authLogger.warn('API Key authentication failed - missing key', {
      path: req.path,
      ip: req.ip
    });
    return res.status(401).json({ error: 'API Key required' });
  }
  
  authLogger.debug('API Key authentication successful');
  next();
};

module.exports = {
  authMiddleware,
  apiKeyAuthMiddleware,
  createAuthLogger,
  // Backward compatibility - export the main middleware as default
  default: authMiddleware
};