const sql = require("./db.js");
const { logger } = require("../config/logger.config.js");

// Payment constructor
const Payment = function(payment) {
  this.customer_id = payment.customer_id;
  this.amount = payment.amount;
  this.currency = payment.currency || 'USD';
  this.payment_method = payment.payment_method;
  this.status = payment.status || 'pending';
  this.description = payment.description;
  this.metadata = payment.metadata ? JSON.stringify(payment.metadata) : null;
};

// Create a new payment with comprehensive trace logging
Payment.create = (newPayment, result) => {
  logger.trace("Payment.create called", { 
    payment: newPayment, 
    timestamp: new Date().toISOString() 
  });

  const query = "INSERT INTO payments SET ?";
  logger.debug("Executing payment creation query", { 
    query: query,
    payment_data: newPayment 
  });

  sql.query(query, newPayment, (err, res) => {
    if (err) {
      logger.error("Payment creation failed", { 
        error: err.message, 
        code: err.code,
        payment: newPayment,
        stack: err.stack 
      });
      result(err, null);
      return;
    }

    const createdPayment = { id: res.insertId, ...newPayment };
    logger.info("Payment created successfully", { 
      payment_id: res.insertId, 
      customer_id: newPayment.customer_id,
      amount: newPayment.amount,
      currency: newPayment.currency 
    });
    
    logger.trace("Payment creation completed", { 
      created_payment: createdPayment,
      insert_id: res.insertId,
      affected_rows: res.affectedRows 
    });

    result(null, createdPayment);
  });
};

// Find payment by ID with trace logging
Payment.findById = (paymentId, result) => {
  logger.trace("Payment.findById called", { 
    payment_id: paymentId, 
    timestamp: new Date().toISOString() 
  });

  const query = `SELECT * FROM payments WHERE id = ?`;
  logger.debug("Executing payment lookup query", { 
    query: query,
    payment_id: paymentId 
  });

  sql.query(query, [paymentId], (err, res) => {
    if (err) {
      logger.error("Payment lookup failed", { 
        error: err.message, 
        code: err.code,
        payment_id: paymentId,
        stack: err.stack 
      });
      result(err, null);
      return;
    }

    if (res.length) {
      const payment = res[0];
      // Parse metadata if it exists
      if (payment.metadata) {
        try {
          payment.metadata = JSON.parse(payment.metadata);
        } catch (parseErr) {
          logger.warn("Failed to parse payment metadata", { 
            payment_id: paymentId, 
            metadata: payment.metadata,
            error: parseErr.message 
          });
        }
      }

      logger.info("Payment found", { 
        payment_id: paymentId, 
        status: payment.status,
        amount: payment.amount 
      });
      
      logger.trace("Payment lookup completed", { 
        payment: payment,
        found: true 
      });

      result(null, payment);
      return;
    }

    logger.warn("Payment not found", { payment_id: paymentId });
    logger.trace("Payment lookup completed", { 
      payment_id: paymentId,
      found: false 
    });

    result({ kind: "not_found" }, null);
  });
};

