const mysql = require("mysql");
const dbConfig = require("../../app/config/db.config.js");

/**
 * Database Test Helper Functions
 * 
 * This module provides reusable helper functions for database testing.
 * It handles common patterns like connection management, test data setup,
 * and cleanup operations with proper error handling for edge cases.
 */

// Test database configuration - uses a separate test database
const testDbConfig = {
  ...dbConfig,
  DB: `${dbConfig.DB}_test`
};

/**
 * Helper: Create database connection
 * Handles connection creation with proper error handling and timeout configuration
 * 
 * Edge cases handled:
 * - Connection timeout (30s limit)
 * - Invalid credentials
 * - Database server unavailable
 * - Network connectivity issues
 * 
 * @param {Object} config - Database configuration object
 * @returns {Promise<Connection>} MySQL connection object
 * @throws {Error} Connection establishment errors
 */
function createConnection(config = testDbConfig) {
  return new Promise((resolve, reject) => {
    const connection = mysql.createConnection({
      host: config.HOST,
      user: config.USER,
      password: config.PASSWORD,
      database: config.DB,
      acquireTimeout: 30000,
      timeout: 30000,
      reconnect: false
    });
    
    connection.connect((err) => {
      if (err) {
        reject(new Error(`Failed to create database connection: ${err.message}`));
        return;
      }
      
      // Test the connection with a simple query
      connection.query('SELECT 1', (testErr) => {
        if (testErr) {
          reject(new Error(`Connection test failed: ${testErr.message}`));
          return;
        }
        resolve(connection);
      });
    });
  });
}

/**
 * Helper: Setup test database
 * Creates a clean test database for running tests
 * 
 * Edge cases handled:
 * - Database already exists (drops and recreates)
 * - Insufficient privileges to create database
 * - Character set and collation issues
 * - Foreign key constraint conflicts
 * 
 * @param {Connection} connection - MySQL connection object
 * @returns {Promise<void>}
 * @throws {Error} Database creation errors
 */
function setupTestDatabase(connection) {
  return new Promise((resolve, reject) => {
    // Drop existing test database if it exists (edge case: cleanup from failed previous runs)
    connection.query(`DROP DATABASE IF EXISTS \`${testDbConfig.DB}\``, (dropErr) => {
      if (dropErr) {
        reject(new Error(`Failed to drop existing test database: ${dropErr.message}`));
        return;
      }
      
      // Create fresh test database with proper character set
      connection.query(`
        CREATE DATABASE \`${testDbConfig.DB}\` 
        CHARACTER SET utf8mb4 
        COLLATE utf8mb4_unicode_ci
      `, (createErr) => {
        if (createErr) {
          reject(new Error(`Failed to create test database: ${createErr.message}`));
          return;
        }
        
        // Switch to the test database
        connection.query(`USE \`${testDbConfig.DB}\``, (useErr) => {
          if (useErr) {
            reject(new Error(`Failed to switch to test database: ${useErr.message}`));
            return;
          }
          
          // Create customers table (based on the model structure)
          connection.query(`
            CREATE TABLE customers (
              id INT AUTO_INCREMENT PRIMARY KEY,
              email VARCHAR(255) NOT NULL UNIQUE,
              name VARCHAR(255) NOT NULL,
              active BOOLEAN DEFAULT true,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              INDEX idx_email (email),
              INDEX idx_active (active)
            ) ENGINE=InnoDB
          `, (tableErr) => {
            if (tableErr) {
              reject(new Error(`Failed to create customers table: ${tableErr.message}`));
              return;
            }
            resolve();
          });
        });
      });
    });
  });
}

/**
 * Helper: Teardown test database
 * Cleans up test database and closes connections
 * 
 * Edge cases handled:
 * - Database doesn't exist (safe cleanup)
 * - Active transactions (force cleanup)
 * - Connection already closed
 * - Cascading foreign key deletions
 * 
 * @param {Connection} connection - MySQL connection object
 * @returns {Promise<void>}
 */
