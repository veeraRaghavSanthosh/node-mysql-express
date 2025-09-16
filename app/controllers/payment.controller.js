const Payment = require("../models/payment.model.js");

// Create and process a new payment
exports.create = (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  // Validate required fields
  const { customer_id, amount, payment_method } = req.body;
  if (!customer_id || !amount || !payment_method) {
    res.status(400).send({
      message: "Missing required fields: customer_id, amount, payment_method"
    });
    return;
  }

  // Process the payment
  Payment.processPayment(req.body, (err, data) => {
    if (err) {
      if (err.payment) {
        // Payment was created but failed
        res.status(402).send({
          message: err.message,
          payment: err.payment
        });
      } else {
        // Validation or other error
        res.status(400).send({
          message: err.message || "Some error occurred while processing the payment."
        });
      }
    } else {
      res.status(201).send(data);
    }
  });
};

// Retrieve all payments
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

// Find a single payment by ID
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

// Find payments by customer ID
exports.findByCustomer = (req, res) => {
  Payment.findByCustomerId(req.params.customerId, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving payments for customer."
      });
    else res.send(data);
  });
};

// Update payment status
exports.updateStatus = (req, res) => {
  if (!req.body.status) {
    res.status(400).send({
      message: "Status is required!"
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
  const refundAmount = req.body.amount;
  
  if (!refundAmount || refundAmount <= 0) {
    res.status(400).send({
      message: "Valid refund amount is required!"
    });
    return;
  }

  Payment.refund(req.params.paymentId, refundAmount, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found Payment with id ${req.params.paymentId}.`
        });
      } else if (err.message) {
        res.status(400).send({
          message: err.message
        });
      } else {
        res.status(500).send({
          message: "Error refunding Payment with id " + req.params.paymentId
        });
      }
    } else res.send(data);
  });
};