const express = require("express");
const bodyParser = require("body-parser");
const { logger } = require("./app/utils/logger");
const { authMiddleware: enhancedAuthMiddleware } = require("./app/middleware/auth.middleware");

const app = express();

// Initialize logging
logger.info('Server initialization started');

// Enhanced authentication middleware with logging
// Maintains backward compatibility with the original authMiddleware
const authMiddleware = (req, res, next) => {
  logger.trace('Auth middleware invoked - using enhanced version');
  enhancedAuthMiddleware(req, res, next);
};

// parse requests of content-type - application/json
app.use(bodyParser.json());
app.use('api/*', authMiddleware);



 
// GET, PUT, POST, DELETE, 


// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));


function middleware1 (req,res,next)  {
  logger.trace('Middleware1 invoked');
  logger.debug('Supplying user data to request');
  
  // Logic to supply the data 
  const users=[
    {
        "id": 1,
        "name": "test3"
    },
    {
        "id": 2,
        "name": "test4"
    }
];
  req.users=users;
  logger.debug('User data attached to request', { userCount: users.length });
  next();
};

function middleware2 (req,res,next){
  logger.trace('Middleware2 invoked');
  const users= req.users;
  logger.debug('Sending user data response', { userCount: users?.length || 0 });
  res.json({ user:users });
};

// simple route with logging
app.get("/user", (req, res, next) => {
  logger.info('User endpoint accessed', { 
    method: req.method, 
    path: req.path,
    ip: req.ip 
  });
  next();
}, middleware1, middleware2);

// Add health check endpoint (public route)
app.get("/health", (req, res) => {
  logger.debug('Health check endpoint accessed');
  res.json({ 
    status: "healthy", 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Add status endpoint (public route) 
app.get("/status", (req, res) => {
  logger.debug('Status endpoint accessed');
  res.json({
    status: "running",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
    logLevel: logger.level
  });
});

// Load customer routes with error handling
try {
  require("./app/routes/customer.routes.js")(app);
  logger.info('Customer routes loaded successfully');
} catch (error) {
  logger.error('Failed to load customer routes', { error: error.message });
}

// Error handling middleware
app.use((error, req, res, next) => {
  logger.error('Unhandled application error', {
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    ip: req.ip
  });
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  logger.warn('Route not found', {
    path: req.path,
    method: req.method,
    ip: req.ip
  });
  
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

// set port, listen for requests
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`, {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    logLevel: logger.level,
    pid: process.pid
  });
  
  // Log configuration info on startup
  logger.debug('Server configuration', {
    logLevel: logger.level,
    colorsEnabled: logger.enableColors,
    timestampsEnabled: logger.enableTimestamps
  });
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.fatal('Uncaught exception', {
    error: error.message,
    stack: error.stack
  });
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.fatal('Unhandled promise rejection', {
    reason: reason,
    promise: promise
  });
  process.exit(1);
});