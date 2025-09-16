/**
 * Order Routes
 * 
 * Defines API routes for order operations with backward compatibility
 * for both regular IDs and legacy_ids.
 */

module.exports = app => {
  const orders = require("../controllers/order.controller.js");

  var router = require("express").Router();

  // Create a new Order
  router.post("/", orders.create);

  // Retrieve all Orders
  router.get("/", orders.findAll);

  // Retrieve orders by customer ID
  router.get("/customer/:customerId", orders.findByCustomer);

  // Retrieve a single Order by id (supports both regular ID and legacy_id)
  router.get("/:id", orders.findOne);

  // Retrieve a single Order by legacy_id specifically (explicit endpoint)
  router.get("/legacy/:legacyId", orders.findByLegacyId);

  // Update an Order with id (supports both regular ID and legacy_id)
  router.put("/:id", orders.update);

  // Delete an Order with id (supports both regular ID and legacy_id)
  router.delete("/:id", orders.delete);

  // Delete all Orders (use with caution!)
  router.delete("/", orders.deleteAll);

  app.use('/api/orders', router);
};