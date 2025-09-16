const sql = require("./db.js");

// Constructor
const Order = function(order) {
  this.customer_id = order.customer_id;
  this.order_date = order.order_date;
  this.total_amount = order.total_amount;
  this.status = order.status;
  this.shipping_address = order.shipping_address;
  this.billing_address = order.billing_address;
  this.items = order.items; // JSON array of order items
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

Order.findById = (id, result) => {
  sql.query(`SELECT * FROM orders WHERE id = ${id}`, (err, res) => {
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

Order.getAll = (title, result) => {
  let query = "SELECT * FROM orders";

  if (title) {
    query += ` WHERE title LIKE '%${title}%'`;
  }

  sql.query(query, (err, res) => {
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
    "UPDATE orders SET customer_id = ?, order_date = ?, total_amount = ?, status = ?, shipping_address = ?, billing_address = ?, items = ? WHERE id = ?",
    [order.customer_id, order.order_date, order.total_amount, order.status, order.shipping_address, order.billing_address, JSON.stringify(order.items), id],
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