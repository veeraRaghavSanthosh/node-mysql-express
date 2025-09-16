module.exports = app => {
  const customers = require("../controllers/customer.controller.js");
  const { rateLimits, validationRules, sanitizeInput, handleValidationErrors } = require("../../security.middleware.js");

  // Apply general rate limiting to all customer routes
  app.use("/customers*", rateLimits.general);
  
  // Apply input sanitization to all routes
  app.use("/customers*", sanitizeInput);

  // Create a new Customer
  app.post("/customers", 
    rateLimits.mutations,
    validationRules.createCustomer,
    handleValidationErrors,
    customers.create
  );

  // Retrieve all Customers
  app.get("/customers", customers.findAll);

  // Retrieve a single Customer with customerId
  app.get("/customers/:customerId", 
    validationRules.getCustomer,
    handleValidationErrors,
    customers.findOne
  );

  // Update a Customer with customerId
  app.put("/customers/:customerId", 
    rateLimits.mutations,
    validationRules.updateCustomer,
    handleValidationErrors,
    customers.update
  );

  // Delete a Customer with customerId
  app.delete("/customers/:customerId", 
    rateLimits.mutations,
    validationRules.getCustomer,
    handleValidationErrors,
    customers.delete
  );

  // Delete all Customers - with strictest rate limiting
  app.delete("/customers", 
    rateLimits.deleteAll,
    customers.deleteAll
  );
};