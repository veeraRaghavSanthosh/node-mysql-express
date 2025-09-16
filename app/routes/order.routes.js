module.exports = app => {
  const orders = require("../controllers/order.controller.js");

  // Create a new Order
  app.post("/orders", orders.create);

  // Process an order without saving
  app.post("/orders/process", orders.process);

  // Process batch of orders
  app.post("/orders/batch", orders.processBatch);

  // Retrieve all Orders
  app.get("/orders", orders.findAll);

  // Retrieve a single Order with orderId
  app.get("/orders/:orderId", orders.findOne);

  // Update an Order with orderId
  app.put("/orders/:orderId", orders.update);

  // Delete an Order with orderId
  app.delete("/orders/:orderId", orders.delete);

  // Delete all Orders
  app.delete("/orders", orders.deleteAll);
};