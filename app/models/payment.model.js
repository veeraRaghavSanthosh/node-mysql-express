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

// Create and save a new Payment
Payment.create = (newPayment, result) => {
  logger.trace('Payment.create called', { 
    customer_id: newPayment.customer_id, 
    amount: newPayment.amount,
    currency: newPayment.currency,
    payment_method: newPayment.payment_method 
  });
  
  logger.debug('Attempting to create payment in database', { 
    payment_data: newPayment 
  });

  sql.query("INSERT INTO payments SET ?", newPayment, (err, res) => {
    if (err) {
      logger.error("Error creating payment", { 
        error: err.message, 
        stack: err.stack,
        customer_id: newPayment.customer_id,
        amount: newPayment.amount
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
    
    logger.trace('Payment.create completed', { payment: createdPayment });
    result(null, createdPayment);
  });
};

// Find Payment by ID
Payment.findById = (paymentId, result) => {
  logger.trace('Payment.findById called', { payment_id: paymentId });
  
  logger.debug('Querying payment by ID', { payment_id: paymentId });

  sql.query(`SELECT * FROM payments WHERE id = ${paymentId}`, (err, res) => {
    if (err) {
      logger.error("Error finding payment by ID", { 
        error: err.message, 
        stack: err.stack,
        payment_id: paymentId 
      });
      result(err, null);
      return;
    }

    if (res.length) {
      logger.info("Payment found", { 
        payment_id: paymentId,
        customer_id: res[0].customer_id,
        amount: res[0].amount,
        status: res[0].status
      });
      logger.trace('Payment.findById completed', { payment: res[0] });
      result(null, res[0]);
      return;
    }

    logger.warn("Payment not found", { payment_id: paymentId });
    result({ kind: "not_found" }, null);
  });
};

// Get all Payments
Payment.getAll = (result) => {
  logger.trace('Payment.getAll called');
  
  logger.debug('Querying all payments from database');

  sql.query("SELECT * FROM payments", (err, res) => {
    if (err) {
      logger.error("Error retrieving all payments", { 
        error: err.message, 
        stack: err.stack 
      });
      result(null, err);
      return;
    }

    logger.info("Retrieved all payments", { count: res.length });
    logger.trace('Payment.getAll completed', { payments_count: res.length });
    result(null, res);
  });
};

// Get Payments by Customer ID
Payment.getByCustomerId = (customerId, result) => {
  logger.trace('Payment.getByCustomerId called', { customer_id: customerId });
  
  logger.debug('Querying payments by customer ID', { customer_id: customerId });

  sql.query("SELECT * FROM payments WHERE customer_id = ?", [customerId], (err, res) => {
    if (err) {
      logger.error("Error retrieving payments by customer ID", { 
        error: err.message, 
        stack: err.stack,
        customer_id: customerId 
      });
      result(null, err);
      return;
    }

    logger.info("Retrieved payments for customer", { 
      customer_id: customerId, 
      count: res.length 
    });
    logger.trace('Payment.getByCustomerId completed', { 
      customer_id: customerId, 
      payments_count: res.length 
    });
    result(null, res);
  });
};

// Update Payment by ID
Payment.updateById = (id, payment, result) => {
  logger.trace('Payment.updateById called', { 
    payment_id: id, 
    update_data: payment 
  });
  
  logger.debug('Attempting to update payment', { 
    payment_id: id,
    status: payment.status,
    amount: payment.amount
  });

  sql.query(
    "UPDATE payments SET customer_id = ?, amount = ?, currency = ?, payment_method = ?, status = ?, transaction_id = ?, description = ? WHERE id = ?",
    [payment.customer_id, payment.amount, payment.currency, payment.payment_method, payment.status, payment.transaction_id, payment.description, id],
    (err, res) => {
      if (err) {
        logger.error("Error updating payment", { 
          error: err.message, 
          stack: err.stack,
          payment_id: id 
        });
        result(null, err);
        return;
      }

      if (res.affectedRows == 0) {
        logger.warn("Payment not found for update", { payment_id: id });
        result({ kind: "not_found" }, null);
        return;
      }

      const updatedPayment = { id: id, ...payment };
      logger.info("Payment updated successfully", { 
        payment_id: id,
        status: payment.status,
        amount: payment.amount
      });
      logger.trace('Payment.updateById completed', { payment: updatedPayment });
      result(null, updatedPayment);
    }
  );
};

// Process Payment (business logic)
Payment.processPayment = (paymentData, result) => {
  logger.trace('Payment.processPayment called', { 
    customer_id: paymentData.customer_id,
    amount: paymentData.amount,
    payment_method: paymentData.payment_method
  });

  logger.info("Starting payment processing", {
    customer_id: paymentData.customer_id,
    amount: paymentData.amount,
    currency: paymentData.currency,
    payment_method: paymentData.payment_method
  });

  // Simulate payment processing logic
  const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  logger.debug("Generated transaction ID", { 
    transaction_id: transactionId,
    customer_id: paymentData.customer_id 
  });

  // Create payment record with processing status
  const payment = new Payment({
    ...paymentData,
    transaction_id: transactionId,
    status: 'processing'
  });

  Payment.create(payment, (err, createdPayment) => {
    if (err) {
      logger.error("Failed to create payment record during processing", { 
        error: err.message,
        customer_id: paymentData.customer_id,
        amount: paymentData.amount
      });
      result(err, null);
      return;
    }

    // Simulate processing delay and success/failure
    setTimeout(() => {
      const isSuccess = Math.random() > 0.1; // 90% success rate for simulation
      const newStatus = isSuccess ? 'completed' : 'failed';
      
      logger.debug("Payment processing simulation completed", {
        payment_id: createdPayment.id,
        transaction_id: transactionId,
        success: isSuccess,
        new_status: newStatus
      });

      // Update payment status
      Payment.updateById(createdPayment.id, { 
        ...createdPayment, 
        status: newStatus 
      }, (updateErr, updatedPayment) => {
        if (updateErr) {
          logger.error("Failed to update payment status after processing", { 
            error: updateErr.message,
            payment_id: createdPayment.id,
            transaction_id: transactionId
          });
          result(updateErr, null);
          return;
        }

        if (isSuccess) {
          logger.info("Payment processed successfully", {
            payment_id: createdPayment.id,
            transaction_id: transactionId,
            customer_id: paymentData.customer_id,
            amount: paymentData.amount,
            final_status: newStatus
          });
        } else {
          logger.warn("Payment processing failed", {
            payment_id: createdPayment.id,
            transaction_id: transactionId,
            customer_id: paymentData.customer_id,
            amount: paymentData.amount,
            final_status: newStatus
          });
        }

        logger.trace('Payment.processPayment completed', { 
          payment: updatedPayment,
          success: isSuccess 
        });
        result(null, updatedPayment);
      });
    }, 1000); // Simulate 1 second processing time
  });
};

// Delete Payment
Payment.remove = (id, result) => {
  logger.trace('Payment.remove called', { payment_id: id });
  
  logger.debug('Attempting to delete payment', { payment_id: id });

  sql.query("DELETE FROM payments WHERE id = ?", id, (err, res) => {
    if (err) {
      logger.error("Error deleting payment", { 
        error: err.message, 
        stack: err.stack,
        payment_id: id 
      });
      result(null, err);
      return;
    }

    if (res.affectedRows == 0) {
      logger.warn("Payment not found for deletion", { payment_id: id });
      result({ kind: "not_found" }, null);
      return;
    }

    logger.info("Payment deleted successfully", { payment_id: id });
    logger.trace('Payment.remove completed', { payment_id: id });
    result(null, res);
  });
};

module.exports = Payment;