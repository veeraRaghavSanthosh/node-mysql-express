module.exports = app => {
  const orders = require("../controllers/order.controller.js");

  var router = require("express").Router();

  // Create a new Order
  router.post("/", orders.create);

  // Retrieve all Orders
  router.get("/", orders.findAll);

  // Retrieve a single Order with orderId
  router.get("/:orderId", orders.findOne);

  // Retrieve a single Order by legacy_id (for backward compatibility)
  router.get("/legacy/:legacyId", orders.findByLegacyId);

  // Retrieve all Orders for a specific customer
  router.get("/customer/:customerId", orders.findByCustomerId);

  // Update an Order with orderId
  router.put("/:orderId", orders.update);

  // Update Order status
  router.patch("/:orderId/status", orders.updateStatus);

  // Delete an Order with orderId
  router.delete("/:orderId", orders.delete);

  // Delete all Orders
  router.delete("/", orders.deleteAll);

  app.use('/api/orders', router);
};