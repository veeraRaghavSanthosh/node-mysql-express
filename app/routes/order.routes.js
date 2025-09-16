/**
 * Order Routes
 * Defines REST API endpoints for order processing functionality
 * 
 * These routes are completely additive and maintain full backward compatibility
 * with the existing customer management system.
 */

module.exports = app => {
  const orders = require("../controllers/order.controller.js");

  var router = require("express").Router();

  // Process a single order
  // POST /api/orders/process
  // Body: { items: [...], options: {...} }
  router.post("/process", orders.processOrder);

  // Get processing history
  // GET /api/orders/history
  router.get("/history", orders.getHistory);

  // Clear processing history
  // DELETE /api/orders/history
  router.delete("/history", orders.clearHistory);

  // Validate order items
  // POST /api/orders/validate
  // Body: { items: [...] }
  router.post("/validate", orders.validateItems);

  // Process multiple orders in batch
  // POST /api/orders/batch
  // Body: { orderBatch: [[...], [...]], options: {...} }
  router.post("/batch", orders.processBatch);

  // Get processing statistics
  // GET /api/orders/statistics
  router.get("/statistics", orders.getStatistics);

  app.use('/api/orders', router);
};