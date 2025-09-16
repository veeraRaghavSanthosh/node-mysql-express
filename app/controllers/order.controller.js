const Order = require("../models/order.model.js");

// Validation helper functions
const validateOrderPayload = (orderData) => {
  const errors = [];
  
  // Required fields validation
  if (!orderData.customer_id) {
    errors.push("customer_id is required");
  } else if (!Number.isInteger(Number(orderData.customer_id)) || Number(orderData.customer_id) <= 0) {
    errors.push("customer_id must be a positive integer");
  }
  
  if (!orderData.product_name) {
    errors.push("product_name is required");
  } else if (typeof orderData.product_name !== 'string' || orderData.product_name.trim().length === 0) {
    errors.push("product_name must be a non-empty string");
  } else if (orderData.product_name.length > 255) {
    errors.push("product_name must be less than 255 characters");
  }
  
  if (orderData.quantity === undefined || orderData.quantity === null || orderData.quantity === '') {
    errors.push("quantity is required");
  } else if (!Number.isInteger(Number(orderData.quantity)) || Number(orderData.quantity) <= 0) {
    errors.push("quantity must be a positive integer");
  }
  
  if (orderData.unit_price === undefined || orderData.unit_price === null || orderData.unit_price === '') {
    errors.push("unit_price is required");
  } else if (isNaN(Number(orderData.unit_price)) || Number(orderData.unit_price) <= 0) {
    errors.push("unit_price must be a positive number");
  }
  
  // Optional fields validation
  if (orderData.status && !['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(orderData.status)) {
    errors.push("status must be one of: pending, processing, shipped, delivered, cancelled");
  }
  
  if (orderData.order_date) {
    const date = new Date(orderData.order_date);
    if (isNaN(date.getTime())) {
      errors.push("order_date must be a valid date");
    }
  }
  
  return errors;
};

// Create and Save a new Order
exports.create = (req, res) => {
  // Validate request
  if (!req.body) {
    return res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  // Validate payload
  const validationErrors = validateOrderPayload(req.body);
  if (validationErrors.length > 0) {
    return res.status(400).send({
      message: "Validation failed",
      errors: validationErrors
    });
  }

  // Calculate total_amount if not provided
  const quantity = Number(req.body.quantity);
  const unit_price = Number(req.body.unit_price);
  const total_amount = req.body.total_amount || (quantity * unit_price);

  // Create an Order
  const order = new Order({
    customer_id: Number(req.body.customer_id),
    product_name: req.body.product_name.trim(),
    quantity: quantity,
    unit_price: unit_price,
    total_amount: total_amount,
    order_date: req.body.order_date || new Date(),
    status: req.body.status || 'pending'
  });

  // Save Order in the database
  Order.create(order, (err, data) => {
    if (err) {
      return res.status(500).send({
        message: err.message || "Some error occurred while creating the Order."
      });
    }
    res.status(201).send(data);
  });
};

// Retrieve all Orders from the database.
exports.findAll = (req, res) => {
  Order.getAll((err, data) => {
    if (err) {
      return res.status(500).send({
        message: err.message || "Some error occurred while retrieving orders."
      });
    }
    res.send(data);
  });
};

// Find a single Order with an orderId
exports.findOne = (req, res) => {
  Order.findById(req.params.orderId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        return res.status(404).send({
          message: `Not found Order with id ${req.params.orderId}.`
        });
      } else {
        return res.status(500).send({
          message: "Error retrieving Order with id " + req.params.orderId
        });
      }
    }
    res.send(data);
  });
};

// Update an Order identified by the orderId in the request
exports.update = (req, res) => {
  // Validate Request
  if (!req.body) {
    return res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  // Validate payload
  const validationErrors = validateOrderPayload(req.body);
  if (validationErrors.length > 0) {
    return res.status(400).send({
      message: "Validation failed",
      errors: validationErrors
    });
  }

  // Calculate total_amount if not provided
  const quantity = Number(req.body.quantity);
  const unit_price = Number(req.body.unit_price);
  const total_amount = req.body.total_amount || (quantity * unit_price);

  const updatedOrder = new Order({
    customer_id: Number(req.body.customer_id),
    product_name: req.body.product_name.trim(),
    quantity: quantity,
    unit_price: unit_price,
    total_amount: total_amount,
    status: req.body.status || 'pending'
  });

  Order.updateById(
    req.params.orderId,
    updatedOrder,
    (err, data) => {
      if (err) {
        if (err.kind === "not_found") {
          return res.status(404).send({
            message: `Not found Order with id ${req.params.orderId}.`
          });
        } else {
          return res.status(500).send({
            message: "Error updating Order with id " + req.params.orderId
          });
        }
      }
      res.send(data);
    }
  );
};

// Delete an Order with the specified orderId in the request
exports.delete = (req, res) => {
  Order.remove(req.params.orderId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        return res.status(404).send({
          message: `Not found Order with id ${req.params.orderId}.`
        });
      } else {
        return res.status(500).send({
          message: "Could not delete Order with id " + req.params.orderId
        });
      }
    }
    res.send({ message: `Order was deleted successfully!` });
  });
};

// Delete all Orders from the database.
exports.deleteAll = (req, res) => {
  Order.removeAll((err, data) => {
    if (err) {
      return res.status(500).send({
        message: err.message || "Some error occurred while removing all orders."
      });
    }
    res.send({ message: `All Orders were deleted successfully!` });
  });
};