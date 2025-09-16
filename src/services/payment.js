const mysql = require('mysql');

/**
 * Payment Service - Handles payment processing, refunds, and transaction management
 * 
 * This service provides centralized payment functionality with proper error handling,
 * transaction rollback capabilities, and comprehensive validation.
 */
class PaymentService {
  constructor(dbConnection) {
    this.db = dbConnection;
  }

  /**
   * Process a payment transaction
   * 
   * Edge cases handled:
   * - Invalid payment data validation
   * - Non-existent customer handling  
   * - Database transaction failures with rollback
   * - Balance update failures with payment rollback
   * 
   * @param {Object} paymentData - Payment information
   * @param {Function} callback - Callback function (err, result)
   */
  processPayment(paymentData, callback) {
    // Validate payment data first
    if (!this._validatePaymentData(paymentData)) {
      return callback(new Error('Invalid payment data'), null);
    }

    // Check if customer exists before processing
    this._findCustomer(paymentData.customerId, (err, customer) => {
      if (err) {
        return this._handleDatabaseError('finding customer', err, callback);
      }

      if (!customer) {
        return callback(new Error('Customer not found'), null);
      }

      // Create payment record
      this._createPaymentRecord(paymentData, (err, result) => {
        if (err) {
          return this._handleDatabaseError('creating payment record', err, callback);
        }

        // Update customer balance - rollback payment if this fails
        this._updateCustomerBalance(paymentData.customerId, paymentData.amount, (err, updateResult) => {
          if (err) {
            // Critical edge case: Rollback payment if balance update fails
            this._rollbackPayment(result.insertId, () => {
              return this._handleDatabaseError('updating customer balance', err, callback);
            });
            return;
          }

          console.log('Payment processed successfully:', result);
          callback(null, { paymentId: result.insertId, ...paymentData });
        });
      });
    });
  }

  /**
   * Process a payment refund
   * 
   * Edge cases handled:
   * - Non-existent payment validation
   * - Refund amount exceeding original payment
   * - Database failures with refund rollback
   * - Partial refund support
   * 
   * @param {number} paymentId - Original payment ID
   * @param {number} refundAmount - Amount to refund
   * @param {Function} callback - Callback function (err, result)
   */
  refundPayment(paymentId, refundAmount, callback) {
    // Find the original payment first
    this._findPayment(paymentId, (err, payment) => {
      if (err) {
        return this._handleDatabaseError('finding payment', err, callback);
      }

      if (!payment) {
        return callback(new Error('Payment not found'), null);
      }

      // Edge case: Validate refund amount doesn't exceed original payment
      if (refundAmount > payment.amount) {
        return callback(new Error('Refund amount exceeds original payment'), null);
      }

      // Edge case: Check if payment is already fully refunded
      this._getRefundTotal(paymentId, (err, totalRefunded) => {
        if (err) {
          return this._handleDatabaseError('checking existing refunds', err, callback);
        }

        if (totalRefunded + refundAmount > payment.amount) {
          return callback(new Error('Total refunds would exceed original payment amount'), null);
        }

        // Create refund record
        this._createRefundRecord(paymentId, refundAmount, (err, result) => {
          if (err) {
            return this._handleDatabaseError('creating refund record', err, callback);
          }

          // Update customer balance (negative amount for refund)
          this._updateCustomerBalance(payment.customer_id, -refundAmount, (err, updateResult) => {
            if (err) {
              // Critical edge case: Rollback refund if balance update fails
              this._rollbackRefund(result.insertId, () => {
                return this._handleDatabaseError('updating customer balance for refund', err, callback);
              });
              return;
            }

            console.log('Refund processed successfully:', result);
            callback(null, { refundId: result.insertId, paymentId, refundAmount });
          });
        });
      });
    });
  }

  /**
   * Get payment history for a customer
   * 
   * Edge cases handled:
   * - Missing customer ID validation
   * - Empty result set handling
   * - Mixed payment and refund record sorting
   * 
   * @param {number} customerId - Customer ID
   * @param {Function} callback - Callback function (err, results)
   */
  getPaymentHistory(customerId, callback) {
    if (!customerId) {
      return callback(new Error('Customer ID is required'), null);
    }

    const query = `
      SELECT p.*, 'payment' as type FROM payments p WHERE p.customer_id = ?
      UNION ALL
      SELECT r.id, r.payment_id as payment_id, r.amount, r.created_at, p.customer_id, 'refund' as type 
      FROM refunds r 
      JOIN payments p ON r.payment_id = p.id 
      WHERE p.customer_id = ?
      ORDER BY created_at DESC
    `;

    this.db.query(query, [customerId, customerId], (err, results) => {
      if (err) {
        return this._handleDatabaseError('retrieving payment history', err, callback);
      }

      console.log('Payment history retrieved:', results.length, 'records');
      callback(null, results);
    });
  }

