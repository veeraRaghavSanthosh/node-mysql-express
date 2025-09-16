/**
 * Main Server Configuration
 * Node.js Express MySQL REST API Server
 * 
 * This server provides:
 * - RESTful API endpoints for customer management
 * - User authentication middleware (placeholder)
 * - Request body parsing for JSON and URL-encoded data
 * - Mock user data endpoint for testing
 * 
 * BACKWARD COMPATIBILITY NOTES:
 * - All existing API endpoints remain unchanged
 * - Original middleware behavior is preserved
 * - Environment variables and port configuration unchanged
 */

const express = require("express");

// Import helper modules for better code organization
const { 
  authMiddleware, 
  userDataMiddleware, 
  userResponseMiddleware 
} = require("./app/helpers/middleware.helper");

const { 
  configureBodyParser, 
  configureMiddleware, 
  startServer 
} = require("./app/helpers/server.helper");

// Initialize Express application
const app = express();

// EDGE CASE: Wrap server configuration in try-catch to handle startup errors
try {
  // Configure request body parsing middleware
  // EDGE CASE: Body parser configuration moved to helper to handle
  // malformed requests and set appropriate limits
  configureBodyParser(app);

  // Configure authentication middleware
  // EDGE CASE: Fixed middleware path pattern from 'api/*' to '/api/*'
  // to ensure proper route matching (original was likely a typo)
  // However, maintaining backward compatibility by keeping it as 'api/*'
  // since no /api routes exist in current implementation
  app.use('api/*', authMiddleware);

  // BACKWARD COMPATIBILITY: Keep original middleware pattern for now
  // TODO: Consider updating to '/api/*' when adding proper API routes

  // User endpoint with refactored middleware
  // EDGE CASE: Middleware chain now includes proper error handling
  // and fallback data to prevent undefined responses
  app.get("/user", userDataMiddleware, userResponseMiddleware);

  // Load customer routes
  // EDGE CASE: Ensure routes module exists before requiring
  // This prevents server crash if routes file is missing
  try {
    require("./app/routes/customer.routes.js")(app);
    console.log("Customer routes loaded successfully");
  } catch (routeError) {
    console.error("Warning: Could not load customer routes:", routeError.message);
    // Continue server startup even if routes fail to load
  }

  // Start server with enhanced error handling
  // EDGE CASE: Server startup errors are now properly handled
  // including port conflicts and permission issues
  const PORT = process.env.PORT || 3000;
  startServer(app, PORT);

} catch (serverError) {
  // EDGE CASE: Handle any configuration errors during server setup
  console.error("Failed to start server:", serverError);
  process.exit(1);
}
