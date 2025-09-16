const sql = require("./db.js");

/**
 * Order Model
 * 
 * This model demonstrates backward compatibility with the new legacy_id column.
 * The legacy_id field is optional and the model works with or without it.
 */

// Constructor
const Order = function(order) {
  this.customer_id = order.customer_id;
  this.total_amount = order.total_amount;
  this.status = order.status || 'pending';
  
  // Legacy ID is optional for backward compatibility
  if (order.legacy_id) {
    this.legacy_id = order.legacy_id;
  }
};

// Create new order
Order.create = (newOrder, result) => {
  // Generate legacy_id if not provided (for new orders)
  if (!newOrder.legacy_id) {
    // You can implement your own legacy_id generation logic here
    // For example, using timestamp + random string
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    newOrder.legacy_id = `ORD_${timestamp}_${randomSuffix}`;
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

// Find order by ID (supports both regular ID and legacy_id for backward compatibility)
Order.findById = (orderId, result) => {
  // Check if the provided ID looks like a legacy_id (contains non-numeric characters)
  const isLegacyId = isNaN(orderId) || orderId.toString().includes('_') || orderId.toString().includes('-');
  
  const query = isLegacyId 
    ? "SELECT * FROM orders WHERE legacy_id = ?"
    : "SELECT * FROM orders WHERE id = ?";

  sql.query(query, [orderId], (err, res) => {
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

    // Not found Order with the id
    result({ kind: "not_found" }, null);
  });
};

// Find order by legacy_id specifically
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

    result({ kind: "not_found" }, null);
  });
};

// Get all orders
Order.getAll = (result) => {
  sql.query("SELECT * FROM orders ORDER BY created_at DESC", (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    console.log("orders: ", res);
    result(null, res);
  });
};

// Get orders by customer ID
Order.getByCustomerId = (customerId, result) => {
  sql.query("SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC", [customerId], (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    console.log("customer orders: ", res);
    result(null, res);
  });
};

// Update order by ID (supports both regular ID and legacy_id)
Order.updateById = (orderId, order, result) => {
  const isLegacyId = isNaN(orderId) || orderId.toString().includes('_') || orderId.toString().includes('-');
  
  const whereClause = isLegacyId ? "legacy_id = ?" : "id = ?";
  
  sql.query(
    `UPDATE orders SET customer_id = ?, total_amount = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE ${whereClause}`,
    [order.customer_id, order.total_amount, order.status, orderId],
    (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }

      if (res.affectedRows == 0) {
        // Not found Order with the id
        result({ kind: "not_found" }, null);
        return;
      }

      console.log("updated order: ", { id: orderId, ...order });
      result(null, { id: orderId, ...order });
    }
  );
};

// Delete order by ID (supports both regular ID and legacy_id)
Order.remove = (orderId, result) => {
  const isLegacyId = isNaN(orderId) || orderId.toString().includes('_') || orderId.toString().includes('-');
  
  const query = isLegacyId 
    ? "DELETE FROM orders WHERE legacy_id = ?"
    : "DELETE FROM orders WHERE id = ?";

  sql.query(query, [orderId], (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    if (res.affectedRows == 0) {
      // Not found Order with the id
      result({ kind: "not_found" }, null);
      return;
    }

    console.log("deleted order with id: ", orderId);
    result(null, res);
  });
};

// Remove all orders (be careful with this!)
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