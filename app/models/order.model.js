const sql = require("./db.js");

// Order constructor
const Order = function(order) {
  this.customer_id = order.customer_id;
  this.total_amount = order.total_amount;
  this.status = order.status || 'pending';
  this.legacy_id = order.legacy_id; // Optional - will be auto-generated if not provided
};

Order.create = (newOrder, result) => {
  sql.query("INSERT INTO orders SET ?", newOrder, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    console.log("created order: ", { id: res.insertId, ...newOrder });
    result(null, { id: res.insertId, ...newOrder });
  });
};

Order.findById = (orderId, result) => {
  sql.query(`SELECT * FROM orders WHERE id = ${orderId}`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    if (res.length) {
      console.log("found order: ", res[0]);
      result(null, res[0]);
      return;
    }

    // not found Order with the id
    result({ kind: "not_found" }, null);
  });
};

Order.findByLegacyId = (legacyId, result) => {
  sql.query("SELECT * FROM orders WHERE legacy_id = ?", [legacyId], (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    if (res.length) {
      console.log("found order by legacy_id: ", res[0]);
      result(null, res[0]);
      return;
    }

    // not found Order with the legacy_id
    result({ kind: "not_found" }, null);
  });
};

Order.findByCustomerId = (customerId, result) => {
  sql.query("SELECT * FROM orders WHERE customer_id = ?", [customerId], (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    console.log("orders for customer: ", res);
    result(null, res);
  });
};

Order.getAll = result => {
  sql.query("SELECT * FROM orders ORDER BY order_date DESC", (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    console.log("orders: ", res);
    result(null, res);
  });
};

Order.updateById = (id, order, result) => {
  sql.query(
    "UPDATE orders SET customer_id = ?, total_amount = ?, status = ?, legacy_id = ? WHERE id = ?",
    [order.customer_id, order.total_amount, order.status, order.legacy_id, id],
    (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }

      if (res.affectedRows == 0) {
        // not found Order with the id
        result({ kind: "not_found" }, null);
        return;
      }

      console.log("updated order: ", { id: id, ...order });
      result(null, { id: id, ...order });
    }
  );
};

Order.updateByLegacyId = (legacyId, order, result) => {
  sql.query(
    "UPDATE orders SET customer_id = ?, total_amount = ?, status = ? WHERE legacy_id = ?",
    [order.customer_id, order.total_amount, order.status, legacyId],
    (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }

      if (res.affectedRows == 0) {
        // not found Order with the legacy_id
        result({ kind: "not_found" }, null);
        return;
      }

      console.log("updated order by legacy_id: ", { legacy_id: legacyId, ...order });
      result(null, { legacy_id: legacyId, ...order });
    }
  );
};

Order.remove = (id, result) => {
  sql.query("DELETE FROM orders WHERE id = ?", id, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    if (res.affectedRows == 0) {
      // not found Order with the id
      result({ kind: "not_found" }, null);
      return;
    }

    console.log("deleted order with id: ", id);
    result(null, res);
  });
};

Order.removeByLegacyId = (legacyId, result) => {
  sql.query("DELETE FROM orders WHERE legacy_id = ?", [legacyId], (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    if (res.affectedRows == 0) {
      // not found Order with the legacy_id
      result({ kind: "not_found" }, null);
      return;
    }

    console.log("deleted order with legacy_id: ", legacyId);
    result(null, res);
  });
};

Order.removeAll = result => {
  sql.query("DELETE FROM orders", (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    console.log(`deleted ${res.affectedRows} orders`);
    result(null, res);
  });
};

module.exports = Order;