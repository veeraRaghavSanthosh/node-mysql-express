const Order = require("../models/order.model.js");

/**
 * Order Controller
 * 
 * Handles HTTP requests for order operations with backward compatibility
 * for the new legacy_id column.
 */

// Create and Save a new Order
exports.create = (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  // Create an Order
  const order = new Order({
    customer_id: req.body.customer_id,
    total_amount: req.body.total_amount,
    status: req.body.status,
    legacy_id: req.body.legacy_id // Optional: allow client to provide legacy_id
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

// Find a single Order with an id (supports both regular ID and legacy_id)
exports.findOne = (req, res) => {
  Order.findById(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found Order with id ${req.params.id}.`
        });
      } else {
        res.status(500).send({
          message: "Error retrieving Order with id " + req.params.id
        });
      }
    } else res.send(data);
  });
};

// Find orders by customer ID
exports.findByCustomer = (req, res) => {
  Order.getByCustomerId(req.params.customerId, (err, data) => {
    if (err) {
      res.status(500).send({
        message: "Error retrieving Orders for customer " + req.params.customerId
      });
    } else res.send(data);
  });
};

// Find a single Order by legacy_id specifically
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

// Update an Order identified by the id in the request (supports both regular ID and legacy_id)
exports.update = (req, res) => {
  // Validate Request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  console.log(req.body);

  Order.updateById(
    req.params.id,
    new Order(req.body),
    (err, data) => {
      if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: `Not found Order with id ${req.params.id}.`
          });
        } else {
          res.status(500).send({
            message: "Error updating Order with id " + req.params.id
          });
        }
      } else res.send(data);
    }
  );
};

// Delete an Order with the specified id in the request (supports both regular ID and legacy_id)
exports.delete = (req, res) => {
  Order.remove(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found Order with id ${req.params.id}.`
        });
      } else {
        res.status(500).send({
          message: "Could not delete Order with id " + req.params.id
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