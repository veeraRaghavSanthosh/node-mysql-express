const mysql = require("mysql");
const dbConfig = require("../config/db.config.js");

// Check if we're in test mode or if database is not accessible
const isTestMode = process.env.NODE_ENV === 'test' || process.env.USE_MOCK_DB === 'true';

let connection;

if (isTestMode) {
  // Use mock database for testing
  connection = require('./db.mock.js');
  console.log('Using mock database for testing/development');
} else {
  try {
    // Try to create real database connection
    connection = mysql.createPool({
      host: dbConfig.HOST,
      user: dbConfig.USER,
      password: dbConfig.PASSWORD,
      database: dbConfig.DB,
      acquireTimeout: 5000,
      timeout: 5000
    });

    // Test the connection
    connection.query('SELECT 1', (err) => {
      if (err) {
        console.log('Database connection failed, falling back to mock database');
        connection = require('./db.mock.js');
      } else {
        console.log('Connected to MySQL database');
      }
    });
  } catch (error) {
    console.log('Database setup failed, using mock database');
    connection = require('./db.mock.js');
  }
}

module.exports = connection;
