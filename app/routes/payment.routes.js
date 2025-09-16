module.exports = app => {
  const payments = require("../controllers/payment.controller.js");

  // Create and process a new payment
  app.post("/api/payments", payments.create);

  // Retrieve all payments
  app.get("/api/payments", payments.findAll);

  // Retrieve a single payment by ID
  app.get("/api/payments/:paymentId", payments.findOne);

  // Retrieve all payments for a specific customer
  app.get("/api/customers/:customerId/payments", payments.findByCustomer);

  // Update payment status
  app.put("/api/payments/:paymentId/status", payments.updateStatus);

  // Process refund for a payment
  app.post("/api/payments/:paymentId/refund", payments.refund);

  // Delete a payment (admin only - should be restricted in production)
  app.delete("/api/payments/:paymentId", payments.delete);
};