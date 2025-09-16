const sql = require("./db.js");

// Payment constructor
const Payment = function(payment) {
  this.customer_id = payment.customer_id;
  this.amount = payment.amount;
  this.currency = payment.currency;
  this.payment_method = payment.payment_method;
  this.description = payment.description;
  this.status = payment.status || 'pending';
  this.created_at = new Date();
  this.updated_at = new Date();
};

// Create a new payment
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

    // Payment not found
    result({ kind: "not_found" }, null);
  });
};

// Get all payments
Payment.getAll = result => {
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
  sql.query(`SELECT * FROM payments WHERE customer_id = ${customerId} ORDER BY created_at DESC`, (err, res) => {
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
  sql.query(
    "UPDATE payments SET status = ?, updated_at = NOW() WHERE id = ?",
    [status, id],
    (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }

      if (res.affectedRows == 0) {
        // Payment not found
        result({ kind: "not_found" }, null);
        return;
      }

      console.log("updated payment: ", { id: id, status: status });
      result(null, { id: id, status: status });
    }
  );
};

// Process refund
Payment.refund = (id, refundAmount, result) => {
  sql.query(
    "UPDATE payments SET status = 'refunded', refund_amount = ?, updated_at = NOW() WHERE id = ?",
    [refundAmount, id],
    (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }

      if (res.affectedRows == 0) {
        // Payment not found
        result({ kind: "not_found" }, null);
        return;
      }

      console.log("refunded payment: ", { id: id, refund_amount: refundAmount });
      result(null, { id: id, refund_amount: refundAmount, status: 'refunded' });
    }
  );
};

// Delete payment
Payment.remove = (id, result) => {
  sql.query("DELETE FROM payments WHERE id = ?", id, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    if (res.affectedRows == 0) {
      // Payment not found
      result({ kind: "not_found" }, null);
      return;
    }

    console.log("deleted payment with id: ", id);
    result(null, res);
  });
};

module.exports = Payment;