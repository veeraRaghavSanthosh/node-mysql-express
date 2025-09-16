module.exports = app => {
  const payments = require("../controllers/payment.controller.js");

  // Create a new Payment
  app.post("/payments", payments.create);

  // Retrieve a single Payment with paymentId
  app.get("/payments/:paymentId", payments.findOne);

  // Retrieve all Payments for a customer
  app.get("/customers/:customerId/payments", payments.findByCustomer);

  // Process a Payment
  app.post("/payments/:paymentId/process", payments.process);

  // Update Payment status
  app.put("/payments/:paymentId/status", payments.updateStatus);
};