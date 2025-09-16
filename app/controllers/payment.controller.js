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

  // Create a Payment
  const payment = new Payment({
    customer_id: req.body.customer_id,
    amount: req.body.amount,
    currency: req.body.currency,
    payment_method: req.body.payment_method,
    status: req.body.status
  });

  // Save Payment in the database
  Payment.create(payment, (err, data) => {
    if (err) {
      // Check if it's a validation error (our custom errors have specific messages)
      if (err.message && (err.message.includes("Missing required") || 
                         err.message.includes("must be greater than") || 
                         err.message.includes("exceeds maximum"))) {
        res.status(400).send({
          message: err.message
        });
      } else {
        res.status(500).send({
          message: err.message || "Some error occurred while creating the Payment."
        });
      }
    } else {
      res.send(data);
    }
  });
};

// Process a payment
exports.process = (req, res) => {
  Payment.processPayment(req.params.paymentId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Payment with id ${req.params.paymentId} not found.`
        });
      } else if (err.message && err.message.includes("not in pending status")) {
        res.status(400).send({
          message: err.message
        });
      } else {
        res.status(500).send({
          message: "Error processing Payment with id " + req.params.paymentId
        });
      }
    } else {
      res.send(data);
    }
  });
};

// Retrieve all Payments from the database
exports.findAll = (req, res) => {
  Payment.getAll((err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving payments."
      });
    else res.send(data);
  });
};

// Find a single Payment with a paymentId
exports.findOne = (req, res) => {
  Payment.findById(req.params.paymentId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Payment with id ${req.params.paymentId} not found.`
        });
      } else {
        res.status(500).send({
          message: "Error retrieving Payment with id " + req.params.paymentId
        });
      }
    } else res.send(data);
  });
};

// Find all payments for a customer
exports.findByCustomer = (req, res) => {
  Payment.getByCustomerId(req.params.customerId, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving customer payments."
      });
    else res.send(data);
  });
};

// Update payment status
exports.updateStatus = (req, res) => {
  // Validate Request
  if (!req.body || !req.body.status) {
    res.status(400).send({
      message: "Status cannot be empty!"
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
            message: `Payment with id ${req.params.paymentId} not found.`
          });
        } else if (err.message) {
          res.status(400).send({
            message: err.message
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

// Refund a payment
exports.refund = (req, res) => {
  // Validate Request
  if (!req.body || !req.body.amount) {
    res.status(400).send({
      message: "Refund amount cannot be empty!"
    });
    return;
  }

  Payment.refund(
    req.params.paymentId,
    req.body.amount,
    (err, data) => {
      if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: `Payment with id ${req.params.paymentId} not found.`
          });
        } else if (err.message && (err.message.includes("Can only refund") || 
                                  err.message.includes("cannot exceed"))) {
          res.status(400).send({
            message: err.message
          });
        } else {
          res.status(500).send({
            message: "Error processing refund for Payment with id " + req.params.paymentId
          });
        }
      } else res.send(data);
    }
  );
};