  // ============================================================================
  // HELPER FUNCTIONS - Extracted repeated logic for better maintainability
  // ============================================================================

  /**
   * Validate payment data structure and values
   * 
   * Edge cases:
   * - Null/undefined payment data
   * - Missing required fields
   * - Invalid amount values (negative, zero, excessive)
   * - Invalid customer ID format
   */
  _validatePaymentData(paymentData) {
    // Edge case: Check for null/undefined payment data
    if (!paymentData) {
      return false;
    }

    // Edge case: Check for required fields
    if (!paymentData.customerId || !paymentData.amount) {
      return false;
    }

    // Edge case: Validate amount is positive and reasonable (prevent abuse)
    if (paymentData.amount <= 0 || paymentData.amount > 1000000) {
      return false;
    }

    // Edge case: Validate customer ID is a valid positive integer
    if (isNaN(paymentData.customerId) || paymentData.customerId <= 0) {
      return false;
    }

    return true;
  }

  /**
   * Find customer by ID - Helper to reduce code duplication
   */
  _findCustomer(customerId, callback) {
    this.db.query('SELECT * FROM customers WHERE id = ?', [customerId], (err, results) => {
      if (err) {
        return callback(err, null);
      }

      // Edge case: Handle empty result set gracefully
      callback(null, results.length > 0 ? results[0] : null);
    });
  }

  /**
   * Find payment by ID - Helper to reduce code duplication
   */
  _findPayment(paymentId, callback) {
    this.db.query('SELECT * FROM payments WHERE id = ?', [paymentId], (err, results) => {
      if (err) {
        return callback(err, null);
      }

      // Edge case: Handle empty result set gracefully
      callback(null, results.length > 0 ? results[0] : null);
    });
  }

  /**
   * Get total refund amount for a payment - Helper for refund validation
   */
  _getRefundTotal(paymentId, callback) {
    this.db.query(
      'SELECT COALESCE(SUM(amount), 0) as total FROM refunds WHERE payment_id = ?', 
      [paymentId], 
      (err, results) => {
        if (err) {
          return callback(err, null);
        }

        callback(null, results[0].total);
      }
    );
  }

  /**
   * Create payment record - Helper to reduce duplication
   */
  _createPaymentRecord(paymentData, callback) {
    const paymentRecord = {
      customer_id: paymentData.customerId,
      amount: paymentData.amount,
      payment_method: paymentData.paymentMethod || 'credit_card',
      status: 'completed',
      created_at: new Date()
    };

    this.db.query('INSERT INTO payments SET ?', paymentRecord, callback);
  }

  /**
   * Create refund record - Helper to reduce duplication
   */
  _createRefundRecord(paymentId, refundAmount, callback) {
    const refundRecord = {
      payment_id: paymentId,
      amount: refundAmount,
      status: 'completed',
      created_at: new Date()
    };

    this.db.query('INSERT INTO refunds SET ?', refundRecord, callback);
  }

  /**
   * Update customer balance - Helper supporting both positive and negative amounts
   * 
   * Edge cases:
   * - Handles both payments (positive) and refunds (negative)
   * - Initializes balance to 0 if NULL
   * - Validates customer exists after update
   */
  _updateCustomerBalance(customerId, amount, callback) {
    const updateQuery = 'UPDATE customers SET balance = COALESCE(balance, 0) + ? WHERE id = ?';

    this.db.query(updateQuery, [amount, customerId], (err, result) => {
      if (err) {
        return callback(err, null);
      }

      // Edge case: Verify customer was actually updated
      if (result.affectedRows === 0) {
        return callback(new Error('Customer not found for balance update'), null);
      }

      callback(null, result);
    });
  }

  /**
   * Rollback payment - Helper for error recovery
   */
  _rollbackPayment(paymentId, callback) {
    this.db.query('DELETE FROM payments WHERE id = ?', [paymentId], (err, result) => {
      if (err) {
        console.log('Critical error: Failed to rollback payment:', err);
      }
      callback(err, result);
    });
  }

  /**
   * Rollback refund - Helper for error recovery
   */
  _rollbackRefund(refundId, callback) {
    this.db.query('DELETE FROM refunds WHERE id = ?', [refundId], (err, result) => {
      if (err) {
        console.log('Critical error: Failed to rollback refund:', err);
      }
      callback(err, result);
    });
  }

  /**
   * Centralized error handling - Helper to reduce code duplication
   */
  _handleDatabaseError(operation, err, callback) {
    console.log(`Error ${operation}:`, err);
    callback(err, null);
  }
}

module.exports = PaymentService;