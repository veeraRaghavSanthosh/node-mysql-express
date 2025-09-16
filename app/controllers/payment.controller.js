const Payment = require("../models/payment.model.js");
const { logger } = require("../config/logger.config.js");

// Create and Save a new Payment
exports.create = (req, res) => {
  const requestId = Date.now().toString(36) + Math.random().toString(36).substr(2);
  
  logger.trace("Payment creation request received", { 
    request_id: requestId,
    body: req.body,
    headers: req.headers,
    ip: req.ip,
    timestamp: new Date().toISOString() 
  });

  // Validate request
  if (!req.body) {
    logger.warn("Payment creation failed - empty body", { 
      request_id: requestId,
      ip: req.ip 
    });
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  // Validate required fields
  const requiredFields = ['customer_id', 'amount', 'payment_method'];
  const missingFields = requiredFields.filter(field => !req.body[field]);
  
  if (missingFields.length > 0) {
    logger.warn("Payment creation failed - missing required fields", { 
      request_id: requestId,
      missing_fields: missingFields,
      provided_fields: Object.keys(req.body) 
    });
    res.status(400).send({
      message: `Missing required fields: ${missingFields.join(', ')}`
    });
    return;
  }

  logger.debug("Creating payment with validated data", { 
    request_id: requestId,
    customer_id: req.body.customer_id,
    amount: req.body.amount,
    currency: req.body.currency,
    payment_method: req.body.payment_method 
  });

  // Create a Payment
  const payment = new Payment({
    customer_id: req.body.customer_id,
    amount: req.body.amount,
    currency: req.body.currency,
    payment_method: req.body.payment_method,
    status: req.body.status,
    description: req.body.description,
    metadata: req.body.metadata
  });

  // Save Payment in the database
  Payment.create(payment, (err, data) => {
    if (err) {
      logger.error("Payment creation failed in database", { 
        request_id: requestId,
        error: err.message,
        code: err.code,
        payment_data: payment,
        stack: err.stack 
      });
      res.status(500).send({
        message: err.message || "Some error occurred while creating the Payment."
      });
    } else {
      logger.info("Payment creation successful", { 
        request_id: requestId,
        payment_id: data.id,
        customer_id: data.customer_id,
        amount: data.amount 
      });
      
      logger.trace("Payment creation response sent", { 
        request_id: requestId,
        response_data: data,
        status_code: 200 
      });
      
      res.send(data);
    }
  });
};

// Retrieve all Payments from the database
exports.findAll = (req, res) => {
  const requestId = Date.now().toString(36) + Math.random().toString(36).substr(2);
  
  logger.trace("Payments list request received", { 
    request_id: requestId,
    query: req.query,
    ip: req.ip,
    timestamp: new Date().toISOString() 
  });

  // Extract filters from query parameters
  const filters = {};
  if (req.query.customer_id) filters.customer_id = req.query.customer_id;
  if (req.query.status) filters.status = req.query.status;
  if (req.query.currency) filters.currency = req.query.currency;
  if (req.query.limit) filters.limit = req.query.limit;
  if (req.query.offset) filters.offset = req.query.offset;

  logger.debug("Retrieving payments with filters", { 
    request_id: requestId,
    filters: filters 
  });

  Payment.getAll(filters, (err, data) => {
    if (err) {
      logger.error("Payments retrieval failed", { 
        request_id: requestId,
        error: err.message,
        code: err.code,
        filters: filters,
        stack: err.stack 
      });
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving payments."
      });
    } else {
      logger.info("Payments retrieved successfully", { 
        request_id: requestId,
        count: data.length,
        filters: filters 
      });
      
      logger.trace("Payments list response sent", { 
        request_id: requestId,
        payments_count: data.length,
        status_code: 200 
      });
      
      res.send(data);
    }
  });
};

// Find a single Payment with a paymentId
exports.findOne = (req, res) => {
  const requestId = Date.now().toString(36) + Math.random().toString(36).substr(2);
  const paymentId = req.params.paymentId;
  
  logger.trace("Payment lookup request received", { 
    request_id: requestId,
    payment_id: paymentId,
    ip: req.ip,
    timestamp: new Date().toISOString() 
  });

  logger.debug("Looking up payment by ID", { 
    request_id: requestId,
    payment_id: paymentId 
  });

  Payment.findById(paymentId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        logger.warn("Payment not found", { 
          request_id: requestId,
          payment_id: paymentId 
        });
        res.status(404).send({
          message: `Not found Payment with id ${paymentId}.`
        });
      } else {
        logger.error("Payment lookup failed", { 
          request_id: requestId,
          payment_id: paymentId,
          error: err.message,
          code: err.code,
          stack: err.stack 
        });
        res.status(500).send({
          message: "Error retrieving Payment with id " + paymentId
        });
      }
    } else {
      logger.info("Payment found successfully", { 
        request_id: requestId,
        payment_id: paymentId,
        status: data.status,
        amount: data.amount 
      });
      
      logger.trace("Payment lookup response sent", { 
        request_id: requestId,
        payment_data: data,
        status_code: 200 
      });
      
      res.send(data);
    }
  });
};

