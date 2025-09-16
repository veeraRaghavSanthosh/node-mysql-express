module.exports = app => {
  const customers = require("../controllers/customer.controller.js");
  const {
    generalRateLimit,
    writeRateLimit,
    deleteAllRateLimit,
    sanitizeInput,
    validateCustomer,
    validateCustomerCreation,
    validateCustomerId
  } = require("../middleware/security.js");

  // Apply general rate limiting and input sanitization to all routes
  app.use("/customers*", generalRateLimit, sanitizeInput);

  // Create a new Customer - with stricter validation and rate limiting
  app.post("/customers", writeRateLimit, validateCustomerCreation, customers.create);

  // Retrieve all Customers
  app.get("/customers", customers.findAll);

  // Retrieve a single Customer with customerId - with ID validation
  app.get("/customers/:customerId", validateCustomerId, customers.findOne);

  // Update a Customer with customerId - with validation and rate limiting
  app.put("/customers/:customerId", writeRateLimit, validateCustomerId, validateCustomer, customers.update);

  // Delete a Customer with customerId - with validation and rate limiting
  app.delete("/customers/:customerId", writeRateLimit, validateCustomerId, customers.delete);

  // Delete all Customers - with very strict rate limiting
  app.delete("/customers", deleteAllRateLimit, customers.deleteAll);
};
