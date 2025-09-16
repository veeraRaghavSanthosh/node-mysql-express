module.exports = app => {
  const orders = require("../controllers/order.controller.js");

  // Create a new Order
  app.post("/v1/orders", orders.create);

  // Retrieve all Orders
  app.get("/v1/orders", orders.findAll);

  // Retrieve a single Order with orderId
  app.get("/v1/orders/:orderId", orders.findOne);

  // Update an Order with orderId
  app.put("/v1/orders/:orderId", orders.update);

  // Delete an Order with orderId
  app.delete("/v1/orders/:orderId", orders.delete);

  // Delete all Orders
  app.delete("/v1/orders", orders.deleteAll);
};