// Get all payments with pagination and filtering
Payment.getAll = (filters = {}, result) => {
  logger.trace("Payment.getAll called", { 
    filters: filters, 
    timestamp: new Date().toISOString() 
  });

  let query = "SELECT * FROM payments";
  let queryParams = [];
  let conditions = [];

  // Add filtering conditions
  if (filters.customer_id) {
    conditions.push("customer_id = ?");
    queryParams.push(filters.customer_id);
  }

  if (filters.status) {
    conditions.push("status = ?");
    queryParams.push(filters.status);
  }

  if (filters.currency) {
    conditions.push("currency = ?");
    queryParams.push(filters.currency);
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  // Add ordering
  query += " ORDER BY created_at DESC";

  // Add pagination
  if (filters.limit) {
    query += " LIMIT ?";
    queryParams.push(parseInt(filters.limit));
    
    if (filters.offset) {
      query += " OFFSET ?";
      queryParams.push(parseInt(filters.offset));
    }
  }

  logger.debug("Executing payments list query", { 
    query: query,
    params: queryParams,
    filters: filters 
  });

  sql.query(query, queryParams, (err, res) => {
    if (err) {
      logger.error("Payments list query failed", { 
        error: err.message, 
        code: err.code,
        query: query,
        params: queryParams,
        stack: err.stack 
      });
      result(err, null);
      return;
    }

    // Parse metadata for each payment
    const payments = res.map(payment => {
      if (payment.metadata) {
        try {
          payment.metadata = JSON.parse(payment.metadata);
        } catch (parseErr) {
          logger.warn("Failed to parse payment metadata", { 
            payment_id: payment.id, 
            metadata: payment.metadata,
            error: parseErr.message 
          });
        }
      }
      return payment;
    });

    logger.info("Payments retrieved", { 
      count: payments.length,
      filters: filters 
    });
    
    logger.trace("Payments list completed", { 
      payments_count: payments.length,
      first_payment_id: payments.length > 0 ? payments[0].id : null,
      query_executed: query 
    });

    result(null, payments);
  });
};

// Update payment status with trace logging
Payment.updateStatus = (id, status, result) => {
  logger.trace("Payment.updateStatus called", { 
    payment_id: id, 
    new_status: status, 
    timestamp: new Date().toISOString() 
  });

  const query = "UPDATE payments SET status = ?, updated_at = NOW() WHERE id = ?";
  logger.debug("Executing payment status update query", { 
    query: query,
    payment_id: id,
    new_status: status 
  });

  sql.query(query, [status, id], (err, res) => {
    if (err) {
      logger.error("Payment status update failed", { 
        error: err.message, 
        code: err.code,
        payment_id: id,
        status: status,
        stack: err.stack 
      });
      result(err, null);
      return;
    }

    if (res.affectedRows == 0) {
      logger.warn("Payment not found for status update", { 
        payment_id: id, 
        status: status 
      });
      result({ kind: "not_found" }, null);
      return;
    }

    logger.info("Payment status updated", { 
      payment_id: id, 
      new_status: status,
      affected_rows: res.affectedRows 
    });
    
    logger.trace("Payment status update completed", { 
      payment_id: id,
      status: status,
      affected_rows: res.affectedRows,
      changed_rows: res.changedRows 
    });

    result(null, { id: id, status: status });
  });
};

// Process payment with comprehensive logging
Payment.processPayment = (id, result) => {
  logger.trace("Payment.processPayment called", { 
    payment_id: id, 
    timestamp: new Date().toISOString() 
  });

  // First, get the payment details
  Payment.findById(id, (err, payment) => {
    if (err) {
      logger.error("Failed to fetch payment for processing", { 
        payment_id: id, 
        error: err 
      });
      result(err, null);
      return;
    }

    logger.debug("Processing payment", { 
      payment_id: id,
      amount: payment.amount,
      currency: payment.currency,
      current_status: payment.status 
    });

    // Simulate payment processing logic
    if (payment.status !== 'pending') {
      logger.warn("Payment processing attempted on non-pending payment", { 
        payment_id: id, 
        current_status: payment.status 
      });
      result({ kind: "invalid_status", message: "Payment is not in pending status" }, null);
      return;
    }

    // Simulate processing time and success/failure
    const processingSuccess = Math.random() > 0.1; // 90% success rate

    if (processingSuccess) {
      Payment.updateStatus(id, 'completed', (updateErr, updatedPayment) => {
        if (updateErr) {
          logger.error("Failed to update payment status after successful processing", { 
            payment_id: id, 
            error: updateErr 
          });
          result(updateErr, null);
          return;
        }

        logger.info("Payment processed successfully", { 
          payment_id: id,
          amount: payment.amount,
          currency: payment.currency 
        });
        
        logger.trace("Payment processing completed successfully", { 
          payment_id: id,
          original_status: payment.status,
          new_status: 'completed',
          processing_time: new Date().toISOString() 
        });

        result(null, { ...payment, status: 'completed' });
      });
    } else {
      Payment.updateStatus(id, 'failed', (updateErr, updatedPayment) => {
        if (updateErr) {
          logger.error("Failed to update payment status after processing failure", { 
            payment_id: id, 
            error: updateErr 
          });
          result(updateErr, null);
          return;
        }

        logger.warn("Payment processing failed", { 
          payment_id: id,
          amount: payment.amount,
          currency: payment.currency,
          reason: "Simulated processing failure" 
        });
        
        logger.trace("Payment processing completed with failure", { 
          payment_id: id,
          original_status: payment.status,
          new_status: 'failed',
          processing_time: new Date().toISOString() 
        });

        result(null, { ...payment, status: 'failed' });
      });
    }
  });
};

module.exports = Payment;