// Update a Payment status
exports.updateStatus = (req, res) => {
  const requestId = Date.now().toString(36) + Math.random().toString(36).substr(2);
  const paymentId = req.params.paymentId;
  
  logger.trace("Payment status update request received", { 
    request_id: requestId,
    payment_id: paymentId,
    body: req.body,
    ip: req.ip,
    timestamp: new Date().toISOString() 
  });

  // Validate Request
  if (!req.body || !req.body.status) {
    logger.warn("Payment status update failed - missing status", { 
      request_id: requestId,
      payment_id: paymentId,
      body: req.body 
    });
    res.status(400).send({
      message: "Status is required!"
    });
    return;
  }

  const newStatus = req.body.status;
  const validStatuses = ['pending', 'completed', 'failed', 'cancelled'];
  
  if (!validStatuses.includes(newStatus)) {
    logger.warn("Payment status update failed - invalid status", { 
      request_id: requestId,
      payment_id: paymentId,
      provided_status: newStatus,
      valid_statuses: validStatuses 
    });
    res.status(400).send({
      message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
    });
    return;
  }

  logger.debug("Updating payment status", { 
    request_id: requestId,
    payment_id: paymentId,
    new_status: newStatus 
  });

  Payment.updateStatus(paymentId, newStatus, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        logger.warn("Payment status update failed - payment not found", { 
          request_id: requestId,
          payment_id: paymentId 
        });
        res.status(404).send({
          message: `Not found Payment with id ${paymentId}.`
        });
      } else {
        logger.error("Payment status update failed", { 
          request_id: requestId,
          payment_id: paymentId,
          new_status: newStatus,
          error: err.message,
          code: err.code,
          stack: err.stack 
        });
        res.status(500).send({
          message: "Error updating Payment with id " + paymentId
        });
      }
    } else {
      logger.info("Payment status updated successfully", { 
        request_id: requestId,
        payment_id: paymentId,
        new_status: newStatus 
      });
      
      logger.trace("Payment status update response sent", { 
        request_id: requestId,
        response_data: data,
        status_code: 200 
      });
      
      res.send(data);
    }
  });
};

// Process a Payment
exports.processPayment = (req, res) => {
  const requestId = Date.now().toString(36) + Math.random().toString(36).substr(2);
  const paymentId = req.params.paymentId;
  
  logger.trace("Payment processing request received", { 
    request_id: requestId,
    payment_id: paymentId,
    ip: req.ip,
    timestamp: new Date().toISOString() 
  });

  logger.debug("Initiating payment processing", { 
    request_id: requestId,
    payment_id: paymentId 
  });

  Payment.processPayment(paymentId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        logger.warn("Payment processing failed - payment not found", { 
          request_id: requestId,
          payment_id: paymentId 
        });
        res.status(404).send({
          message: `Not found Payment with id ${paymentId}.`
        });
      } else if (err.kind === "invalid_status") {
        logger.warn("Payment processing failed - invalid status", { 
          request_id: requestId,
          payment_id: paymentId,
          error: err.message 
        });
        res.status(400).send({
          message: err.message
        });
      } else {
        logger.error("Payment processing failed", { 
          request_id: requestId,
          payment_id: paymentId,
          error: err.message,
          code: err.code,
          stack: err.stack 
        });
        res.status(500).send({
          message: "Error processing Payment with id " + paymentId
        });
      }
    } else {
      logger.info("Payment processing completed", { 
        request_id: requestId,
        payment_id: paymentId,
        final_status: data.status,
        amount: data.amount 
      });
      
      logger.trace("Payment processing response sent", { 
        request_id: requestId,
        response_data: data,
        status_code: 200 
      });
      
      res.send(data);
    }
  });
};

// Get payment statistics
exports.getStats = (req, res) => {
  const requestId = Date.now().toString(36) + Math.random().toString(36).substr(2);
  
  logger.trace("Payment statistics request received", { 
    request_id: requestId,
    query: req.query,
    ip: req.ip,
    timestamp: new Date().toISOString() 
  });

  logger.debug("Retrieving payment statistics", { 
    request_id: requestId 
  });

  // Get all payments and calculate stats
  Payment.getAll({}, (err, payments) => {
    if (err) {
      logger.error("Payment statistics retrieval failed", { 
        request_id: requestId,
        error: err.message,
        code: err.code,
        stack: err.stack 
      });
      res.status(500).send({
        message: err.message || "Error retrieving payment statistics."
      });
      return;
    }

    // Calculate statistics
    const stats = {
      total_payments: payments.length,
      total_amount: payments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0),
      status_breakdown: {},
      currency_breakdown: {},
      average_amount: 0
    };

    // Count by status
    payments.forEach(payment => {
      stats.status_breakdown[payment.status] = (stats.status_breakdown[payment.status] || 0) + 1;
      stats.currency_breakdown[payment.currency] = (stats.currency_breakdown[payment.currency] || 0) + 1;
    });

    // Calculate average
    if (payments.length > 0) {
      stats.average_amount = stats.total_amount / payments.length;
    }

    logger.info("Payment statistics calculated", { 
      request_id: requestId,
      total_payments: stats.total_payments,
      total_amount: stats.total_amount 
    });
    
    logger.trace("Payment statistics response sent", { 
      request_id: requestId,
      stats: stats,
      status_code: 200 
    });

    res.send(stats);
  });
};