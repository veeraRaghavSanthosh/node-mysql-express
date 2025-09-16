const sql = require("../../app/models/db.js");

/**
 * Payment Service - Handles payment processing, refunds, and payment history
 * 
 * This service contains several helper functions to reduce code duplication
 * and improve maintainability. Key patterns extracted:
 * - Database error handling
 * - Customer validation
 * - Input validation
 * - Amount validation
 */

// Constants for payment limits and validation
const PAYMENT_LIMITS = {
  MAX_PAYMENT_AMOUNT: 10000,
  MIN_AMOUNT: 0.01
};

const VALID_PAYMENT_METHODS = ['credit_card', 'debit_card', 'paypal', 'bank_transfer'];

// Helper Functions

/**
 * Handles database query errors with consistent error logging and callback format
 * @param {Error} err - Database error object
 * @param {Function} callback - Callback function to execute on error
 * @param {string} context - Context description for logging
 * @returns {boolean} - Returns true if error was handled, false otherwise
 */
const handleDatabaseError = (err, callback, context = "Database operation") => {
  if (err) {
    console.log(`${context} error: `, err);
    callback({ error: "Database error occurred" }, null);
    return true;
  }
  return false;
};

/**
 * Validates if a customer exists in the database
 * @param {number} customerId - Customer ID to validate
 * @param {Function} callback - Callback function
 * @param {Function} onSuccess - Function to execute if customer exists
 */
const validateCustomerExists = (customerId, callback, onSuccess) => {
  // Edge case: Handle SQL injection by using parameterized queries
  sql.query("SELECT * FROM customers WHERE id = ?", [customerId], (err, customerRes) => {
    if (handleDatabaseError(err, callback, "Customer validation")) return;
    
    if (!customerRes.length) {
      return callback({ error: "Customer not found" }, null);
    }
    
    onSuccess(customerRes[0]);
  });
};

/**
 * Validates payment amount with business rules
 * @param {number} amount - Amount to validate
 * @param {string} context - Context for error messages (e.g., "payment", "refund")
 * @returns {Object|null} - Error object if invalid, null if valid
 */
const validateAmount = (amount, context = "payment") => {
  if (!amount || amount <= PAYMENT_LIMITS.MIN_AMOUNT) {
    return { error: `Invalid ${context} amount` };
  }
  
  // Edge case: Check for extremely large amounts that might cause overflow
  if (amount > PAYMENT_LIMITS.MAX_PAYMENT_AMOUNT) {
    return { error: `${context.charAt(0).toUpperCase() + context.slice(1)} amount exceeds maximum limit` };
  }
  
  // Edge case: Check for decimal precision issues
  if (Number.isNaN(Number(amount)) || !Number.isFinite(Number(amount))) {
    return { error: `Invalid ${context} amount format` };
  }
  
  return null;
};

/**
 * Validates required string parameters
 * @param {string} value - Value to validate
 * @param {string} fieldName - Field name for error message
 * @returns {Object|null} - Error object if invalid, null if valid
 */
const validateRequiredField = (value, fieldName) => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return { error: `${fieldName} is required` };
  }
  return null;
};

/**
 * Generates a unique transaction ID with timestamp and random component
 * Edge case: Ensures uniqueness even with high concurrency
 * @returns {string} - Unique transaction ID
 */
const generateTransactionId = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  const counter = process.hrtime.bigint().toString().slice(-4); // High precision counter
  return `TXN_${timestamp}_${random}_${counter}`;
};

