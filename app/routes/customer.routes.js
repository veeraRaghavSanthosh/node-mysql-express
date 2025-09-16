module.exports = app => {
  const customers = require("../controllers/customer.controller.js");
  const {
    strictLimiter,
    deleteLimiter,
    customerValidationRules,
    customerIdValidation,
    handleValidationErrors
  } = require("../middleware/security.middleware");

  // Create a new Customer
  app.post("/customers", 
    strictLimiter,
    customerValidationRules(),
    handleValidationErrors,
    customers.create
  );

  // Retrieve all Customers
  app.get("/customers", customers.findAll);

  // Retrieve a single Customer with customerId
  app.get("/customers/:customerId", 
    customerIdValidation(),
    handleValidationErrors,
    customers.findOne
  );

  // Update a Customer with customerId
  app.put("/customers/:customerId", 
    strictLimiter,
    customerIdValidation(),
    customerValidationRules(),
    handleValidationErrors,
    customers.update
  );

  // Delete a Customer with customerId
  app.delete("/customers/:customerId", 
    deleteLimiter,
    customerIdValidation(),
    handleValidationErrors,
    customers.delete
  );

  // Delete all Customers - DANGEROUS operation with strict limiting
  app.delete("/customers", 
    deleteLimiter,
    customers.deleteAll
  );
};
