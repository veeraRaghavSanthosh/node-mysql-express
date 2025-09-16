const express = require("express");
const bodyParser = require("body-parser");

const app = express();

// Trust proxy for rate limiting to work properly behind proxies
app.set('trust proxy', 1);

// Basic security headers middleware
const securityHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
};

// Apply security headers to all routes
app.use(securityHeaders);

const authMiddleware = (req, res, next) => {
  next()
}

// parse requests of content-type - application/json
// Add size limits to prevent DoS attacks
app.use(bodyParser.json({ limit: '10mb' }));
app.use('api/*', authMiddleware);

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

function middleware1(req, res, next) {
  // Logic to supply the data 
  const users = [
    {
      "id": 1,
      "name": "test3"
    },
    {
      "id": 2,
      "name": "test4"
    }
  ];
  req.users = users;
  next();
};

function middleware2(req, res, next) {
  const users = req.users;
  res.json({ user: users });
};

// simple route
app.get("/user", middleware1, middleware2);

// Include customer routes with security middleware
require("./app/routes/customer.routes.js")(app);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found'
  });
});

// set port, listen for requests
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
