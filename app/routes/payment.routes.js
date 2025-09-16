module.exports = app => {
  const payments = require("../controllers/payment.controller.js");

  // Create a new Payment
  app.post("/payments", payments.create);

  // Retrieve all Payments
  app.get("/payments", payments.findAll);

  // Retrieve a single Payment with paymentId
  app.get("/payments/:paymentId", payments.findOne);

  // Retrieve payments by customer ID
  app.get("/customers/:customerId/payments", payments.findByCustomer);

  // Update Payment status
  app.put("/payments/:paymentId/status", payments.updateStatus);

  // Refund a Payment
  app.post("/payments/:paymentId/refund", payments.refund);
};