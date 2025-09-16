const sql = require("./db.js");

// constructor
const Order = function(order) {
  this.customer_id = order.customer_id;
  this.total_amount = order.total_amount;
  this.status = order.status || 'pending';
  this.order_date = order.order_date || new Date();
  this.items = order.items;
};

Order.create = (newOrder, result) => {
  // Start transaction
  sql.getConnection((err, connection) => {
    if (err) {
      console.log("connection error: ", err);
      result(err, null);
      return;
    }

    connection.beginTransaction((err) => {
      if (err) {
        console.log("transaction error: ", err);
        connection.release();
        result(err, null);
        return;
      }

      // Insert order
      const orderData = {
        customer_id: newOrder.customer_id,
        total_amount: newOrder.total_amount,
        status: newOrder.status,
        order_date: newOrder.order_date
      };

      connection.query("INSERT INTO orders SET ?", orderData, (err, res) => {
        if (err) {
          console.log("error inserting order: ", err);
          connection.rollback(() => {
            connection.release();
            result(err, null);
          });
          return;
        }

        const orderId = res.insertId;

        // Insert order items if provided
        if (newOrder.items && newOrder.items.length > 0) {
          const itemsData = newOrder.items.map(item => [
            orderId,
            item.product_name,
            item.quantity,
            item.price
          ]);

          connection.query(
            "INSERT INTO order_items (order_id, product_name, quantity, price) VALUES ?",
            [itemsData],
            (err, res) => {
              if (err) {
                console.log("error inserting order items: ", err);
                connection.rollback(() => {
                  connection.release();
                  result(err, null);
                });
                return;
              }

              connection.commit((err) => {
                if (err) {
                  console.log("commit error: ", err);
                  connection.rollback(() => {
                    connection.release();
                    result(err, null);
                  });
                  return;
                }

                connection.release();
                console.log("created order: ", { id: orderId, ...orderData, items: newOrder.items });
                result(null, { id: orderId, ...orderData, items: newOrder.items });
              });
            }
          );
        } else {
          connection.commit((err) => {
            if (err) {
              console.log("commit error: ", err);
              connection.rollback(() => {
                connection.release();
                result(err, null);
              });
              return;
            }

            connection.release();
            console.log("created order: ", { id: orderId, ...orderData });
            result(null, { id: orderId, ...orderData });
          });
        }
      });
    });
  });
};

Order.findById = (orderId, result) => {
  sql.query(
    `SELECT o.*, 
     JSON_ARRAYAGG(
       JSON_OBJECT(
         'id', oi.id,
         'product_name', oi.product_name,
         'quantity', oi.quantity,
         'price', oi.price
       )
     ) as items
     FROM orders o
     LEFT JOIN order_items oi ON o.id = oi.order_id
     WHERE o.id = ?
     GROUP BY o.id`,
    [orderId],
    (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(err, null);
        return;
      }

      if (res.length) {
        const order = res[0];
        // Parse items JSON if it exists
        if (order.items && order.items !== '[null]') {
          order.items = JSON.parse(order.items);
        } else {
          order.items = [];
        }
        console.log("found order: ", order);
        result(null, order);
        return;
      }

      // not found Order with the id
      result({ kind: "not_found" }, null);
    }
  );
};

Order.getAll = result => {
  sql.query(
    `SELECT o.*, 
     JSON_ARRAYAGG(
       JSON_OBJECT(
         'id', oi.id,
         'product_name', oi.product_name,
         'quantity', oi.quantity,
         'price', oi.price
       )
     ) as items
     FROM orders o
     LEFT JOIN order_items oi ON o.id = oi.order_id
     GROUP BY o.id
     ORDER BY o.order_date DESC`,
    (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }

      // Parse items JSON for each order
      const orders = res.map(order => {
        if (order.items && order.items !== '[null]') {
          order.items = JSON.parse(order.items);
        } else {
          order.items = [];
        }
        return order;
      });

      console.log("orders: ", orders);
      result(null, orders);
    }
  );
};

Order.updateById = (id, order, result) => {
  sql.query(
    "UPDATE orders SET customer_id = ?, total_amount = ?, status = ? WHERE id = ?",
    [order.customer_id, order.total_amount, order.status, id],
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
  sql.getConnection((err, connection) => {
    if (err) {
      console.log("connection error: ", err);
      result(err, null);
      return;
    }

    connection.beginTransaction((err) => {
      if (err) {
        console.log("transaction error: ", err);
        connection.release();
        result(err, null);
        return;
      }

      // Delete order items first
      connection.query("DELETE FROM order_items WHERE order_id = ?", id, (err, res) => {
        if (err) {
          console.log("error deleting order items: ", err);
          connection.rollback(() => {
            connection.release();
            result(err, null);
          });
          return;
        }

        // Delete order
        connection.query("DELETE FROM orders WHERE id = ?", id, (err, res) => {
          if (err) {
            console.log("error deleting order: ", err);
            connection.rollback(() => {
              connection.release();
              result(err, null);
            });
            return;
          }

          if (res.affectedRows == 0) {
            connection.rollback(() => {
              connection.release();
              result({ kind: "not_found" }, null);
            });
            return;
          }

          connection.commit((err) => {
            if (err) {
              console.log("commit error: ", err);
              connection.rollback(() => {
                connection.release();
                result(err, null);
              });
              return;
            }

            connection.release();
            console.log("deleted order with id: ", id);
            result(null, res);
          });
        });
      });
    });
  });
};

module.exports = Order;