const mysql = require("mysql");
const dbConfig = require("../app/config/db.config.js");

const connection = mysql.createConnection({
  host: dbConfig.HOST,
  user: dbConfig.USER,
  password: dbConfig.PASSWORD,
  database: dbConfig.DB
});

const up = () => {
  return new Promise((resolve, reject) => {
    const createOrdersTable = `
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_id INT,
        order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        total_amount DECIMAL(10, 2),
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_customer_id (customer_id),
        INDEX idx_order_date (order_date),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;

    connection.query(createOrdersTable, (err, result) => {
      if (err) {
        console.error('Error creating orders table:', err);
        reject(err);
      } else {
        console.log('Orders table created successfully');
        resolve(result);
      }
    });
  });
};

const down = () => {
  return new Promise((resolve, reject) => {
    const dropOrdersTable = `DROP TABLE IF EXISTS orders`;

    connection.query(dropOrdersTable, (err, result) => {
      if (err) {
        console.error('Error dropping orders table:', err);
        reject(err);
      } else {
        console.log('Orders table dropped successfully');
        resolve(result);
      }
    });
  });
};

module.exports = { up, down };