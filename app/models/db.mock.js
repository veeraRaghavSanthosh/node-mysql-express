/**
 * Mock Database Connection for Testing
 * 
 * This provides a simple in-memory mock of the MySQL database
 * for testing backward compatibility without requiring a live database connection.
 */

// In-memory data store
let customers = [];
let nextId = 1;

// Mock connection object that mimics mysql connection interface
const mockConnection = {
  query: (sql, params, callback) => {
    // Handle different callback patterns
    if (typeof params === 'function') {
      callback = params;
      params = [];
    }

    try {
      // Simulate async behavior
      setTimeout(() => {
        if (sql.includes('INSERT INTO customers')) {
          // Create customer
          const customer = params;
          const newCustomer = {
            id: nextId++,
            ...customer
          };
          customers.push(newCustomer);
          callback(null, { insertId: newCustomer.id });
        }
        else if (sql.includes('SELECT * FROM customers WHERE id')) {
          // Find by ID
          const id = parseInt(sql.match(/id = (\d+)/)[1]);
          const customer = customers.find(c => c.id === id);
          if (customer) {
            callback(null, [customer]);
          } else {
            callback(null, []);
          }
        }
        else if (sql.includes('SELECT * FROM customers')) {
          // Get all customers
          callback(null, customers);
        }
        else if (sql.includes('UPDATE customers SET')) {
          // Update customer
          const id = parseInt(params[3]);
          const customerIndex = customers.findIndex(c => c.id === id);
          if (customerIndex !== -1) {
            customers[customerIndex] = {
              id: id,
              email: params[0],
              name: params[1],
              active: params[2]
            };
            callback(null, { affectedRows: 1 });
          } else {
            callback(null, { affectedRows: 0 });
          }
        }
        else if (sql.includes('DELETE FROM customers WHERE id')) {
          // Delete by ID
          const id = parseInt(params);
          const customerIndex = customers.findIndex(c => c.id === id);
          if (customerIndex !== -1) {
            customers.splice(customerIndex, 1);
            callback(null, { affectedRows: 1 });
          } else {
            callback(null, { affectedRows: 0 });
          }
        }
        else if (sql.includes('DELETE FROM customers')) {
          // Delete all
          const deletedCount = customers.length;
          customers = [];
          callback(null, { affectedRows: deletedCount });
        }
        else {
          callback(new Error('Unsupported SQL operation'), null);
        }
      }, 10); // Small delay to simulate async database operations
    } catch (error) {
      callback(error, null);
    }
  }
};

module.exports = mockConnection;