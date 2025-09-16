const Order = require("../models/order.model.js");
const orderProcessor = require("../services/orderProcessor");

// Create and Save a new Order
exports.create = (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  // Process the order first
  orderProcessor.processOrder(req.body, (err, processedResult) => {
    if (err) {
      res.status(400).send({
        message: err.message || "Error processing order"
      });
      return;
    }

    // Create an Order from processed result
    const order = new Order({
      customerId: processedResult.order.customerId,
      items: JSON.stringify(processedResult.order.items),
      status: processedResult.order.status,
      totalAmount: processedResult.order.totalAmount
    });

    // Save Order in the database
    Order.create(order, (err, data) => {
      if (err) {
        res.status(500).send({
          message: err.message || "Some error occurred while creating the Order."
        });
      } else {
        res.send({
          ...data,
          items: JSON.parse(data.items || '[]'),
          processing: processedResult
        });
      }
    });
  });
};

// Process order without saving to database
exports.process = (req, res) => {
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  orderProcessor.processOrder(req.body, (err, result) => {
    if (err) {
      res.status(400).send({
        message: err.message || "Error processing order"
      });
    } else {
      res.send(result);
    }
  });
};

// Process batch of orders
exports.processBatch = (req, res) => {
  if (!req.body || !Array.isArray(req.body.orders)) {
    res.status(400).send({
      message: "Orders array is required!"
    });
    return;
  }

  orderProcessor.processBatch(req.body.orders, (err, result) => {
    if (err) {
      res.status(400).send({
        message: err.message || "Error processing batch"
      });
    } else {
      res.send(result);
    }
  });
};

// Retrieve all Orders from the database
exports.findAll = (req, res) => {
  Order.getAll((err, data) => {
    if (err) {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving orders."
      });
    } else {
      // Parse items JSON for each order
      const ordersWithParsedItems = data.map(order => ({
        ...order,
        items: JSON.parse(order.items || '[]')
      }));
      res.send(ordersWithParsedItems);
    }
  });
};

// Find a single Order with an orderId
exports.findOne = (req, res) => {
  Order.findById(req.params.orderId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found Order with id ${req.params.orderId}.`
        });
      } else {
        res.status(500).send({
          message: "Error retrieving Order with id " + req.params.orderId
        });
      }
    } else {
      res.send({
        ...data,
        items: JSON.parse(data.items || '[]')
      });
    }
  });
};

// Update an Order identified by the orderId in the request
exports.update = (req, res) => {
  // Validate Request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  Order.updateById(req.params.orderId, new Order(req.body), (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found Order with id ${req.params.orderId}.`
        });
      } else {
        res.status(500).send({
          message: "Error updating Order with id " + req.params.orderId
        });
      }
    } else {
      res.send({
        ...data,
        items: JSON.parse(data.items || '[]')
      });
    }
  });
};

// Delete an Order with the specified orderId in the request
exports.delete = (req, res) => {
  Order.remove(req.params.orderId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found Order with id ${req.params.orderId}.`
        });
      } else {
        res.status(500).send({
          message: "Could not delete Order with id " + req.params.orderId
        });
      }
    } else res.send({ message: `Order was deleted successfully!` });
  });
};

// Delete all Orders from the database
exports.deleteAll = (req, res) => {
  Order.removeAll((err, data) => {
    if (err) {
      res.status(500).send({
        message: err.message || "Some error occurred while removing all orders."
      });
    } else res.send({ message: `All Orders were deleted successfully!` });
  });
};