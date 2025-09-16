module.exports = app => {
  const payments = require("../controllers/payment.controller.js");

  // Create a new Payment
  app.post("/payments", payments.create);

  // Retrieve all Payments
  app.get("/payments", payments.findAll);

  // Retrieve a single Payment with paymentId
  app.get("/payments/:paymentId", payments.findOne);

  // Retrieve all Payments for a specific Customer
  app.get("/customers/:customerId/payments", payments.findByCustomerId);

  // Update a Payment with paymentId
  app.put("/payments/:paymentId", payments.update);

  // Delete a Payment with paymentId
  app.delete("/payments/:paymentId", payments.delete);
};