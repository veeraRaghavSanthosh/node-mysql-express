const sql = require("../../app/models/db.js");
const { promisify } = require('util');

// Promisify the database query function
const query = promisify(sql.query).bind(sql);

// constructor
const Payment = function(payment) {
  this.user_id = payment.user_id;
  this.amount = payment.amount;
  this.currency = payment.currency;
  this.status = payment.status || 'pending';
  this.payment_method = payment.payment_method;
  this.transaction_id = payment.transaction_id;
  this.created_at = payment.created_at;
};

// Create and save a new Payment
Payment.create = async (newPayment) => {
  try {
    const res = await query("INSERT INTO payments SET ?", newPayment);
    console.log("created payment: ", { id: res.insertId, ...newPayment });
    return { id: res.insertId, ...newPayment };
  } catch (err) {
    console.log("error: ", err);
    throw err;
  }
};

// Find payment by id
Payment.findById = async (paymentId) => {
  try {
    const res = await query("SELECT * FROM payments WHERE id = ?", [paymentId]);
    
    if (res.length) {
      console.log("found payment: ", res[0]);
      return res[0];
    }

    // not found Payment with the id
    const error = new Error(`Payment with id ${paymentId} not found`);
    error.kind = "not_found";
    throw error;
  } catch (err) {
    console.log("error: ", err);
    throw err;
  }
};

// Get all payments
Payment.getAll = async () => {
  try {
    const res = await query("SELECT * FROM payments");
    console.log("payments: ", res);
    return res;
  } catch (err) {
    console.log("error: ", err);
    throw err;
  }
};

// Get payments by user id
Payment.findByUserId = async (userId) => {
  try {
    const res = await query("SELECT * FROM payments WHERE user_id = ?", [userId]);
    console.log("found payments for user: ", res);
    return res;
  } catch (err) {
    console.log("error: ", err);
    throw err;
  }
};

// Update payment status
Payment.updateStatus = async (id, status) => {
  try {
    const res = await query(
      "UPDATE payments SET status = ?, updated_at = NOW() WHERE id = ?",
      [status, id]
    );

    if (res.affectedRows == 0) {
      // not found Payment with the id
      const error = new Error(`Payment with id ${id} not found`);
      error.kind = "not_found";
      throw error;
    }

    console.log("updated payment status: ", { id: id, status: status });
    return { id: id, status: status };
  } catch (err) {
    console.log("error: ", err);
    throw err;
  }
};

// Process payment (simulate payment processing)
Payment.processPayment = async (paymentData) => {
  try {
    // Simulate async payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Create payment record first
    const payment = await Payment.create(paymentData);

    // Simulate payment gateway call
    const success = Math.random() > 0.1; // 90% success rate
    const newStatus = success ? 'completed' : 'failed';
    
    // Update payment status
    await Payment.updateStatus(payment.id, newStatus);

    const finalPayment = { ...payment, status: newStatus };
    console.log("processed payment: ", finalPayment);
    return finalPayment;
  } catch (err) {
    console.log("error processing payment: ", err);
    throw err;
  }
};

// Refund payment
Payment.refundPayment = async (paymentId, refundAmount) => {
  try {
    // First, get the payment details
    const payment = await Payment.findById(paymentId);

    if (payment.status !== 'completed') {
      const error = new Error("Can only refund completed payments");
      error.kind = "invalid_status";
      throw error;
    }

    if (refundAmount > payment.amount) {
      const error = new Error("Refund amount cannot exceed payment amount");
      error.kind = "invalid_amount";
      throw error;
    }

    // Create refund record
    const refundData = {
      user_id: payment.user_id,
      amount: -refundAmount,
      currency: payment.currency,
      status: 'completed',
      payment_method: payment.payment_method,
      transaction_id: `refund_${payment.transaction_id}`,
      original_payment_id: paymentId
    };

    const refund = await Payment.create(refundData);

    // Update original payment status if full refund
    if (refundAmount === payment.amount) {
      await Payment.updateStatus(paymentId, 'refunded');
      return { refund, originalPayment: { ...payment, status: 'refunded' } };
    } else {
      return { refund, originalPayment: payment };
    }
  } catch (err) {
    console.log("error refunding payment: ", err);
    throw err;
  }
};

// Get payment statistics
Payment.getStats = async (userId) => {
  try {
    const queries = [
      "SELECT COUNT(*) as total_payments FROM payments WHERE user_id = ?",
      "SELECT SUM(amount) as total_amount FROM payments WHERE user_id = ? AND status = 'completed'",
      "SELECT COUNT(*) as failed_payments FROM payments WHERE user_id = ? AND status = 'failed'"
    ];

    // Execute all queries in parallel using Promise.all
    const results = await Promise.all(
      queries.map(queryStr => query(queryStr, [userId]))
    );

    const stats = {
      totalPayments: results[0][0].total_payments,
      totalAmount: results[1][0].total_amount || 0,
      failedPayments: results[2][0].failed_payments
    };

    console.log("payment stats: ", stats);
    return stats;
  } catch (err) {
    console.log("error: ", err);
    throw err;
  }
};

module.exports = Payment;