const sql = require("./db.js");

// Order constructor
const Order = function(order) {
  this.customer_id = order.customer_id;
  this.order_number = order.order_number;
  this.total_amount = order.total_amount;
  this.status = order.status || 'pending';
  this.legacy_id = order.legacy_id; // Support for legacy_id
};

// Create and save a new Order
Order.create = (newOrder, result) => {
  // Generate legacy_id if not provided (for backward compatibility)
  if (!newOrder.legacy_id && newOrder.order_number) {
    newOrder.legacy_id = `LEGACY_${newOrder.order_number}_${Date.now()}`;
  }

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

// Find Order by ID
Order.findById = (orderId, result) => {
  sql.query(`SELECT * FROM orders WHERE id = ?`, [orderId], (err, res) => {
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

// Find Order by legacy_id (for backward compatibility)
Order.findByLegacyId = (legacyId, result) => {
  sql.query(`SELECT * FROM orders WHERE legacy_id = ?`, [legacyId], (err, res) => {
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

// Find Order by order number
Order.findByOrderNumber = (orderNumber, result) => {
  sql.query(`SELECT * FROM orders WHERE order_number = ?`, [orderNumber], (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    if (res.length) {
      console.log("found order by order number: ", res[0]);
      result(null, res[0]);
      return;
    }

    // not found Order with the order number
    result({ kind: "not_found" }, null);
  });
};

// Get all Orders
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

// Get Orders by customer ID
Order.getByCustomerId = (customerId, result) => {
  sql.query("SELECT * FROM orders WHERE customer_id = ? ORDER BY order_date DESC", [customerId], (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    console.log(`orders for customer ${customerId}: `, res);
    result(null, res);
  });
};

// Update Order by ID
Order.updateById = (id, order, result) => {
  sql.query(
    "UPDATE orders SET customer_id = ?, order_number = ?, total_amount = ?, status = ?, legacy_id = ? WHERE id = ?",
    [order.customer_id, order.order_number, order.total_amount, order.status, order.legacy_id, id],
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

// Update Order status
Order.updateStatus = (id, status, result) => {
  sql.query(
    "UPDATE orders SET status = ? WHERE id = ?",
    [status, id],
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

      console.log("updated order status: ", { id: id, status: status });
      result(null, { id: id, status: status });
    }
  );
};

// Delete Order by ID
Order.remove = (id, result) => {
  sql.query("DELETE FROM orders WHERE id = ?", [id], (err, res) => {
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

// Delete all Orders
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