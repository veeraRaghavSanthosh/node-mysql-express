const express = require("express");
const bodyParser = require("body-parser");

const app = express();

// =============================================================================
// HELPER FUNCTIONS - Extracted repeated logic patterns
// =============================================================================

/**
 * Creates a standardized JSON response helper
 * Handles common response patterns and edge cases
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {Object} data - Response data
 * @param {string} message - Optional message
 */
const sendJsonResponse = (res, statusCode = 200, data = null, message = null) => {
  // Edge case: Ensure response hasn't been sent already
  if (res.headersSent) {
    console.warn('Attempted to send response after headers were already sent');
    return;
  }
  
  const response = {};
  if (data !== null) response.data = data;
  if (message !== null) response.message = message;
  
  res.status(statusCode).json(response);
};

/**
 * Generic middleware factory for data injection
 * Reduces code duplication for middleware that adds data to request
 * @param {string} dataKey - Key to attach data to request object
 * @param {*} data - Data to attach (can be function that returns data)
 */
const createDataInjectionMiddleware = (dataKey, data) => {
  return (req, res, next) => {
    try {
      // Edge case: Handle both static data and data functions
      req[dataKey] = typeof data === 'function' ? data() : data;
      next();
    } catch (error) {
      // Edge case: Handle errors in data generation
      console.error(`Error in data injection middleware for ${dataKey}:`, error);
      sendJsonResponse(res, 500, null, 'Internal server error during data processing');
    }
  };
};

/**
 * Generic response middleware factory
 * Standardizes response handling patterns
 * @param {string} dataKey - Key to read data from request object
 * @param {string} responseKey - Key to use in JSON response
 */
const createResponseMiddleware = (dataKey, responseKey = dataKey) => {
  return (req, res, next) => {
    try {
      const data = req[dataKey];
      
      // Edge case: Handle missing data
      if (data === undefined) {
        return sendJsonResponse(res, 500, null, `Missing required data: ${dataKey}`);
      }
      
      // Edge case: Handle null/empty data
      if (data === null || (Array.isArray(data) && data.length === 0)) {
        return sendJsonResponse(res, 404, null, `No ${responseKey} found`);
      }
      
      sendJsonResponse(res, 200, { [responseKey]: data });
    } catch (error) {
      console.error(`Error in response middleware for ${dataKey}:`, error);
      sendJsonResponse(res, 500, null, 'Internal server error during response generation');
    }
  };
};

// =============================================================================
// MIDDLEWARE DEFINITIONS - Using extracted helpers
// =============================================================================

/**
 * Authentication middleware - placeholder implementation
 * Edge case: Currently allows all requests through
 * TODO: Implement actual authentication logic
 */
const authMiddleware = (req, res, next) => {
  // Edge case: In production, this should validate tokens/sessions
  // For now, allowing all requests through
  next();
};

// Mock user data factory - demonstrates data function usage
const getUsersData = () => [
  {
    "id": 1,
    "name": "test3"
  },
  {
    "id": 2,
    "name": "test4"
  }
];

// Create specific middleware using helper functions
const userDataMiddleware = createDataInjectionMiddleware('users', getUsersData);
const userResponseMiddleware = createResponseMiddleware('users', 'user');

// =============================================================================
// EXPRESS APP CONFIGURATION
// =============================================================================

// Body parser middleware - order matters for proper request parsing
app.use(bodyParser.json({ 
  limit: '10mb', // Edge case: Prevent oversized payloads
  strict: true   // Edge case: Only parse arrays and objects
}));

app.use(bodyParser.urlencoded({ 
  extended: true,
  limit: '10mb' // Edge case: Consistent size limits
}));

// Apply authentication to API routes
// Edge case: Only applies to paths starting with 'api/'
app.use('/api/*', authMiddleware);

// =============================================================================
// ROUTES DEFINITION
// =============================================================================

// User endpoint using extracted middleware helpers
app.get("/user", userDataMiddleware, userResponseMiddleware);

// Customer routes from external module
// Edge case: Ensure the routes module exists and exports a function
try {
  require("./app/routes/customer.routes.js")(app);
} catch (error) {
  console.error('Failed to load customer routes:', error.message);
  // Edge case: Continue server startup even if routes fail to load
}

// =============================================================================
// SERVER STARTUP
// =============================================================================

// Edge case: Handle PORT as string from environment variables
let PORT = parseInt(process.env.PORT, 10) || 3000;

// Edge case: Validate port range
if (PORT < 1 || PORT > 65535) {
  console.error(`Invalid port number: ${PORT}. Using default port 3000.`);
  PORT = 3000;
}

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

// Edge case: Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});
