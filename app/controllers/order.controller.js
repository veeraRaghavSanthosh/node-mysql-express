const Order = require("../models/order.model.js");

// Create and Save a new Order
exports.create = (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  // Create an Order
  const order = new Order({
    customer_id: req.body.customer_id,
    order_number: req.body.order_number,
    total_amount: req.body.total_amount,
    status: req.body.status,
    legacy_id: req.body.legacy_id // Support legacy_id for backward compatibility
  });

  // Save Order in the database
  Order.create(order, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Order."
      });
    else res.send(data);
  });
};

// Retrieve all Orders from the database
exports.findAll = (req, res) => {
  Order.getAll((err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving orders."
      });
    else res.send(data);
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
    } else res.send(data);
  });
};

// Find a single Order by legacy_id (for backward compatibility)
exports.findByLegacyId = (req, res) => {
  Order.findByLegacyId(req.params.legacyId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found Order with legacy_id ${req.params.legacyId}.`
        });
      } else {
        res.status(500).send({
          message: "Error retrieving Order with legacy_id " + req.params.legacyId
        });
      }
    } else res.send(data);
  });
};

// Find Orders by customer ID
exports.findByCustomerId = (req, res) => {
  Order.getByCustomerId(req.params.customerId, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving orders for customer."
      });
    else res.send(data);
  });
};

// Update an Order identified by the orderId in the request
exports.update = (req, res) => {
  // Validate Request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  console.log(req.body);

  Order.updateById(
    req.params.orderId,
    new Order(req.body),
    (err, data) => {
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
      } else res.send(data);
    }
  );
};

// Update Order status
exports.updateStatus = (req, res) => {
  // Validate Request
  if (!req.body.status) {
    res.status(400).send({
      message: "Status can not be empty!"
    });
  }

  Order.updateStatus(
    req.params.orderId,
    req.body.status,
    (err, data) => {
      if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: `Not found Order with id ${req.params.orderId}.`
          });
        } else {
          res.status(500).send({
            message: "Error updating Order status with id " + req.params.orderId
          });
        }
      } else res.send(data);
    }
  );
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
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all orders."
      });
    else res.send({ message: `All Orders were deleted successfully!` });
  });
};