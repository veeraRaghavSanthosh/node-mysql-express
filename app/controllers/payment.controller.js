const Payment = require("../models/payment.model.js");
const logger = require("../config/logger.config.js");

// Create and Save a new Payment
exports.create = (req, res) => {
  logger.trace('Payment controller create endpoint called', {
    request_body: req.body,
    user_agent: req.get('User-Agent'),
    ip_address: req.ip
  });

  // Validate request
  if (!req.body) {
    logger.warn("Payment creation attempted with empty body", {
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    });
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  // Validate required fields
  if (!req.body.customer_id || !req.body.amount || !req.body.payment_method) {
    logger.warn("Payment creation attempted with missing required fields", {
      provided_fields: Object.keys(req.body),
      missing_fields: ['customer_id', 'amount', 'payment_method'].filter(
        field => !req.body[field]
      ),
      ip_address: req.ip
    });
    res.status(400).send({
      message: "Missing required fields: customer_id, amount, payment_method"
    });
    return;
  }

  logger.debug('Creating new payment', {
    customer_id: req.body.customer_id,
    amount: req.body.amount,
    currency: req.body.currency || 'USD',
    payment_method: req.body.payment_method
  });

  // Create a Payment
  const payment = new Payment({
    customer_id: req.body.customer_id,
    amount: req.body.amount,
    currency: req.body.currency,
    payment_method: req.body.payment_method,
    transaction_id: req.body.transaction_id,
    description: req.body.description
  });

  // Save Payment in the database
  Payment.create(payment, (err, data) => {
    if (err) {
      logger.error("Payment creation failed in controller", {
        error: err.message,
        stack: err.stack,
        payment_data: {
          customer_id: payment.customer_id,
          amount: payment.amount,
          currency: payment.currency
        }
      });
      res.status(500).send({
        message: err.message || "Some error occurred while creating the Payment."
      });
    } else {
      logger.info("Payment creation successful in controller", {
        payment_id: data.id,
        customer_id: data.customer_id,
        amount: data.amount
      });
      res.send(data);
    }
  });
};

// Retrieve all Payments for a customer
exports.findByCustomer = (req, res) => {
  const customerId = req.params.customerId;
  
  logger.trace('Payment controller findByCustomer called', {
    customer_id: customerId,
    ip_address: req.ip
  });

  logger.debug('Retrieving payments for customer', { customer_id: customerId });

  Payment.findByCustomerId(customerId, (err, data) => {
    if (err) {
      logger.error("Failed to retrieve payments for customer", {
        error: err.message,
        stack: err.stack,
        customer_id: customerId
      });
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving payments."
      });
    } else {
      logger.debug("Successfully retrieved payments for customer", {
        customer_id: customerId,
        payment_count: data.length
      });
      res.send(data);
    }
  });
};

// Find a single Payment with a paymentId
exports.findOne = (req, res) => {
  const paymentId = req.params.paymentId;
  
  logger.trace('Payment controller findOne called', {
    payment_id: paymentId,
    ip_address: req.ip
  });

  logger.debug('Retrieving payment by ID', { payment_id: paymentId });

  Payment.findById(paymentId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        logger.debug("Payment not found", { payment_id: paymentId });
        res.status(404).send({
          message: `Not found Payment with id ${paymentId}.`
        });
      } else {
        logger.error("Error retrieving payment", {
          error: err.message,
          stack: err.stack,
          payment_id: paymentId
        });
        res.status(500).send({
          message: "Error retrieving Payment with id " + paymentId
        });
      }
    } else {
      logger.debug("Payment retrieved successfully", {
        payment_id: paymentId,
        customer_id: data.customer_id,
        amount: data.amount,
        status: data.status
      });
      res.send(data);
    }
  });
};

// Process a Payment
exports.process = (req, res) => {
  const paymentId = req.params.paymentId;
  
  logger.trace('Payment controller process called', {
    payment_id: paymentId,
    ip_address: req.ip,
    user_agent: req.get('User-Agent')
  });

  logger.info('Payment processing initiated', {
    payment_id: paymentId,
    initiated_by: req.ip
  });

  Payment.processPayment(paymentId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        logger.warn("Attempted to process non-existent payment", {
          payment_id: paymentId,
          ip_address: req.ip
        });
        res.status(404).send({
          message: `Payment with id ${paymentId} not found.`
        });
      } else if (err.kind === "invalid_status") {
        logger.warn("Attempted to process payment with invalid status", {
          payment_id: paymentId,
          error_message: err.message,
          ip_address: req.ip
        });
        res.status(400).send({
          message: err.message
        });
      } else {
        logger.error("Payment processing failed in controller", {
          error: err.message,
          stack: err.stack,
          payment_id: paymentId
        });
        res.status(500).send({
          message: "Error processing Payment with id " + paymentId
        });
      }
    } else {
      logger.info("Payment processing completed in controller", {
        payment_id: paymentId,
        final_status: data.status,
        amount: data.amount
      });
      res.send(data);
    }
  });
};

// Update Payment status
exports.updateStatus = (req, res) => {
  const paymentId = req.params.paymentId;
  const newStatus = req.body.status;
  
  logger.trace('Payment controller updateStatus called', {
    payment_id: paymentId,
    new_status: newStatus,
    ip_address: req.ip
  });

  if (!newStatus) {
    logger.warn("Payment status update attempted without status", {
      payment_id: paymentId,
      ip_address: req.ip
    });
    res.status(400).send({
      message: "Status is required"
    });
    return;
  }

  logger.debug('Updating payment status', {
    payment_id: paymentId,
    new_status: newStatus
  });

  Payment.updateStatus(paymentId, newStatus, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        logger.debug("Payment not found for status update", {
          payment_id: paymentId
        });
        res.status(404).send({
          message: `Payment with id ${paymentId} not found.`
        });
      } else {
        logger.error("Payment status update failed in controller", {
          error: err.message,
          stack: err.stack,
          payment_id: paymentId,
          attempted_status: newStatus
        });
        res.status(500).send({
          message: "Error updating Payment status with id " + paymentId
        });
      }
    } else {
      logger.info("Payment status updated successfully in controller", {
        payment_id: paymentId,
        new_status: newStatus
      });
      res.send(data);
    }
  });
};