const db = require('../config/database');

class Order {
  constructor(orderData) {
    this.customer_name = orderData.customer_name;
    this.product_name = orderData.product_name;
    this.quantity = orderData.quantity;
    this.price = orderData.price;
    this.total_amount = orderData.quantity * orderData.price;
    this.order_status = orderData.order_status || 'pending';
    this.customer_email = orderData.customer_email;
    this.shipping_address = orderData.shipping_address;
  }

  // Create a new order in the database
  static create(orderData) {
    return new Promise((resolve, reject) => {
      const order = new Order(orderData);
      
      const query = \`
        INSERT INTO orders (
          customer_name, 
          customer_email, 
          product_name, 
          quantity, 
          price, 
          total_amount, 
          order_status, 
          shipping_address,
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
      \`;
      
      const values = [
        order.customer_name,
        order.customer_email,
        order.product_name,
        order.quantity,
        order.price,
        order.total_amount,
        order.order_status,
        order.shipping_address
      ];

      db.query(query, values, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve({
            id: results.insertId,
            ...order,
            created_at: new Date()
          });
        }
      });
    });
  }

  // Find order by ID
  static findById(id) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM orders WHERE id = ?';
      
      db.query(query, [id], (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results[0] || null);
        }
      });
    });
  }

  // Get all orders
  static findAll() {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM orders ORDER BY created_at DESC';
      
      db.query(query, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
  }
}

module.exports = Order;
