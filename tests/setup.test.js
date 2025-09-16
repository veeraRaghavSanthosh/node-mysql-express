const mysql = require("mysql");
const assert = require("assert");
const { promisify } = require("util");

// Mock database configuration for testing
const testDbConfig = {
  HOST: "localhost",
  USER: "test_user",
  PASSWORD: "test_password",
  DB: "test_database"
};

// Helper function to promisify MySQL connection methods
function createPromisifiedConnection(config) {
  const connection = mysql.createConnection(config);
  
  return {
    connect: promisify(connection.connect.bind(connection)),
    query: promisify(connection.query.bind(connection)),
    end: promisify(connection.end.bind(connection)),
    raw: connection // Keep raw connection for backward compatibility
  };
}

// ASYNC/AWAIT VERSIONS

// Test database connection using async/await
async function testDatabaseConnectionAsync() {
  const connection = createPromisifiedConnection({
    host: testDbConfig.HOST,
    user: testDbConfig.USER,
    password: testDbConfig.PASSWORD,
    database: testDbConfig.DB
  });

  try {
    await connection.connect();
    console.log('Database connected successfully');
    await connection.end();
    return 'Connection test passed';
  } catch (err) {
    console.error('Database connection failed:', err);
    throw err;
  }
}

// Test customer table creation using async/await
async function createCustomerTableAsync() {
  const connection = createPromisifiedConnection({
    host: testDbConfig.HOST,
    user: testDbConfig.USER,
    password: testDbConfig.PASSWORD,
    database: testDbConfig.DB
  });

  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS customers (
      id int(11) NOT NULL AUTO_INCREMENT,
      email varchar(255) NOT NULL,
      name varchar(255) NOT NULL,
      active BOOLEAN DEFAULT false,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
  `;

  try {
    await connection.connect();
    const results = await connection.query(createTableQuery);
    console.log('Customer table created successfully');
    await connection.end();
    return results;
  } catch (err) {
    console.error('Table creation error:', err);
    try {
      await connection.end();
    } catch (endErr) {
      console.error('Error closing connection:', endErr);
    }
    throw err;
  }
}

// Test customer CRUD operations using async/await
async function testCustomerOperationsAsync() {
  const connection = createPromisifiedConnection({
    host: testDbConfig.HOST,
    user: testDbConfig.USER,
    password: testDbConfig.PASSWORD,
    database: testDbConfig.DB
  });

  const testCustomer = {
    email: 'test@example.com',
    name: 'Test Customer',
    active: true
  };

  try {
    await connection.connect();

    // Insert test customer
    const insertQuery = 'INSERT INTO customers SET ?';
    const insertResults = await connection.query(insertQuery, testCustomer);
    const customerId = insertResults.insertId;
    console.log('Customer inserted with ID:', customerId);

    // Retrieve the customer
    const selectQuery = 'SELECT * FROM customers WHERE id = ?';
    const selectResults = await connection.query(selectQuery, [customerId]);
    
    if (selectResults.length === 0) {
      throw new Error('Customer not found');
    }

    const retrievedCustomer = selectResults[0];
    console.log('Customer retrieved:', retrievedCustomer);

    // Update the customer
    const updateQuery = 'UPDATE customers SET name = ? WHERE id = ?';
    const updatedName = 'Updated Test Customer';
    await connection.query(updateQuery, [updatedName, customerId]);
    console.log('Customer updated');

    // Delete the customer
    const deleteQuery = 'DELETE FROM customers WHERE id = ?';
    await connection.query(deleteQuery, [customerId]);
    console.log('Customer deleted');

    await connection.end();
    return 'CRUD operations completed successfully';
  } catch (err) {
    try {
      await connection.end();
    } catch (endErr) {
      console.error('Error closing connection:', endErr);
    }
    throw err;
  }
}

// Test database cleanup using async/await
async function cleanupDatabaseAsync() {
  const connection = createPromisifiedConnection({
    host: testDbConfig.HOST,
    user: testDbConfig.USER,
    password: testDbConfig.PASSWORD,
    database: testDbConfig.DB
  });

  try {
    await connection.connect();
    const dropTableQuery = 'DROP TABLE IF EXISTS customers';
    const results = await connection.query(dropTableQuery);
    console.log('Customer table dropped');
    await connection.end();
    return 'Database cleanup completed';
  } catch (err) {
    try {
      await connection.end();
    } catch (endErr) {
      console.error('Error closing connection:', endErr);
    }
    throw err;
  }
}

// Main test runner using async/await
async function runTestsAsync() {
  console.log('Starting database setup tests (async/await)...');

  try {
    const connectionResult = await testDatabaseConnectionAsync();
    console.log('✓ Database connection test:', connectionResult);

    await createCustomerTableAsync();
    console.log('✓ Table creation test passed');

    const crudResult = await testCustomerOperationsAsync();
    console.log('✓ CRUD operations test:', crudResult);

    const cleanupResult = await cleanupDatabaseAsync();
    console.log('✓ Database cleanup:', cleanupResult);
    
    console.log('All async/await tests completed successfully!');
  } catch (err) {
    console.error('Test failed:', err);
    throw err;
  }
}

// CALLBACK VERSIONS (for backward compatibility)

// Test database connection using callbacks
function testDatabaseConnection(callback) {
  const connection = mysql.createConnection({
    host: testDbConfig.HOST,
    user: testDbConfig.USER,
    password: testDbConfig.PASSWORD,
    database: testDbConfig.DB
  });

  connection.connect((err) => {
    if (err) {
      console.error('Database connection failed:', err);
      return callback(err);
    }
    
    console.log('Database connected successfully');
    connection.end((endErr) => {
      if (endErr) {
        console.error('Error closing connection:', endErr);
        return callback(endErr);
      }
      callback(null, 'Connection test passed');
    });
  });
}

// Test customer table creation using callbacks
function createCustomerTable(callback) {
  const connection = mysql.createConnection({
    host: testDbConfig.HOST,
    user: testDbConfig.USER,
    password: testDbConfig.PASSWORD,
    database: testDbConfig.DB
  });

  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS customers (
      id int(11) NOT NULL AUTO_INCREMENT,
      email varchar(255) NOT NULL,
      name varchar(255) NOT NULL,
      active BOOLEAN DEFAULT false,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
  `;

  connection.connect((connectErr) => {
    if (connectErr) {
      console.error('Connection error:', connectErr);
      return callback(connectErr);
    }

    connection.query(createTableQuery, (queryErr, results) => {
      if (queryErr) {
        console.error('Table creation error:', queryErr);
        connection.end();
        return callback(queryErr);
      }

      console.log('Customer table created successfully');
      connection.end((endErr) => {
        if (endErr) {
          console.error('Error closing connection:', endErr);
          return callback(endErr);
        }
        callback(null, results);
      });
    });
  });
}

// Test customer CRUD operations using callbacks
function testCustomerOperations(callback) {
  const connection = mysql.createConnection({
    host: testDbConfig.HOST,
    user: testDbConfig.USER,
    password: testDbConfig.PASSWORD,
    database: testDbConfig.DB
  });

  const testCustomer = {
    email: 'test@example.com',
    name: 'Test Customer',
    active: true
  };

  connection.connect((connectErr) => {
    if (connectErr) {
      return callback(connectErr);
    }

    // Insert test customer
    const insertQuery = 'INSERT INTO customers SET ?';
    connection.query(insertQuery, testCustomer, (insertErr, insertResults) => {
      if (insertErr) {
        connection.end();
        return callback(insertErr);
      }

      const customerId = insertResults.insertId;
      console.log('Customer inserted with ID:', customerId);

      // Retrieve the customer
      const selectQuery = 'SELECT * FROM customers WHERE id = ?';
      connection.query(selectQuery, [customerId], (selectErr, selectResults) => {
        if (selectErr) {
          connection.end();
          return callback(selectErr);
        }

        if (selectResults.length === 0) {
          connection.end();
          return callback(new Error('Customer not found'));
        }

        const retrievedCustomer = selectResults[0];
        console.log('Customer retrieved:', retrievedCustomer);

        // Update the customer
        const updateQuery = 'UPDATE customers SET name = ? WHERE id = ?';
        const updatedName = 'Updated Test Customer';
        connection.query(updateQuery, [updatedName, customerId], (updateErr, updateResults) => {
          if (updateErr) {
            connection.end();
            return callback(updateErr);
          }

          console.log('Customer updated');

          // Delete the customer
          const deleteQuery = 'DELETE FROM customers WHERE id = ?';
          connection.query(deleteQuery, [customerId], (deleteErr, deleteResults) => {
            if (deleteErr) {
              connection.end();
              return callback(deleteErr);
            }

            console.log('Customer deleted');
            connection.end((endErr) => {
              if (endErr) {
                return callback(endErr);
              }
              callback(null, 'CRUD operations completed successfully');
            });
          });
        });
      });
    });
  });
}

// Test database cleanup using callbacks
function cleanupDatabase(callback) {
  const connection = mysql.createConnection({
    host: testDbConfig.HOST,
    user: testDbConfig.USER,
    password: testDbConfig.PASSWORD,
    database: testDbConfig.DB
  });

  connection.connect((connectErr) => {
    if (connectErr) {
      return callback(connectErr);
    }

    const dropTableQuery = 'DROP TABLE IF EXISTS customers';
    connection.query(dropTableQuery, (queryErr, results) => {
      if (queryErr) {
        connection.end();
        return callback(queryErr);
      }

      console.log('Customer table dropped');
      connection.end((endErr) => {
        if (endErr) {
          return callback(endErr);
        }
        callback(null, 'Database cleanup completed');
      });
    });
  });
}

// Main test runner using callbacks
function runTests() {
  console.log('Starting database setup tests (callbacks)...');

  testDatabaseConnection((err, result) => {
    if (err) {
      console.error('Database connection test failed:', err);
      return;
    }
    console.log('✓ Database connection test:', result);

    createCustomerTable((err, result) => {
      if (err) {
        console.error('Table creation test failed:', err);
        return;
      }
      console.log('✓ Table creation test passed');

      testCustomerOperations((err, result) => {
        if (err) {
          console.error('CRUD operations test failed:', err);
          return;
        }
        console.log('✓ CRUD operations test:', result);

        cleanupDatabase((err, result) => {
          if (err) {
            console.error('Database cleanup failed:', err);
            return;
          }
          console.log('✓ Database cleanup:', result);
          console.log('All callback tests completed successfully!');
        });
      });
    });
  });
}

// HYBRID FUNCTIONS (support both callback and promise patterns)

// Hybrid function that supports both callback and async/await
function testDatabaseConnectionHybrid(callback) {
  // If no callback provided, return a promise
  if (typeof callback !== 'function') {
    return testDatabaseConnectionAsync();
  }
  
  // Otherwise, use callback pattern
  testDatabaseConnection(callback);
}

function createCustomerTableHybrid(callback) {
  if (typeof callback !== 'function') {
    return createCustomerTableAsync();
  }
  createCustomerTable(callback);
}

function testCustomerOperationsHybrid(callback) {
  if (typeof callback !== 'function') {
    return testCustomerOperationsAsync();
  }
  testCustomerOperations(callback);
}

function cleanupDatabaseHybrid(callback) {
  if (typeof callback !== 'function') {
    return cleanupDatabaseAsync();
  }
  cleanupDatabase(callback);
}

// Export functions for testing
module.exports = {
  // Async/await versions
  testDatabaseConnectionAsync,
  createCustomerTableAsync,
  testCustomerOperationsAsync,
  cleanupDatabaseAsync,
  runTestsAsync,
  
  // Callback versions (for backward compatibility)
  testDatabaseConnection,
  createCustomerTable,
  testCustomerOperations,
  cleanupDatabase,
  runTests,
  
  // Hybrid versions (support both patterns)
  testDatabaseConnectionHybrid,
  createCustomerTableHybrid,
  testCustomerOperationsHybrid,
  cleanupDatabaseHybrid,
  
  // Helper
  createPromisifiedConnection
};

// Run tests if this file is executed directly
if (require.main === module) {
  // Default to async/await, but support callback mode via environment variable
  if (process.env.USE_CALLBACKS === 'true') {
    runTests();
  } else {
    runTestsAsync().catch(err => {
      console.error('Async test execution failed:', err);
      process.exit(1);
    });
  }
}