const Order = require("../models/order.model.js");

// Validation helper function
const validateOrderPayload = (body) => {
  const errors = [];
  
  if (!body.customer_id || typeof body.customer_id !== 'number') {
    errors.push("customer_id is required and must be a number");
  }
  
  if (!body.product_name || typeof body.product_name !== 'string' || body.product_name.trim() === '') {
    errors.push("product_name is required and must be a non-empty string");
  }
  
  if (!body.quantity || typeof body.quantity !== 'number' || body.quantity <= 0) {
    errors.push("quantity is required and must be a positive number");
  }
  
  if (!body.price || typeof body.price !== 'number' || body.price <= 0) {
    errors.push("price is required and must be a positive number");
  }
  
  // Calculate total_amount if not provided or validate if provided
  if (body.total_amount) {
    if (typeof body.total_amount !== 'number' || body.total_amount <= 0) {
      errors.push("total_amount must be a positive number if provided");
    }
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

  // Calculate total_amount if not provided
  const totalAmount = req.body.total_amount || (req.body.quantity * req.body.price);

  // Create an Order
  const order = new Order({
    customer_id: req.body.customer_id,
    product_name: req.body.product_name.trim(),
    quantity: req.body.quantity,
    price: req.body.price,
    total_amount: totalAmount,
    order_date: req.body.order_date || new Date(),
    status: req.body.status || 'pending'
  });

  // Save Order in the database
  Order.create(order, (err, data) => {
    if (err) {
      // Handle specific database errors
      if (err.code === 'ER_NO_REFERENCED_ROW_2') {
        res.status(400).send({
          message: "Invalid customer_id. Customer does not exist."
        });
      } else {
        res.status(500).send({
          message: err.message || "Some error occurred while creating the Order."
        });
      }
    } else {
      res.status(201).send(data);
    }
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

module.exports = exports;