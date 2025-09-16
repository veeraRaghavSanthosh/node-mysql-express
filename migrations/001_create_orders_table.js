// Migration: Create orders table
// This migration creates the initial orders table structure

module.exports = {
  up: (connection, callback) => {
    const createOrdersTableQuery = `
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_id INT,
        order_number VARCHAR(50) NOT NULL UNIQUE,
        total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
        order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_customer_id (customer_id),
        INDEX idx_order_number (order_number),
        INDEX idx_status (status),
        INDEX idx_order_date (order_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;

    connection.query(createOrdersTableQuery, (err, results) => {
      if (err) {
        console.error('Error creating orders table:', err);
        callback(err);
      } else {
        console.log('Orders table created successfully');
        callback(null, results);
      }
    });
  },

  down: (connection, callback) => {
    const dropOrdersTableQuery = 'DROP TABLE IF EXISTS orders';
    
    connection.query(dropOrdersTableQuery, (err, results) => {
      if (err) {
        console.error('Error dropping orders table:', err);
        callback(err);
      } else {
        console.log('Orders table dropped successfully');
        callback(null, results);
      }
    });
  }
};