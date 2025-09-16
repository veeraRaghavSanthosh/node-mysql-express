// Test configuration file for notification API tests

const mysql = require('mysql2');

// Test database configuration
const testDbConfig = {
  host: process.env.TEST_DB_HOST || 'localhost',
  user: process.env.TEST_DB_USER || 'root',
  password: process.env.TEST_DB_PASSWORD || 'password',
  database: process.env.TEST_DB_NAME || 'testdb',
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
};

// Setup test database connection
const setupTestDb = () => {
  const connection = mysql.createConnection(testDbConfig);
  
  // Create test notifications table
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS notifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      type ENUM('info', 'warning', 'error', 'success') DEFAULT 'info',
      is_read BOOLEAN DEFAULT FALSE,
      user_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_user_id (user_id),
      INDEX idx_created_at (created_at)
    );
  `;
  
  return new Promise((resolve, reject) => {
    connection.execute(createTableQuery, (err) => {
      if (err) {
        console.error('Error creating test table:', err);
        reject(err);
      } else {
        console.log('Test table created successfully');
        resolve();
      }
      connection.end();
    });
  });
};

// Clean up test data
const cleanupTestDb = () => {
  const connection = mysql.createConnection(testDbConfig);
  
  return new Promise((resolve, reject) => {
    connection.execute('DELETE FROM notifications WHERE title LIKE "Test%" OR title LIKE "Concurrent%"', (err) => {
      if (err) {
        console.error('Error cleaning up test data:', err);
        reject(err);
      } else {
        console.log('Test data cleaned up successfully');
        resolve();
      }
      connection.end();
    });
  });
};

module.exports = {
  testDbConfig,
  setupTestDb,
  cleanupTestDb
};
