const { rateLimiters, customerValidationRules, handleValidationErrors } = require("../middleware/security");

module.exports = app => {
  const customers = require("../controllers/customer.controller.js");

  // Create a new Customer (with stricter rate limiting and validation)
  app.post("/customers", 
    rateLimiters.create,
    customerValidationRules.create,
    handleValidationErrors,
    customers.create
  );

  // Retrieve all Customers (with read rate limiting)
  app.get("/customers", 
    rateLimiters.read,
    customers.findAll
  );

  // Retrieve a single Customer with customerId (with validation)
  app.get("/customers/:customerId", 
    rateLimiters.read,
    customerValidationRules.findOne,
    handleValidationErrors,
    customers.findOne
  );

  // Update a Customer with customerId (with validation and rate limiting)
  app.put("/customers/:customerId", 
    rateLimiters.update,
    customerValidationRules.update,
    handleValidationErrors,
    customers.update
  );

  // Delete a Customer with customerId (with validation and stricter rate limiting)
  app.delete("/customers/:customerId", 
    rateLimiters.delete,
    customerValidationRules.delete,
    handleValidationErrors,
    customers.delete
  );

  // Delete all Customers (with stricter rate limiting)
  app.delete("/customers", 
    rateLimiters.delete,
    customers.deleteAll
  );
};