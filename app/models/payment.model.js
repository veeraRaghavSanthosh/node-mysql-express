const sql = require("./db.js");

const Payment = function(payment) {
  this.customer_id = payment.customer_id;
  this.amount = payment.amount;
  this.currency = payment.currency;
  this.payment_method = payment.payment_method;
  this.status = payment.status || 'pending';
  this.description = payment.description;
};

Payment.create = (newPayment, result) => {
  if (!newPayment.customer_id || !newPayment.amount || !newPayment.currency) {
    result({ message: "Missing required fields" }, null);
    return;
  }
  if (newPayment.amount <= 0) {
    result({ message: "Amount must be greater than 0" }, null);
    return;
  }
  sql.query("INSERT INTO payments SET ?", newPayment, (err, res) => {
    if (err) {
      result(err, null);
      return;
    }
    result(null, { id: res.insertId, ...newPayment });
  });
};

Payment.findById = (paymentId, result) => {
  sql.query("SELECT * FROM payments WHERE id = ?", [paymentId], (err, res) => {
    if (err) {
      result(err, null);
      return;
    }
    if (res.length) {
      result(null, res[0]);
      return;
    }
    result({ kind: "not_found" }, null);
  });
};

Payment.processPayment = (paymentId, result) => {
  Payment.findById(paymentId, (err, payment) => {
    if (err) {
      result(err, null);
      return;
    }
    if (payment.status !== 'pending') {
      result({ message: "Payment must be pending to process" }, null);
      return;
    }
    const isSuccess = Math.random() > 0.1;
    const newStatus = isSuccess ? 'completed' : 'failed';
    sql.query("UPDATE payments SET status = ? WHERE id = ?", [newStatus, paymentId], (err) => {
      if (err) {
        result(err, null);
        return;
      }
      result(null, { id: paymentId, status: newStatus, success: isSuccess });
    });
  });
};

module.exports = Payment;
