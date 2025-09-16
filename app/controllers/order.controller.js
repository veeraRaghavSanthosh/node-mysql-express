const Order = require("../models/order.model.js");

// Validation helper functions
const validateOrderPayload = (body) => {
  const errors = [];
  
  if (!body.customer_id) {
    errors.push("customer_id is required");
  } else if (!Number.isInteger(body.customer_id) || body.customer_id <= 0) {
    errors.push("customer_id must be a positive integer");
  }
  
  if (!body.product_name) {
    errors.push("product_name is required");
  } else if (typeof body.product_name !== 'string' || body.product_name.trim().length === 0) {
    errors.push("product_name must be a non-empty string");
  }
  
  if (!body.quantity) {
    errors.push("quantity is required");
  } else if (!Number.isInteger(body.quantity) || body.quantity <= 0) {
    errors.push("quantity must be a positive integer");
  }
  
  if (!body.unit_price) {
    errors.push("unit_price is required");
  } else if (typeof body.unit_price !== 'number' || body.unit_price <= 0) {
    errors.push("unit_price must be a positive number");
  }
  
  if (body.status && !['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(body.status)) {
    errors.push("status must be one of: pending, processing, shipped, delivered, cancelled");
  }
  
  return errors;
};

// Create and Save a new Order
exports.create = (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  // Validate payload
  const validationErrors = validateOrderPayload(req.body);
  if (validationErrors.length > 0) {
    res.status(400).send({
      message: "Validation failed",
      errors: validationErrors
    });
    return;
  }

  // Calculate total amount
  const totalAmount = req.body.quantity * req.body.unit_price;

  // Create an Order
  const order = new Order({
    customer_id: req.body.customer_id,
    product_name: req.body.product_name.trim(),
    quantity: req.body.quantity,
    unit_price: req.body.unit_price,
    total_amount: totalAmount,
    order_date: new Date(),
    status: req.body.status || 'pending'
  });

  // Save Order in the database
  Order.create(order, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Order."
      });
    else res.status(201).send(data);
  });
};

// Retrieve all Orders from the database.
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

// Update an Order identified by the orderId in the request
exports.update = (req, res) => {
  // Validate Request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  // Validate payload
  const validationErrors = validateOrderPayload(req.body);
  if (validationErrors.length > 0) {
    res.status(400).send({
      message: "Validation failed",
      errors: validationErrors
    });
    return;
  }

  // Calculate total amount
  const totalAmount = req.body.quantity * req.body.unit_price;

  const order = {
    customer_id: req.body.customer_id,
    product_name: req.body.product_name.trim(),
    quantity: req.body.quantity,
    unit_price: req.body.unit_price,
    total_amount: totalAmount,
    status: req.body.status || 'pending'
  };

  Order.updateById(
    req.params.orderId,
    order,
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

// Delete all Orders from the database.
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