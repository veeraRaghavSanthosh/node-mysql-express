const Payment = require("../models/payment.model.js");
const logger = require("../config/logger.config.js");

// Create and Process a new Payment
exports.create = (req, res) => {
  logger.trace('Payment controller create called', { 
    body: req.body,
    ip: req.ip,
    user_agent: req.get('User-Agent')
  });

  // Validate request
  if (!req.body || Object.keys(req.body).length === 0) {
    logger.warn("Payment creation attempted with empty body", { ip: req.ip });
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  // Validate required fields
  const requiredFields = ['customer_id', 'amount', 'payment_method'];
  const missingFields = requiredFields.filter(field => !req.body[field]);
  
  if (missingFields.length > 0) {
    logger.warn("Payment creation attempted with missing required fields", { 
      missing_fields: missingFields,
      provided_fields: Object.keys(req.body),
      ip: req.ip 
    });
    res.status(400).send({
      message: `Missing required fields: ${missingFields.join(', ')}`
    });
    return;
  }

  // Validate amount is positive number
  if (typeof req.body.amount !== 'number' || req.body.amount <= 0) {
    logger.warn("Payment creation attempted with invalid amount", { 
      amount: req.body.amount,
      amount_type: typeof req.body.amount,
      customer_id: req.body.customer_id,
      ip: req.ip 
    });
    res.status(400).send({
      message: "Amount must be a positive number"
    });
    return;
  }

  logger.info("Processing new payment request", {
    customer_id: req.body.customer_id,
    amount: req.body.amount,
    currency: req.body.currency || 'USD',
    payment_method: req.body.payment_method,
    ip: req.ip
  });

  // Process the payment
  Payment.processPayment(req.body, (err, data) => {
    if (err) {
      logger.error("Payment processing failed in controller", {
        error: err.message,
        customer_id: req.body.customer_id,
        amount: req.body.amount,
        ip: req.ip
      });
      res.status(500).send({
        message: err.message || "Some error occurred while processing the payment."
      });
    } else {
      logger.info("Payment processed successfully in controller", {
        payment_id: data.id,
        customer_id: data.customer_id,
        amount: data.amount,
        status: data.status,
        transaction_id: data.transaction_id
      });
      res.send(data);
    }
  });
};

// Retrieve all Payments from the database
exports.findAll = (req, res) => {
  logger.trace('Payment controller findAll called', { 
    query: req.query,
    ip: req.ip 
  });

  logger.debug("Retrieving all payments", { ip: req.ip });

  Payment.getAll((err, data) => {
    if (err) {
      logger.error("Error retrieving all payments in controller", {
        error: err.message,
        ip: req.ip
      });
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving payments."
      });
    } else {
      logger.info("Successfully retrieved all payments", { 
        count: data.length,
        ip: req.ip 
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
    ip: req.ip 
  });

  logger.debug("Retrieving payment by ID", { 
    payment_id: paymentId,
    ip: req.ip 
  });

  Payment.findById(paymentId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        logger.warn("Payment not found", { 
          payment_id: paymentId,
          ip: req.ip 
        });
        res.status(404).send({
          message: `Not found Payment with id ${paymentId}.`
        });
      } else {
        logger.error("Error retrieving payment by ID in controller", {
          error: err.message,
          payment_id: paymentId,
          ip: req.ip
        });
        res.status(500).send({
          message: "Error retrieving Payment with id " + paymentId
        });
      }
    } else {
      logger.info("Successfully retrieved payment", {
        payment_id: paymentId,
        customer_id: data.customer_id,
        amount: data.amount,
        status: data.status,
        ip: req.ip
      });
      res.send(data);
    }
  });
};

// Find Payments by Customer ID
exports.findByCustomerId = (req, res) => {
  const customerId = req.params.customerId;
  
  logger.trace('Payment controller findByCustomerId called', { 
    customer_id: customerId,
    ip: req.ip 
  });

  logger.debug("Retrieving payments by customer ID", { 
    customer_id: customerId,
    ip: req.ip 
  });

  Payment.getByCustomerId(customerId, (err, data) => {
    if (err) {
      logger.error("Error retrieving payments by customer ID in controller", {
        error: err.message,
        customer_id: customerId,
        ip: req.ip
      });
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving payments."
      });
    } else {
      logger.info("Successfully retrieved payments for customer", {
        customer_id: customerId,
        count: data.length,
        ip: req.ip
      });
      res.send(data);
    }
  });
};

// Update a Payment identified by the paymentId in the request
exports.update = (req, res) => {
  const paymentId = req.params.paymentId;
  
  logger.trace('Payment controller update called', { 
    payment_id: paymentId,
    body: req.body,
    ip: req.ip 
  });

  // Validate Request
  if (!req.body || Object.keys(req.body).length === 0) {
    logger.warn("Payment update attempted with empty body", { 
      payment_id: paymentId,
      ip: req.ip 
    });
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  logger.debug("Updating payment", { 
    payment_id: paymentId,
    update_fields: Object.keys(req.body),
    ip: req.ip 
  });

  Payment.updateById(
    paymentId,
    new Payment(req.body),
    (err, data) => {
      if (err) {
        if (err.kind === "not_found") {
          logger.warn("Payment not found for update", { 
            payment_id: paymentId,
            ip: req.ip 
          });
          res.status(404).send({
            message: `Not found Payment with id ${paymentId}.`
          });
        } else {
          logger.error("Error updating payment in controller", {
            error: err.message,
            payment_id: paymentId,
            ip: req.ip
          });
          res.status(500).send({
            message: "Error updating Payment with id " + paymentId
          });
        }
      } else {
        logger.info("Payment updated successfully", {
          payment_id: paymentId,
          updated_status: data.status,
          ip: req.ip
        });
        res.send(data);
      }
    }
  );
};

// Delete a Payment with the specified paymentId in the request
exports.delete = (req, res) => {
  const paymentId = req.params.paymentId;
  
  logger.trace('Payment controller delete called', { 
    payment_id: paymentId,
    ip: req.ip 
  });

  logger.debug("Deleting payment", { 
    payment_id: paymentId,
    ip: req.ip 
  });

  Payment.remove(paymentId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        logger.warn("Payment not found for deletion", { 
          payment_id: paymentId,
          ip: req.ip 
        });
        res.status(404).send({
          message: `Not found Payment with id ${paymentId}.`
        });
      } else {
        logger.error("Error deleting payment in controller", {
          error: err.message,
          payment_id: paymentId,
          ip: req.ip
        });
        res.status(500).send({
          message: "Could not delete Payment with id " + paymentId
        });
      }
    } else {
      logger.info("Payment deleted successfully", {
        payment_id: paymentId,
        ip: req.ip
      });
      res.send({ message: `Payment was deleted successfully!` });
    }
  });
};