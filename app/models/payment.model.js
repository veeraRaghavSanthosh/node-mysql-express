const sql = require("./db.js");

// Payment constructor
const Payment = function(payment) {
  this.customer_id = payment.customer_id;
  this.amount = payment.amount;
  this.currency = payment.currency || 'USD';
  this.payment_method = payment.payment_method;
  this.status = payment.status || 'pending';
  this.created_at = new Date();
};

// Create a new payment
Payment.create = (newPayment, result) => {
  // Validate payment data
  if (!newPayment.customer_id || newPayment.amount === undefined || newPayment.amount === null || !newPayment.payment_method) {
    result({ message: "Missing required payment fields" }, null);
    return;
  }

  if (newPayment.amount <= 0) {
    result({ message: "Payment amount must be greater than 0" }, null);
    return;
  }

  if (newPayment.amount > 100000) {
    result({ message: "Payment amount exceeds maximum limit" }, null);
    return;
  }

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

// Process payment
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

    if (payment.status !== 'pending') {
      result({ message: "Payment is not in pending status" }, null);
      return;
    }

    // Simulate payment processing logic
    const isSuccessful = Math.random() > 0.1; // 90% success rate for simulation
    const newStatus = isSuccessful ? 'completed' : 'failed';
    
    sql.query(
      "UPDATE payments SET status = ?, processed_at = NOW() WHERE id = ?",
      [newStatus, paymentId],
      (err, res) => {
        if (err) {
          console.log("error: ", err);
          result(err, null);
          return;
        }

        if (res.affectedRows == 0) {
          result({ kind: "not_found" }, null);
          return;
        }

        const processedPayment = { ...payment, status: newStatus };
        console.log("processed payment: ", processedPayment);
        result(null, processedPayment);
      }
    );
  });
};

// Find payment by ID
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

    result({ kind: "not_found" }, null);
  });
};

// Get all payments
Payment.getAll = (result) => {
  sql.query("SELECT * FROM payments ORDER BY created_at DESC", (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    console.log("payments: ", res);
    result(null, res);
  });
};

// Get payments by customer ID
Payment.getByCustomerId = (customerId, result) => {
  sql.query("SELECT * FROM payments WHERE customer_id = ? ORDER BY created_at DESC", [customerId], (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    console.log("customer payments: ", res);
    result(null, res);
  });
};

// Update payment status
Payment.updateStatus = (id, status, result) => {
  const validStatuses = ['pending', 'completed', 'failed', 'cancelled'];
  if (!validStatuses.includes(status)) {
    result({ message: "Invalid payment status" }, null);
    return;
  }

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
        result({ kind: "not_found" }, null);
        return;
      }

      console.log("updated payment status: ", { id: id, status: status });
      result(null, { id: id, status: status });
    }
  );
};

// Refund payment
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
      result({ message: "Can only refund completed payments" }, null);
      return;
    }

    if (refundAmount > payment.amount) {
      result({ message: "Refund amount cannot exceed original payment amount" }, null);
      return;
    }

    // Create refund record
    const refund = {
      original_payment_id: paymentId,
      customer_id: payment.customer_id,
      amount: -Math.abs(refundAmount), // Negative amount for refund
      currency: payment.currency,
      payment_method: payment.payment_method,
      status: 'completed',
      created_at: new Date()
    };

    sql.query("INSERT INTO payments SET ?", refund, (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(err, null);
        return;
      }

      console.log("created refund: ", { id: res.insertId, ...refund });
      result(null, { id: res.insertId, ...refund });
    });
  });
};

module.exports = Payment;