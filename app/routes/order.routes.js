module.exports = app => {
  const orders = require("../controllers/order.controller.js");

  // Process a new order
  app.post("/api/orders/process", orders.processOrder);

  // Get processing history
  app.get("/api/orders/history", orders.getHistory);

  // Clear processing history
  app.delete("/api/orders/history", orders.clearHistory);

  // Validate items
  app.post("/api/orders/validate", orders.validateItems);
};