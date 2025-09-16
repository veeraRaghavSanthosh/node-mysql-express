/**
 * Node.js Express MySQL API - JavaScript Usage Examples
 * 
 * This example demonstrates how to use the node-mysql-express library
 * for building RESTful CRUD APIs with Express and MySQL.
 * 
 * Installation:
 * npm install express mysql body-parser
 * 
 * For development:
 * npm install --save-dev nodemon
 */

const express = require("express");
const bodyParser = require("body-parser");

// Import the database configuration and models
const dbConfig = require("./app/config/db.config.js");
const Customer = require("./app/models/customer.model.js");

const app = express();

// Middleware setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Optional: Custom authentication middleware
const authMiddleware = (req, res, next) => {
  // Add your authentication logic here
  console.log('Request received:', req.method, req.path);
  next();
};

// Apply auth middleware to API routes
app.use('/api/*', authMiddleware);

// ============================================================================
// BASIC USAGE EXAMPLES
// ============================================================================

// Example 1: Create a new customer
app.post('/api/customers', (req, res) => {
  // Validate request
  if (!req.body || !req.body.email || !req.body.name) {
    return res.status(400).send({
      message: "Email and name are required!"
    });
  }

  // Create a Customer instance
  const customer = new Customer({
    email: req.body.email,
    name: req.body.name,
    active: req.body.active !== undefined ? req.body.active : true
  });

  // Save to database
  Customer.create(customer, (err, data) => {
    if (err) {
      res.status(500).send({
        message: err.message || "Error occurred while creating the Customer."
      });
    } else {
      res.status(201).send(data);
    }
  });
});

// Example 2: Get all customers
app.get('/api/customers', (req, res) => {
  Customer.getAll((err, data) => {
    if (err) {
      res.status(500).send({
        message: err.message || "Error occurred while retrieving customers."
      });
    } else {
      res.send(data);
    }
  });
});

// Example 3: Get customer by ID
app.get('/api/customers/:id', (req, res) => {
  const customerId = req.params.id;
  
  Customer.findById(customerId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Customer with id ${customerId} not found.`
        });
      } else {
        res.status(500).send({
          message: `Error retrieving Customer with id ${customerId}`
        });
      }
    } else {
      res.send(data);
    }
  });
});

// Example 4: Update customer
app.put('/api/customers/:id', (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Content cannot be empty!"
    });
  }

  const customerId = req.params.id;
  const customer = new Customer(req.body);

  Customer.updateById(customerId, customer, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Customer with id ${customerId} not found.`
        });
      } else {
        res.status(500).send({
          message: `Error updating Customer with id ${customerId}`
        });
      }
    } else {
      res.send(data);
    }
  });
});

// Example 5: Delete customer
app.delete('/api/customers/:id', (req, res) => {
  const customerId = req.params.id;

  Customer.remove(customerId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Customer with id ${customerId} not found.`
        });
      } else {
        res.status(500).send({
          message: `Could not delete Customer with id ${customerId}`
        });
      }
    } else {
      res.send({ message: "Customer was deleted successfully!" });
    }
  });
});

// Example 6: Delete all customers
app.delete('/api/customers', (req, res) => {
  Customer.removeAll((err, data) => {
    if (err) {
      res.status(500).send({
        message: err.message || "Error occurred while removing all customers."
      });
    } else {
      res.send({ message: "All Customers were deleted successfully!" });
    }
  });
});

// ============================================================================
// ADVANCED USAGE EXAMPLES
// ============================================================================

// Example 7: Custom middleware chain
const validateCustomer = (req, res, next) => {
  const { email, name } = req.body;
  
  if (!email || !email.includes('@')) {
    return res.status(400).send({ message: "Valid email is required" });
  }
  
  if (!name || name.length < 2) {
    return res.status(400).send({ message: "Name must be at least 2 characters" });
  }
  
  next();
};

const logRequest = (req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
};

// Apply multiple middlewares
app.post('/api/customers/validated', logRequest, validateCustomer, (req, res) => {
  const customer = new Customer(req.body);
  
  Customer.create(customer, (err, data) => {
    if (err) {
      res.status(500).send({ message: err.message });
    } else {
      res.status(201).send(data);
    }
  });
});

// Example 8: Error handling wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Example 9: Search customers (if you extend the model)
app.get('/api/customers/search', (req, res) => {
  const { name, email, active } = req.query;
  
  // This would require extending the Customer model with a search method
  // Customer.search({ name, email, active }, (err, data) => { ... });
  
  res.send({ message: "Search functionality - extend Customer model as needed" });
});

// ============================================================================
// SERVER SETUP
// ============================================================================

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).send({
    message: "Internal server error",
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).send({
    message: `Route ${req.originalUrl} not found`
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API endpoints available at http://localhost:${PORT}/api/customers`);
});

// ============================================================================
// USAGE AS A CLIENT (for testing your API)
// ============================================================================

/**
 * Example HTTP requests you can make to test the API:
 * 
 * // Create customer
 * curl -X POST http://localhost:3000/api/customers \
 *   -H "Content-Type: application/json" \
 *   -d '{"name":"John Doe","email":"john@example.com","active":true}'
 * 
 * // Get all customers
 * curl http://localhost:3000/api/customers
 * 
 * // Get customer by ID
 * curl http://localhost:3000/api/customers/1
 * 
 * // Update customer
 * curl -X PUT http://localhost:3000/api/customers/1 \
 *   -H "Content-Type: application/json" \
 *   -d '{"name":"Jane Doe","email":"jane@example.com","active":false}'
 * 
 * // Delete customer
 * curl -X DELETE http://localhost:3000/api/customers/1
 */

module.exports = app;