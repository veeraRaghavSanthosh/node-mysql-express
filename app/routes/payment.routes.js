module.exports = app => {
  const payments = require("../controllers/payment.controller.js");

  // Create a new Payment
  app.post("/payments", payments.create);

  // Retrieve all Payments (with optional query filters)
  app.get("/payments", payments.findAll);

  // Retrieve a single Payment with paymentId
  app.get("/payments/:paymentId", payments.findOne);

  // Retrieve all Payments for a specific customer
  app.get("/customers/:customerId/payments", payments.findByCustomer);

  // Update a Payment with paymentId
  app.put("/payments/:paymentId", payments.update);

  // Update payment status only
  app.patch("/payments/:paymentId/status", payments.updateStatus);

  // Delete a Payment with paymentId
  app.delete("/payments/:paymentId", payments.delete);

  // Delete all Payments
  app.delete("/payments", payments.deleteAll);
};