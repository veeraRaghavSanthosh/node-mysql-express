module.exports = app => {
  const customers = require("../controllers/customer.controller.js");
  const {
    generalLimiter,
    strictLimiter,
    validateCustomer,
    validateCustomerId,
    handleValidationErrors
  } = require("../../security-middleware.js");

  // Create a new Customer
  app.post("/customers", 
    strictLimiter, 
    validateCustomer, 
    handleValidationErrors, 
    customers.create
  );

  // Retrieve all Customers
  app.get("/customers", 
    generalLimiter, 
    customers.findAll
  );

  // Retrieve a single Customer with customerId
  app.get("/customers/:customerId", 
    generalLimiter, 
    validateCustomerId, 
    handleValidationErrors, 
    customers.findOne
  );

  // Update a Customer with customerId
  app.put("/customers/:customerId", 
    strictLimiter, 
    validateCustomerId, 
    validateCustomer, 
    handleValidationErrors, 
    customers.update
  );

  // Delete a Customer with customerId
  app.delete("/customers/:customerId", 
    strictLimiter, 
    validateCustomerId, 
    handleValidationErrors, 
    customers.delete
  );

  // Delete all Customers
  app.delete("/customers", 
    strictLimiter, 
    customers.deleteAll
  );
};
