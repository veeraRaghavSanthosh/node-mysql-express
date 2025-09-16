const sql = require("./db.js");

// constructor
const Order = function(order) {
  this.customer_id = order.customer_id;
  this.product_name = order.product_name;
  this.quantity = order.quantity;
  this.unit_price = order.unit_price;
  this.total_amount = order.total_amount;
  this.status = order.status || 'pending';
  this.order_date = order.order_date || new Date();
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

Order.getAll = result => {
  sql.query("SELECT * FROM orders", (err, res) => {
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
    "UPDATE orders SET customer_id = ?, product_name = ?, quantity = ?, unit_price = ?, total_amount = ?, status = ? WHERE id = ?",
    [order.customer_id, order.product_name, order.quantity, order.unit_price, order.total_amount, order.status, id],
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