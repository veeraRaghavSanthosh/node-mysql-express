const express = require("express");
const bodyParser = require("body-parser");

const app = express();

// Enhanced authMiddleware with null validation
const authMiddleware = (req, res, next) => {
  // Add validation for request object to prevent TypeError
  if (!req) {
    return res.status(400).json({ error: 'Invalid request' });
  }
  next();
}

// parse requests of content-type - application/json
app.use(bodyParser.json());

// Fixed: Added missing '/' before api
app.use('/api/*', authMiddleware);

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// Enhanced middleware1 with validation
function middleware1(req, res, next) {
  // Add validation for request object to prevent TypeError
  if (!req) {
    return res.status(400).json({ error: 'Invalid request object' });
  }

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
}

// Enhanced middleware2 with comprehensive validation
function middleware2(req, res, next) {
  // Add validation for request object to prevent TypeError
  if (!req) {
    return res.status(400).json({ error: 'Invalid request object' });
  }
  
  // Add validation for response object
  if (!res) {
    throw new Error('Invalid response object');
  }
  
  const users = req.users;
  
  // Add validation for users data to prevent TypeError when accessing properties
  if (!users || !Array.isArray(users)) {
    return res.status(500).json({ error: 'Users data not found or invalid' });
  }
  
  res.json({ user: users });
}

// simple route
app.get("/user", middleware1, middleware2);

// Safely require routes with error handling
try {
  require("./app/routes/customer.routes.js")(app);
} catch (error) {
  console.warn('Warning: Could not load customer routes:', error.message);
}

// set port, listen for requests
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

module.exports = app;