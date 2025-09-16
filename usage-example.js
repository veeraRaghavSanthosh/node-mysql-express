/**
 * Node.js Express MySQL CRUD API - JavaScript Usage Example
 * 
 * This example demonstrates how to use the Node.js Express MySQL library
 * for creating a RESTful CRUD API with customer management functionality.
 */

const express = require("express");
const bodyParser = require("body-parser");

// Initialize Express app
const app = express();

// Configure middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Optional: Add authentication middleware
const authMiddleware = (req, res, next) => {
  // Add your authentication logic here
  // For example, check JWT tokens, API keys, etc.
  console.log('Authentication middleware executed');
  next();
};

// Apply auth middleware to API routes
app.use('/api/*', authMiddleware);

// Custom middleware example for data processing
function dataProcessingMiddleware(req, res, next) {
  // Example: Add timestamp to all requests
  req.timestamp = new Date().toISOString();
  console.log(`Request received at: ${req.timestamp}`);
  next();
}

// Apply custom middleware
app.use(dataProcessingMiddleware);

// Load customer routes (CRUD operations)
require("./app/routes/customer.routes.js")(app);

// Example of additional custom routes
app.get("/health", (req, res) => {
  res.json({ 
    status: "healthy", 
    timestamp: new Date().toISOString(),
    service: "Node.js Express MySQL API"
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.originalUrl} not found`
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`👥 Customers API: http://localhost:${PORT}/customers`);
});

/**
 * API Endpoints Available:
 * 
 * POST   /customers           - Create a new customer
 * GET    /customers           - Get all customers
 * GET    /customers/:id       - Get customer by ID
 * PUT    /customers/:id       - Update customer by ID
 * DELETE /customers/:id       - Delete customer by ID
 * DELETE /customers           - Delete all customers
 * 
 * Example API Usage with curl:
 * 
 * # Create a customer
 * curl -X POST http://localhost:3000/customers \
 *   -H "Content-Type: application/json" \
 *   -d '{"name":"John Doe","email":"john@example.com","active":true}'
 * 
 * # Get all customers
 * curl http://localhost:3000/customers
 * 
 * # Get customer by ID
 * curl http://localhost:3000/customers/1
 * 
 * # Update customer
 * curl -X PUT http://localhost:3000/customers/1 \
 *   -H "Content-Type: application/json" \
 *   -d '{"name":"Jane Doe","email":"jane@example.com","active":true}'
 * 
 * # Delete customer
 * curl -X DELETE http://localhost:3000/customers/1
 */

// Example of using the Customer model directly (if needed)
const Customer = require("./app/models/customer.model.js");

// Function to demonstrate direct model usage
function exampleDirectModelUsage() {
  // Create a customer using the model directly
  const newCustomer = {
    name: "Direct Model User",
    email: "model@example.com", 
    active: true
  };
  
  Customer.create(newCustomer, (err, data) => {
    if (err) {
      console.error("Error creating customer:", err);
    } else {
      console.log("Customer created:", data);
      
      // Find the created customer
      Customer.findById(data.id, (err, customer) => {
        if (err) {
          console.error("Error finding customer:", err);
        } else {
          console.log("Found customer:", customer);
        }
      });
    }
  });
}

// Uncomment to run direct model usage example
// exampleDirectModelUsage();

module.exports = app;