module.exports = app => {
  const customers = require("../controllers/customer.controller.js");
  const {
    createRateLimit,
    generalRateLimit,
    deleteRateLimit,
    sanitizeInput,
    validateCustomerCreation,
    validateCustomerUpdate,
    validateCustomerId,
    handleValidationErrors
  } = require("../middleware/security.middleware.js");

  // Apply general rate limiting to all customer routes
  app.use("/customers*", generalRateLimit);
  
  // Apply input sanitization to all customer routes
  app.use("/customers*", sanitizeInput);

  // Create a new Customer
  app.post("/customers", 
    createRateLimit,
    validateCustomerCreation,
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
    validateCustomerUpdate,
    handleValidationErrors,
    customers.update
  );

  // Delete a Customer with customerId
  app.delete("/customers/:customerId", 
    deleteRateLimit,
    validateCustomerId,
    handleValidationErrors,
    customers.delete
  );

  // Delete all customers
  app.delete("/customers", 
    deleteRateLimit,
    customers.deleteAll
  );
};