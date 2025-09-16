module.exports = app => {
  const orders = require("../controllers/order.controller.js");

  // Create a new Order
  app.post("/v1/orders", orders.create);
};