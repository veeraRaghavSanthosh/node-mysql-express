const Payment = require("../models/payment.model.js");

// Create and Save a new Payment
exports.create = (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  // Validate required fields
  if (!req.body.customer_id || !req.body.amount || !req.body.currency) {
    res.status(400).send({
      message: "customer_id, amount, and currency are required fields!"
    });
    return;
  }

  // Create a Payment
  const payment = new Payment({
    customer_id: req.body.customer_id,
    amount: req.body.amount,
    currency: req.body.currency || 'USD',
    payment_method: req.body.payment_method || 'card',
    status: req.body.status || 'pending',
    transaction_id: req.body.transaction_id,
    description: req.body.description,
    metadata: req.body.metadata ? JSON.stringify(req.body.metadata) : null,
    created_at: new Date(),
    updated_at: new Date()
  });

  // Save Payment in the database
  Payment.create(payment, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Payment."
      });
    else res.status(201).send(data);
  });
};

// Retrieve all Payments from the database with optional filters
exports.findAll = (req, res) => {
  const filters = {
    customer_id: req.query.customer_id,
    status: req.query.status,
    payment_method: req.query.payment_method,
    limit: req.query.limit
  };

  // Remove undefined filters
  Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);

  if (Object.keys(filters).length > 0) {
    Payment.getAllWithFilters(filters, (err, data) => {
      if (err)
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving payments."
        });
      else res.send(data);
    });
  } else {
    Payment.getAll((err, data) => {
      if (err)
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving payments."
        });
      else res.send(data);
    });
  }
};

// Find a single Payment with a paymentId
exports.findOne = (req, res) => {
  Payment.findById(req.params.paymentId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found Payment with id ${req.params.paymentId}.`
        });
      } else {
        res.status(500).send({
          message: "Error retrieving Payment with id " + req.params.paymentId
        });
      }
    } else res.send(data);
  });
};

// Find all Payments for a specific customer
exports.findByCustomer = (req, res) => {
  Payment.findByCustomerId(req.params.customerId, (err, data) => {
    if (err) {
      res.status(500).send({
        message: "Error retrieving Payments for customer with id " + req.params.customerId
      });
    } else res.send(data);
  });
};

// Update a Payment identified by the paymentId in the request
exports.update = (req, res) => {
  // Validate Request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  console.log(req.body);

  Payment.updateById(
    req.params.paymentId,
    new Payment(req.body),
    (err, data) => {
      if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: `Not found Payment with id ${req.params.paymentId}.`
          });
        } else {
          res.status(500).send({
            message: "Error updating Payment with id " + req.params.paymentId
          });
        }
      } else res.send(data);
    }
  );
};

// Update payment status only
exports.updateStatus = (req, res) => {
  // Validate Request
  if (!req.body.status) {
    res.status(400).send({
      message: "Status is required!"
    });
    return;
  }

  const validStatuses = ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded', 'partially_refunded'];
  if (!validStatuses.includes(req.body.status)) {
    res.status(400).send({
      message: "Invalid status. Valid statuses are: " + validStatuses.join(', ')
    });
    return;
  }

  Payment.updateStatus(
    req.params.paymentId,
    req.body.status,
    (err, data) => {
      if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: `Not found Payment with id ${req.params.paymentId}.`
          });
        } else {
          res.status(500).send({
            message: "Error updating Payment status with id " + req.params.paymentId
          });
        }
      } else res.send(data);
    }
  );
};

// Delete a Payment with the specified paymentId in the request
exports.delete = (req, res) => {
  Payment.remove(req.params.paymentId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found Payment with id ${req.params.paymentId}.`
        });
      } else {
        res.status(500).send({
          message: "Could not delete Payment with id " + req.params.paymentId
        });
      }
    } else res.send({ message: `Payment was deleted successfully!` });
  });
};

// Delete all Payments from the database.
exports.deleteAll = (req, res) => {
  Payment.removeAll((err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all payments."
      });
    else res.send({ message: `All Payments were deleted successfully!` });
  });
};