const PaymentService = {
  /**
   * Process a payment transaction
   * @param {Object} paymentData - Payment information
   * @param {number} paymentData.amount - Payment amount
   * @param {number} paymentData.customerId - Customer ID
   * @param {string} paymentData.paymentMethod - Payment method
   * @param {Function} callback - Callback function (err, result)
   */
  processPayment: (paymentData, callback) => {
    // Input validation using helper functions
    const amountError = validateAmount(paymentData.amount, "payment");
    if (amountError) return callback(amountError, null);
    
    const customerIdError = validateRequiredField(paymentData.customerId, "Customer ID");
    if (customerIdError) return callback(customerIdError, null);

    const paymentMethodError = validateRequiredField(paymentData.paymentMethod, "Payment method");
    if (paymentMethodError) return callback(paymentMethodError, null);

    // Edge case: Validate payment method against allowed methods
    if (!VALID_PAYMENT_METHODS.includes(paymentData.paymentMethod)) {
      return callback({ error: "Invalid payment method" }, null);
    }

    // Validate customer exists using helper function
    validateCustomerExists(paymentData.customerId, callback, (customer) => {
      // Process the payment
      const payment = {
        customer_id: paymentData.customerId,
        amount: paymentData.amount,
        payment_method: paymentData.paymentMethod,
        status: 'pending',
        created_at: new Date(),
        transaction_id: generateTransactionId()
      };

      sql.query("INSERT INTO payments SET ?", payment, (err, res) => {
        if (handleDatabaseError(err, callback, "Payment processing")) return;

        console.log("Payment processed: ", { id: res.insertId, ...payment });
        callback(null, { id: res.insertId, ...payment });
      });
    });
  },

  /**
   * Refund a payment
   * @param {number} paymentId - Original payment ID
   * @param {number} refundAmount - Amount to refund
   * @param {Function} callback - Callback function (err, result)
   */
  refundPayment: (paymentId, refundAmount, callback) => {
    // Input validation using helper functions
    const paymentIdError = validateRequiredField(paymentId, "Payment ID");
    if (paymentIdError) return callback(paymentIdError, null);

    const amountError = validateAmount(refundAmount, "refund");
    if (amountError) return callback(amountError, null);

    // Get original payment using parameterized query to prevent SQL injection
    sql.query("SELECT * FROM payments WHERE id = ?", [paymentId], (err, paymentRes) => {
      if (handleDatabaseError(err, callback, "Payment lookup")) return;

      if (!paymentRes.length) {
        return callback({ error: "Payment not found" }, null);
      }

      const originalPayment = paymentRes[0];

      // Edge case: Validate refund amount doesn't exceed original payment
      if (refundAmount > originalPayment.amount) {
        return callback({ error: "Refund amount cannot exceed original payment amount" }, null);
      }

      // Edge case: Check if payment is already refunded
      if (originalPayment.status === 'refunded') {
        return callback({ error: "Payment already refunded" }, null);
      }

      // Edge case: Check if payment is in a refundable state
      if (originalPayment.status === 'failed' || originalPayment.status === 'cancelled') {
        return callback({ error: `Cannot refund ${originalPayment.status} payment` }, null);
      }

      // Process the refund
      const refund = {
        original_payment_id: paymentId,
        customer_id: originalPayment.customer_id,
        amount: refundAmount,
        status: 'completed',
        created_at: new Date(),
        transaction_id: generateTransactionId()
      };

      sql.query("INSERT INTO refunds SET ?", refund, (err, res) => {
        if (handleDatabaseError(err, callback, "Refund processing")) return;

        // Edge case: Update original payment status if full refund
        if (refundAmount === originalPayment.amount) {
          sql.query("UPDATE payments SET status = 'refunded' WHERE id = ?", [paymentId], (updateErr) => {
            if (updateErr) {
              console.log("Error updating payment status: ", updateErr);
              // Note: We don't fail the refund if status update fails, but we log it
            }
          });
        }

        console.log("Refund processed: ", { id: res.insertId, ...refund });
        callback(null, { id: res.insertId, ...refund });
      });
    });
  },

  /**
   * Get payment history for a customer
   * @param {number} customerId - Customer ID
   * @param {Function} callback - Callback function (err, result)
   */
  getPaymentHistory: (customerId, callback) => {
    // Input validation using helper function
    const customerIdError = validateRequiredField(customerId, "Customer ID");
    if (customerIdError) return callback(customerIdError, null);

    // Validate customer exists using helper function
    validateCustomerExists(customerId, callback, (customer) => {
      // Get payment history using parameterized query
      sql.query("SELECT * FROM payments WHERE customer_id = ? ORDER BY created_at DESC", [customerId], (err, payments) => {
        if (handleDatabaseError(err, callback, "Payment history retrieval")) return;

        console.log(`Retrieved ${payments.length} payments for customer ${customerId}`);
        callback(null, payments);
      });
    });
  },

  /**
   * Validate payment method
   * @param {string} paymentMethod - Payment method to validate
   * @param {Function} callback - Callback function (err, result)
   */
  validatePaymentMethod: (paymentMethod, callback) => {
    const methodError = validateRequiredField(paymentMethod, "Payment method");
    if (methodError) return callback(methodError, null);

    if (!VALID_PAYMENT_METHODS.includes(paymentMethod)) {
      return callback({ error: "Invalid payment method" }, null);
    }

    callback(null, { valid: true, method: paymentMethod });
  },

  /**
   * Get payment by ID
   * @param {number} paymentId - Payment ID
   * @param {Function} callback - Callback function (err, result)
   */
  getPaymentById: (paymentId, callback) => {
    const paymentIdError = validateRequiredField(paymentId, "Payment ID");
    if (paymentIdError) return callback(paymentIdError, null);

    sql.query("SELECT * FROM payments WHERE id = ?", [paymentId], (err, payments) => {
      if (handleDatabaseError(err, callback, "Payment lookup")) return;

      if (!payments.length) {
        return callback({ error: "Payment not found" }, null);
      }

      callback(null, payments[0]);
    });
  }
};

module.exports = PaymentService;