module.exports = app => {
  const payments = require("../controllers/payment.controller.js");

  // Create a new Payment
  app.post("/payments", payments.create);

  // Process a payment
  app.post("/payments/:paymentId/process", payments.process);

  // Retrieve all Payments
  app.get("/payments", payments.findAll);

  // Retrieve a single Payment with paymentId
  app.get("/payments/:paymentId", payments.findOne);

  // Retrieve all payments for a customer
  app.get("/customers/:customerId/payments", payments.findByCustomer);

  // Update payment status
  app.put("/payments/:paymentId/status", payments.updateStatus);

  // Refund a payment
  app.post("/payments/:paymentId/refund", payments.refund);
};