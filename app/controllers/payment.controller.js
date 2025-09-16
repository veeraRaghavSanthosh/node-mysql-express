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
  if (!req.body.customer_id || !req.body.amount || !req.body.currency || !req.body.payment_method) {
    res.status(400).send({
      message: "Missing required fields: customer_id, amount, currency, payment_method"
    });
    return;
  }

  // Validate amount
  if (req.body.amount <= 0) {
    res.status(400).send({
      message: "Amount must be greater than 0"
    });
    return;
  }

  // Create a Payment
  const payment = new Payment({
    customer_id: req.body.customer_id,
    amount: req.body.amount,
    currency: req.body.currency,
    payment_method: req.body.payment_method,
    description: req.body.description || null,
    status: 'processing'
  });

  // Save Payment in the database
  Payment.create(payment, (err, data) => {
    if (err) {
      res.status(500).send({
        message: err.message || "Some error occurred while processing the payment."
      });
    } else {
      // Simulate payment processing delay
      setTimeout(() => {
        // Update payment status to completed (in real implementation, this would be done by payment gateway callback)
        Payment.updateStatus(data.id, 'completed', (updateErr, updateData) => {
          if (updateErr) {
            console.log("Error updating payment status:", updateErr);
          }
        });
      }, 1000);

      res.status(201).send({
        ...data,
        status: 'processing',
        message: "Payment is being processed"
      });
    }
  });
};

// Retrieve all payments
exports.findAll = (req, res) => {
  Payment.getAll((err, data) => {
    if (err) {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving payments."
      });
    } else {
      res.send(data);
    }
  });
};

// Find a single payment by ID
exports.findOne = (req, res) => {
  Payment.findById(req.params.paymentId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Payment not found with id ${req.params.paymentId}.`
        });
      } else {
        res.status(500).send({
          message: "Error retrieving payment with id " + req.params.paymentId
        });
      }
    } else {
      res.send(data);
    }
  });
};

// Get all payments for a specific customer
exports.findByCustomer = (req, res) => {
  Payment.getByCustomerId(req.params.customerId, (err, data) => {
    if (err) {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving customer payments."
      });
    } else {
      res.send(data);
    }
  });
};

// Update payment status
exports.updateStatus = (req, res) => {
  // Validate request
  if (!req.body || !req.body.status) {
    res.status(400).send({
      message: "Status is required!"
    });
    return;
  }

  // Validate status values
  const validStatuses = ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'];
  if (!validStatuses.includes(req.body.status)) {
    res.status(400).send({
      message: `Invalid status. Valid statuses are: ${validStatuses.join(', ')}`
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
            message: `Payment not found with id ${req.params.paymentId}.`
          });
        } else {
          res.status(500).send({
            message: "Error updating payment with id " + req.params.paymentId
          });
        }
      } else {
        res.send({
          message: "Payment status updated successfully!",
          ...data
        });
      }
    }
  );
};

// Process refund
exports.refund = (req, res) => {
  // Validate request
  if (!req.body || req.body.refund_amount === undefined) {
    res.status(400).send({
      message: "Refund amount is required!"
    });
    return;
  }

  // Validate refund amount
  if (req.body.refund_amount <= 0) {
    res.status(400).send({
      message: "Refund amount must be greater than 0"
    });
    return;
  }

  // First check if payment exists and get its details
  Payment.findById(req.params.paymentId, (findErr, paymentData) => {
    if (findErr) {
      if (findErr.kind === "not_found") {
        res.status(404).send({
          message: `Payment not found with id ${req.params.paymentId}.`
        });
      } else {
        res.status(500).send({
          message: "Error retrieving payment with id " + req.params.paymentId
        });
      }
      return;
    }

    // Check if payment can be refunded
    if (paymentData.status !== 'completed') {
      res.status(400).send({
        message: "Only completed payments can be refunded"
      });
      return;
    }

    // Check if refund amount is not greater than payment amount
    if (req.body.refund_amount > paymentData.amount) {
      res.status(400).send({
        message: "Refund amount cannot be greater than payment amount"
      });
      return;
    }

    // Process refund
    Payment.refund(
      req.params.paymentId,
      req.body.refund_amount,
      (err, data) => {
        if (err) {
          res.status(500).send({
            message: "Error processing refund for payment with id " + req.params.paymentId
          });
        } else {
          res.send({
            message: "Refund processed successfully!",
            ...data
          });
        }
      }
    );
  });
};

// Delete a payment
exports.delete = (req, res) => {
  Payment.remove(req.params.paymentId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Payment not found with id ${req.params.paymentId}.`
        });
      } else {
        res.status(500).send({
          message: "Could not delete payment with id " + req.params.paymentId
        });
      }
    } else {
      res.send({ message: `Payment was deleted successfully!` });
    }
  });
};