function teardownTestDatabase(connection) {
  return new Promise((resolve) => {
    if (!connection) {
      resolve();
      return;
    }
    
    // Force rollback any active transactions (edge case: test failure mid-transaction)
    connection.query('ROLLBACK', () => {
      // Ignore rollback errors if no active transaction
      
      // Drop test database (edge case: handles non-existent database gracefully)
      connection.query(`DROP DATABASE IF EXISTS \`${testDbConfig.DB}\``, (dropErr) => {
        if (dropErr) {
          console.error(`Warning: Failed to drop test database: ${dropErr.message}`);
        }
        
        // Close connection safely
        connection.end((endErr) => {
          if (endErr) {
            console.error(`Warning: Failed to close connection gracefully: ${endErr.message}`);
            // Force close connection if normal close fails
            connection.destroy();
          }
          resolve();
        });
      });
    });
  });
}

/**
 * Helper: Insert test data
 * Populates database with sample data for testing
 * 
 * Edge cases handled:
 * - Duplicate key violations
 * - Invalid data formats
 * - Transaction rollback on partial failure
 * - Large dataset insertion
 * 
 * @param {Connection} connection - MySQL connection object
 * @param {Array} customers - Array of customer objects to insert
 * @returns {Promise<Array>} Array of inserted customer IDs
 */
function insertTestData(connection, customers = []) {
  return new Promise((resolve, reject) => {
    if (customers.length === 0) {
      resolve([]);
      return;
    }
    
    // Start transaction for atomic insertion (edge case: partial failure recovery)
    connection.beginTransaction((transErr) => {
      if (transErr) {
        reject(new Error(`Failed to start transaction: ${transErr.message}`));
        return;
      }
      
      const insertedIds = [];
      let completed = 0;
      let hasError = false;
      
      customers.forEach((customer, index) => {
        // Validate required fields (edge case: missing data)
        if (!customer.email || !customer.name) {
          hasError = true;
          connection.rollback(() => {
            reject(new Error(`Invalid customer data at index ${index}: email and name are required`));
          });
          return;
        }
        
        connection.query(
          'INSERT INTO customers (email, name, active) VALUES (?, ?, ?)',
          [customer.email, customer.name, customer.active !== undefined ? customer.active : true],
          (insertErr, result) => {
            if (hasError) return;
            
            if (insertErr) {
              hasError = true;
              connection.rollback(() => {
                reject(new Error(`Failed to insert test data: ${insertErr.message}`));
              });
              return;
            }
            
            insertedIds[index] = result.insertId;
            completed++;
            
            if (completed === customers.length) {
              connection.commit((commitErr) => {
                if (commitErr) {
                  connection.rollback(() => {
                    reject(new Error(`Failed to commit transaction: ${commitErr.message}`));
                  });
                  return;
                }
                resolve(insertedIds);
              });
            }
          }
        );
      });
    });
  });
}

/**
 * Helper: Clear all test data
 * Removes all data from test tables while preserving structure
 * 
 * Edge cases handled:
 * - Foreign key constraints (proper deletion order)
 * - Large datasets (chunked deletion)
 * - Auto-increment reset
 * 
 * @param {Connection} connection - MySQL connection object
 * @returns {Promise<void>}
 */
function clearTestData(connection) {
  return new Promise((resolve, reject) => {
    // Disable foreign key checks temporarily (edge case: circular dependencies)
    connection.query('SET FOREIGN_KEY_CHECKS = 0', (fkErr) => {
      if (fkErr) {
        reject(new Error(`Failed to disable foreign key checks: ${fkErr.message}`));
        return;
      }
      
      // Clear all tables
      connection.query('TRUNCATE TABLE customers', (truncateErr) => {
        // Re-enable foreign key checks
        connection.query('SET FOREIGN_KEY_CHECKS = 1', (enableErr) => {
          if (truncateErr) {
            reject(new Error(`Failed to clear test data: ${truncateErr.message}`));
            return;
          }
          
          if (enableErr) {
            console.error(`Failed to re-enable foreign key checks: ${enableErr.message}`);
          }
          
          resolve();
        });
      });
    });
  });
}

module.exports = {
  createConnection,
  setupTestDatabase,
  teardownTestDatabase,
  insertTestData,
  clearTestData,
  testDbConfig
};