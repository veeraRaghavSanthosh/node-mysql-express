module.exports = app => {
  const customers = require("../controllers/customer.controller.js");
  const {
    strictRateLimit,
    deleteRateLimit,
    customerCreateValidationRules,
    customerValidationRules,
    customerIdValidationRules,
    handleValidationErrors,
    sanitizeInput
  } = require("../middleware/security");

  // Create a new Customer
  app.post("/customers", 
    strictRateLimit,
    sanitizeInput,
    customerCreateValidationRules(),
    handleValidationErrors,
    customers.create
  );

  // Retrieve all Customers
  app.get("/customers", customers.findAll);

  // Retrieve a single Customer with customerId
  app.get("/customers/:customerId", 
    customerIdValidationRules(),
    handleValidationErrors,
    customers.findOne
  );

  // Update a Customer with customerId
  app.put("/customers/:customerId", 
    strictRateLimit,
    sanitizeInput,
    customerIdValidationRules(),
    customerValidationRules(),
    handleValidationErrors,
    customers.update
  );

  // Delete a Customer with customerId
  app.delete("/customers/:customerId", 
    deleteRateLimit,
    customerIdValidationRules(),
    handleValidationErrors,
    customers.delete
  );

  // Delete all Customers
  app.delete("/customers", 
    deleteRateLimit,
    customers.deleteAll
  );
};
