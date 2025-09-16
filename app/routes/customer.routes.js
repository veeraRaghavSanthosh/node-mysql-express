module.exports = app => {
  const customers = require("../controllers/customer.controller.js");
  const { 
    strictLimiter, 
    deleteLimiter, 
    validateCustomerInput, 
    validateCustomerId, 
    handleValidationErrors,
    sanitizeInput 
  } = require("../middleware/security");

  // Create a new Customer
  app.post("/customers", 
    strictLimiter, 
    sanitizeInput, 
    validateCustomerInput, 
    handleValidationErrors, 
    customers.create
  );

  // Retrieve all Customers
  app.get("/customers", customers.findAll);

  // Retrieve a single Customer with customerId
  app.get("/customers/:customerId", 
    validateCustomerId, 
    handleValidationErrors, 
    customers.findOne
  );

  // Update a Customer with customerId
  app.put("/customers/:customerId", 
    strictLimiter, 
    sanitizeInput, 
    validateCustomerId, 
    validateCustomerInput, 
    handleValidationErrors, 
    customers.update
  );

  // Delete a Customer with customerId
  app.delete("/customers/:customerId", 
    deleteLimiter, 
    validateCustomerId, 
    handleValidationErrors, 
    customers.delete
  );

  // Delete all Customers (very dangerous operation)
  app.delete("/customers", 
    deleteLimiter, 
    customers.deleteAll
  );
};
