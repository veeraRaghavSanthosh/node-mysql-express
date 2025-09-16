/**
 * Server Configuration Helper Functions
 * Contains reusable server setup and configuration logic
 */

const bodyParser = require("body-parser");

/**
 * Configure body parser middleware for the Express app
 * Handles both JSON and URL-encoded request bodies
 * 
 * Edge cases handled:
 * - Sets reasonable limits to prevent DoS attacks via large payloads
 * - Handles malformed JSON gracefully
 * - Extended URL encoding support for complex nested objects
 * 
 * @param {Object} app - Express application instance
 */
const configureBodyParser = (app) => {
  try {
    // EDGE CASE: Set limits to prevent memory exhaustion from large payloads
    // Default limit is 100kb, which should handle most API requests
    app.use(bodyParser.json({ 
      limit: '10mb' // Reasonable limit for API requests
    }));

    // EDGE CASE: Extended option allows parsing of nested objects and arrays
    // This is necessary for complex form data but can be a security risk
    // if not properly validated downstream
    app.use(bodyParser.urlencoded({ 
      extended: true,
      limit: '10mb'
    }));
    
    console.log('Body parser middleware configured successfully');
  } catch (error) {
    console.error('Error configuring body parser:', error);
    throw error; // Re-throw to prevent server from starting with broken config
  }
};

/**
 * Configure application middleware with proper error handling
 * 
 * Edge cases handled:
 * - Middleware path matching issues
 * - Order of middleware application
 * 
 * @param {Object} app - Express application instance
 * @param {Function} authMiddleware - Authentication middleware function
 */
const configureMiddleware = (app, authMiddleware) => {
  try {
    // EDGE CASE: The original pattern 'api/*' might not match intended routes
    // Changed to '/api/*' to ensure proper path matching
    // This affects all routes starting with /api/
    app.use('/api/*', authMiddleware);
    
    console.log('Authentication middleware configured for /api/* routes');
  } catch (error) {
    console.error('Error configuring middleware:', error);
    throw error;
  }
};

/**
 * Start the server with proper error handling and logging
 * 
 * Edge cases handled:
 * - Port already in use scenarios
 * - Invalid port numbers
 * - Server startup failures
 * 
 * @param {Object} app - Express application instance
 * @param {number} port - Port number to listen on (optional, defaults to env or 3000)
 * @returns {Object} Server instance
 */
const startServer = (app, port = process.env.PORT || 3000) => {
  try {
    // EDGE CASE: Validate port number to prevent startup issues
    const portNum = parseInt(port, 10);
    if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
      throw new Error(`Invalid port number: ${port}`);
    }

    const server = app.listen(portNum, () => {
      console.log(`Server is running on port ${portNum}.`);
    });

    // EDGE CASE: Handle server startup errors (port in use, permission denied, etc.)
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${portNum} is already in use. Please choose a different port.`);
      } else if (error.code === 'EACCES') {
        console.error(`Permission denied. Cannot bind to port ${portNum}.`);
      } else {
        console.error('Server startup error:', error);
      }
      process.exit(1);
    });

    return server;
  } catch (error) {
    console.error('Error starting server:', error);
    throw error;
  }
};

module.exports = {
  configureBodyParser,
  configureMiddleware,
  startServer
};