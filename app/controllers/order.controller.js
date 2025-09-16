const Order = require("../models/order.model.js");

// Validation helper function
const validateOrderPayload = (orderData) => {
  const errors = [];
  
  // Required fields validation
  if (!orderData.customer_id) {
    errors.push("customer_id is required");
  } else if (!Number.isInteger(orderData.customer_id) || orderData.customer_id <= 0) {
    errors.push("customer_id must be a positive integer");
  }
  
  if (!orderData.total_amount) {
    errors.push("total_amount is required");
  } else if (typeof orderData.total_amount !== 'number' || orderData.total_amount <= 0) {
    errors.push("total_amount must be a positive number");
  }
  
  if (!orderData.status) {
    errors.push("status is required");
  } else if (!['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(orderData.status)) {
    errors.push("status must be one of: pending, processing, shipped, delivered, cancelled");
  }
  
  // Optional fields validation
  if (orderData.shipping_address && typeof orderData.shipping_address !== 'string') {
    errors.push("shipping_address must be a string");
  }
  
  if (orderData.billing_address && typeof orderData.billing_address !== 'string') {
    errors.push("billing_address must be a string");
  }
  
  if (orderData.items) {
    if (!Array.isArray(orderData.items)) {
      errors.push("items must be an array");
    } else {
      orderData.items.forEach((item, index) => {
        if (!item.product_id) {
          errors.push(`items[${index}].product_id is required`);
        }
        if (!item.quantity || !Number.isInteger(item.quantity) || item.quantity <= 0) {
          errors.push(`items[${index}].quantity must be a positive integer`);
        }
        if (!item.price || typeof item.price !== 'number' || item.price <= 0) {
          errors.push(`items[${index}].price must be a positive number`);
        }
      });
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

  // Create a Order
  const order = new Order({
    customer_id: req.body.customer_id,
    order_date: req.body.order_date || new Date(),
    total_amount: req.body.total_amount,
    status: req.body.status,
    shipping_address: req.body.shipping_address,
    billing_address: req.body.billing_address,
    items: req.body.items ? JSON.stringify(req.body.items) : null
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

// Retrieve all Orders from the database (with condition).
exports.findAll = (req, res) => {
  const title = req.query.title;

  Order.getAll(title, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving orders."
      });
    else res.send(data);
  });
};

// Find a single Order with an id
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

// Update a Order identified by the id in the request
exports.update = (req, res) => {
  // Validate Request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
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

// Delete a Order with the specified id in the request
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