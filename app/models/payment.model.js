const sql = require("./db.js");
const logger = require("../config/logger.config.js");

// Payment constructor
const Payment = function(payment) {
  this.customer_id = payment.customer_id;
  this.amount = payment.amount;
  this.currency = payment.currency || 'USD';
  this.payment_method = payment.payment_method;
  this.status = payment.status || 'pending';
  this.transaction_id = payment.transaction_id;
  this.description = payment.description;
};

Payment.create = (newPayment, result) => {
  logger.trace('Payment.create called', { 
    customer_id: newPayment.customer_id, 
    amount: newPayment.amount,
    currency: newPayment.currency,
    payment_method: newPayment.payment_method 
  });

  logger.debug('Attempting to create new payment', {
    payment_data: {
      customer_id: newPayment.customer_id,
      amount: newPayment.amount,
      currency: newPayment.currency,
      payment_method: newPayment.payment_method,
      status: newPayment.status
    }
  });

  sql.query("INSERT INTO payments SET ?", newPayment, (err, res) => {
    if (err) {
      logger.error("Failed to create payment", {
        error: err.message,
        stack: err.stack,
        payment_data: {
          customer_id: newPayment.customer_id,
          amount: newPayment.amount,
          currency: newPayment.currency
        }
      });
      result(err, null);
      return;
    }

    const createdPayment = { id: res.insertId, ...newPayment };
    logger.info("Payment created successfully", {
      payment_id: res.insertId,
      customer_id: newPayment.customer_id,
      amount: newPayment.amount,
      currency: newPayment.currency,
      status: newPayment.status
    });

    logger.debug("Complete payment creation details", {
      payment: createdPayment,
      insert_id: res.insertId
    });

    result(null, createdPayment);
  });
};

Payment.findById = (paymentId, result) => {
  logger.trace('Payment.findById called', { payment_id: paymentId });
  
  logger.debug('Searching for payment by ID', { payment_id: paymentId });

  sql.query(`SELECT * FROM payments WHERE id = ?`, [paymentId], (err, res) => {
    if (err) {
      logger.error("Failed to find payment by ID", {
        error: err.message,
        stack: err.stack,
        payment_id: paymentId
      });
      result(err, null);
      return;
    }

    if (res.length) {
      logger.debug("Payment found", {
        payment_id: paymentId,
        payment_data: {
          id: res[0].id,
          customer_id: res[0].customer_id,
          amount: res[0].amount,
          status: res[0].status
        }
      });
      result(null, res[0]);
      return;
    }

    logger.debug("Payment not found", { payment_id: paymentId });
    result({ kind: "not_found" }, null);
  });
};

Payment.findByCustomerId = (customerId, result) => {
  logger.trace('Payment.findByCustomerId called', { customer_id: customerId });
  
  logger.debug('Searching for payments by customer ID', { customer_id: customerId });

  sql.query(`SELECT * FROM payments WHERE customer_id = ?`, [customerId], (err, res) => {
    if (err) {
      logger.error("Failed to find payments by customer ID", {
        error: err.message,
        stack: err.stack,
        customer_id: customerId
      });
      result(err, null);
      return;
    }

    logger.debug("Payments found for customer", {
      customer_id: customerId,
      payment_count: res.length
    });

    result(null, res);
  });
};

Payment.updateStatus = (id, status, result) => {
  logger.trace('Payment.updateStatus called', { 
    payment_id: id, 
    new_status: status 
  });

  logger.debug('Updating payment status', {
    payment_id: id,
    new_status: status
  });

  sql.query(
    "UPDATE payments SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    [status, id],
    (err, res) => {
      if (err) {
        logger.error("Failed to update payment status", {
          error: err.message,
          stack: err.stack,
          payment_id: id,
          attempted_status: status
        });
        result(null, err);
        return;
      }

      if (res.affectedRows == 0) {
        logger.debug("Payment not found for status update", { payment_id: id });
        result({ kind: "not_found" }, null);
        return;
      }

      logger.info("Payment status updated successfully", {
        payment_id: id,
        new_status: status,
        affected_rows: res.affectedRows
      });

      logger.debug("Payment status update complete", {
        payment_id: id,
        status: status,
        mysql_result: {
          affected_rows: res.affectedRows,
          changed_rows: res.changedRows
        }
      });

      result(null, { id: id, status: status });
    }
  );
};

Payment.processPayment = (paymentId, result) => {
  logger.trace('Payment.processPayment called', { payment_id: paymentId });

  logger.debug('Starting payment processing', { payment_id: paymentId });

  // First, get the payment details
  Payment.findById(paymentId, (err, payment) => {
    if (err) {
      logger.error("Failed to find payment for processing", {
        error: err.message,
        payment_id: paymentId
      });
      result(err, null);
      return;
    }

    if (!payment) {
      logger.debug("Payment not found for processing", { payment_id: paymentId });
      result({ kind: "not_found" }, null);
      return;
    }

    logger.debug('Payment found for processing', {
      payment_id: paymentId,
      amount: payment.amount,
      currency: payment.currency,
      current_status: payment.status
    });

    // Simulate payment processing logic
    if (payment.status !== 'pending') {
      logger.warn("Attempted to process non-pending payment", {
        payment_id: paymentId,
        current_status: payment.status
      });
      result({ kind: "invalid_status", message: "Payment is not in pending status" }, null);
      return;
    }

    // Simulate processing time and success/failure
    const isSuccess = Math.random() > 0.1; // 90% success rate for simulation
    const newStatus = isSuccess ? 'completed' : 'failed';

    logger.debug('Payment processing simulation result', {
      payment_id: paymentId,
      processing_result: newStatus,
      amount: payment.amount
    });

    // Update the payment status
    Payment.updateStatus(paymentId, newStatus, (updateErr, updateResult) => {
      if (updateErr) {
        logger.error("Failed to update payment status after processing", {
          error: updateErr.message,
          payment_id: paymentId,
          attempted_status: newStatus
        });
        result(updateErr, null);
        return;
      }

      if (isSuccess) {
        logger.info("Payment processed successfully", {
          payment_id: paymentId,
          amount: payment.amount,
          currency: payment.currency,
          customer_id: payment.customer_id,
          final_status: newStatus
        });
      } else {
        logger.warn("Payment processing failed", {
          payment_id: paymentId,
          amount: payment.amount,
          currency: payment.currency,
          customer_id: payment.customer_id,
          final_status: newStatus
        });
      }

      logger.trace('Payment.processPayment completed', {
        payment_id: paymentId,
        final_status: newStatus
      });

      result(null, { 
        id: paymentId, 
        status: newStatus, 
        amount: payment.amount,
        currency: payment.currency 
      });
    });
  });
};

module.exports = Payment;