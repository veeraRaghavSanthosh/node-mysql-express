module.exports = app => {
  const billing = require("../controllers/billing.controller.js");

  // Create a new Billing record
  app.post("/billing", billing.create);

  // Retrieve all Billing records
  app.get("/billing", billing.findAll);

  // Retrieve a single Billing record with billingId
  app.get("/billing/:billingId", billing.findOne);

  // Retrieve all Billing records for a customer
  app.get("/customers/:customerId/billing", billing.findByCustomer);

  // Update a Billing record with billingId
  app.put("/billing/:billingId", billing.update);

  // Process payment for a billing record
  app.post("/billing/:billingId/payment", billing.processPayment);

  // Delete a Billing record with billingId
  app.delete("/billing/:billingId", billing.delete);

  // Delete all Billing records
  app.delete("/billing", billing.deleteAll);
};