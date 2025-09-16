module.exports = app => {
  const customers = require("../controllers/customer.controller.js");
  const security = require("../middleware/security");

  // Create a new Customer - with validation and write rate limiting
  app.post("/customers", 
    security.writeRateLimit,
    security.validateCustomerCreate, 
    customers.create
  );

  // Retrieve all Customers - with general rate limiting
  app.get("/customers", customers.findAll);

  // Retrieve a single Customer with customerId - with ID validation
  app.get("/customers/:customerId", 
    security.validateCustomerId, 
    customers.findOne
  );

  // Update a Customer with customerId - with validation and write rate limiting
  app.put("/customers/:customerId", 
    security.writeRateLimit,
    security.validateCustomerUpdate, 
    customers.update
  );

  // Delete a Customer with customerId - with ID validation and delete rate limiting
  app.delete("/customers/:customerId", 
    security.deleteRateLimit,
    security.validateCustomerId, 
    customers.delete
  );

  // Delete all Customers - with strict delete rate limiting
  app.delete("/customers", 
    security.deleteRateLimit, 
    customers.deleteAll
  );
};