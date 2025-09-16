const { logger } = require("../config/logger.config.js");

module.exports = app => {
  const payments = require("../controllers/payment.controller.js");

  logger.info("Initializing payment routes");

  // Create a new Payment
  app.post("/payments", payments.create);

  // Retrieve all Payments (with optional filtering)
  app.get("/payments", payments.findAll);

  // Get payment statistics (must come before :paymentId route)
  app.get("/payments/stats", payments.getStats);

  // Retrieve a single Payment with paymentId
  app.get("/payments/:paymentId", payments.findOne);

  // Update a Payment status with paymentId
  app.put("/payments/:paymentId/status", payments.updateStatus);

  // Process a Payment with paymentId
  app.post("/payments/:paymentId/process", payments.processPayment);

  logger.info("Payment routes initialized successfully", {
    routes: [
      "POST /payments",
      "GET /payments",
      "GET /payments/stats",
      "GET /payments/:paymentId", 
      "PUT /payments/:paymentId/status",
      "POST /payments/:paymentId/process"
    ]
  });
};