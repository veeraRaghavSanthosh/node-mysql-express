const sql = require("../../app/models/db.js");

// Payment constructor
const Payment = function(payment) {
  this.customer_id = payment.customer_id;
  this.amount = payment.amount;
  this.payment_method = payment.payment_method;
  this.status = payment.status || 'pending';
  this.transaction_id = payment.transaction_id;
};

// Create a new payment (callback-based)
Payment.create = (newPayment, result) => {
  sql.query("INSERT INTO payments SET ?", newPayment, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    console.log("created payment: ", { id: res.insertId, ...newPayment });
    result(null, { id: res.insertId, ...newPayment });
  });
};

// Find payment by ID (callback-based)
Payment.findById = (paymentId, result) => {
  sql.query(`SELECT * FROM payments WHERE id = ${paymentId}`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    if (res.length) {
      console.log("found payment: ", res[0]);
      result(null, res[0]);
      return;
    }

    // not found Payment with the id
    result({ kind: "not_found" }, null);
  });
};

// Get all payments (callback-based)
Payment.getAll = result => {
  sql.query("SELECT * FROM payments", (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    console.log("payments: ", res);
    result(null, res);
  });
};

// Get payments by customer ID (callback-based)
Payment.getByCustomerId = (customerId, result) => {
  sql.query("SELECT * FROM payments WHERE customer_id = ?", [customerId], (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    console.log("customer payments: ", res);
    result(null, res);
  });
};

// Update payment status (callback-based)
Payment.updateStatus = (id, status, result) => {
  sql.query(
    "UPDATE payments SET status = ? WHERE id = ?",
    [status, id],
    (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }

      if (res.affectedRows == 0) {
        // not found Payment with the id
        result({ kind: "not_found" }, null);
        return;
      }

      console.log("updated payment status: ", { id: id, status: status });
      result(null, { id: id, status: status });
    }
  );
};

// Process payment (callback-based - simulates payment processing)
Payment.processPayment = (paymentId, result) => {
  // First, get the payment details
  Payment.findById(paymentId, (err, payment) => {
    if (err) {
      result(err, null);
      return;
    }

    if (!payment) {
      result({ kind: "not_found" }, null);
      return;
    }

    // Simulate payment processing logic
    setTimeout(() => {
      const success = Math.random() > 0.2; // 80% success rate
      const newStatus = success ? 'completed' : 'failed';
      
      // Update payment status
      Payment.updateStatus(paymentId, newStatus, (updateErr, updateRes) => {
        if (updateErr) {
          result(updateErr, null);
          return;
        }

        result(null, { 
          ...payment, 
          status: newStatus,
          processed_at: new Date()
        });
      });
    }, 1000); // Simulate 1 second processing time
  });
};

// Refund payment (callback-based)
Payment.refund = (paymentId, refundAmount, result) => {
  Payment.findById(paymentId, (err, payment) => {
    if (err) {
      result(err, null);
      return;
    }

    if (!payment) {
      result({ kind: "not_found" }, null);
      return;
    }

    if (payment.status !== 'completed') {
      result({ kind: "invalid_status", message: "Can only refund completed payments" }, null);
      return;
    }

    if (refundAmount > payment.amount) {
      result({ kind: "invalid_amount", message: "Refund amount cannot exceed payment amount" }, null);
      return;
    }

    // Create refund record
    const refund = {
      payment_id: paymentId,
      amount: refundAmount,
      status: 'processed',
      created_at: new Date()
    };

    sql.query("INSERT INTO refunds SET ?", refund, (refundErr, refundRes) => {
      if (refundErr) {
        console.log("error creating refund: ", refundErr);
        result(refundErr, null);
        return;
      }

      // Update original payment status if full refund
      if (refundAmount === payment.amount) {
        Payment.updateStatus(paymentId, 'refunded', (statusErr, statusRes) => {
          if (statusErr) {
            result(statusErr, null);
            return;
          }

          result(null, { 
            refund_id: refundRes.insertId, 
            ...refund,
            payment_status: 'refunded'
          });
        });
      } else {
        Payment.updateStatus(paymentId, 'partially_refunded', (statusErr, statusRes) => {
          if (statusErr) {
            result(statusErr, null);
            return;
          }

          result(null, { 
            refund_id: refundRes.insertId, 
            ...refund,
            payment_status: 'partially_refunded'
          });
        });
      }
    });
  });
};

module.exports = Payment;