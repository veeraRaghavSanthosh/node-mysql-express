const sql = require("./db.js");

// constructor
const Payment = function(payment) {
  this.customer_id = payment.customer_id;
  this.amount = payment.amount;
  this.currency = payment.currency;
  this.payment_method = payment.payment_method;
  this.status = payment.status;
  this.transaction_id = payment.transaction_id;
  this.description = payment.description;
  this.metadata = payment.metadata;
  this.created_at = payment.created_at;
  this.updated_at = payment.updated_at;
};

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

Payment.findByCustomerId = (customerId, result) => {
  sql.query(`SELECT * FROM payments WHERE customer_id = ${customerId}`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    console.log("payments for customer: ", res);
    result(null, res);
  });
};

Payment.getAll = (result) => {
  let query = "SELECT * FROM payments";
  const queryParams = [];

  sql.query(query, queryParams, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    console.log("payments: ", res);
    result(null, res);
  });
};

Payment.getAllWithFilters = (filters, result) => {
  let query = "SELECT * FROM payments WHERE 1=1";
  const queryParams = [];

  if (filters.customer_id) {
    query += " AND customer_id = ?";
    queryParams.push(filters.customer_id);
  }

  if (filters.status) {
    query += " AND status = ?";
    queryParams.push(filters.status);
  }

  if (filters.payment_method) {
    query += " AND payment_method = ?";
    queryParams.push(filters.payment_method);
  }

  query += " ORDER BY created_at DESC";

  if (filters.limit) {
    query += " LIMIT ?";
    queryParams.push(parseInt(filters.limit));
  }

  sql.query(query, queryParams, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    console.log("filtered payments: ", res);
    result(null, res);
  });
};

Payment.updateById = (id, payment, result) => {
  sql.query(
    "UPDATE payments SET customer_id = ?, amount = ?, currency = ?, payment_method = ?, status = ?, transaction_id = ?, description = ?, metadata = ?, updated_at = NOW() WHERE id = ?",
    [payment.customer_id, payment.amount, payment.currency, payment.payment_method, payment.status, payment.transaction_id, payment.description, payment.metadata, id],
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

      console.log("updated payment: ", { id: id, ...payment });
      result(null, { id: id, ...payment });
    }
  );
};

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
        // not found Payment with the id
        result({ kind: "not_found" }, null);
        return;
      }

      console.log("updated payment status: ", { id: id, status: status });
      result(null, { id: id, status: status });
    }
  );
};

Payment.remove = (id, result) => {
  sql.query("DELETE FROM payments WHERE id = ?", id, (err, res) => {
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

    console.log("deleted payment with id: ", id);
    result(null, res);
  });
};

Payment.removeAll = result => {
  sql.query("DELETE FROM payments", (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    console.log(`deleted ${res.affectedRows} payments`);
    result(null, res);
  });
};

module.exports = Payment;