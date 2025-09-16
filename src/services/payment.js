const mysql = require('mysql2');
const util = require('util');

// Database connection (assuming similar to existing structure)
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'testdb'
};

let connection;
let query;

// Initialize database connection with error handling
function initializeConnection() {
  try {
    connection = mysql.createConnection(dbConfig);
    
    // Handle connection errors gracefully
    connection.on('error', (err) => {
      if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.warn('Database connection lost. Attempting to reconnect...');
        initializeConnection();
      } else {
        console.error('Database connection error:', err);
      }
    });

    // Promisify the query method for async/await usage
    query = util.promisify(connection.query).bind(connection);
  } catch (error) {
    console.warn('Could not initialize database connection:', error.message);
    // For testing purposes, create a mock query function
    query = async () => { throw new Error('Database not available'); };
  }
}

// Initialize connection on module load
initializeConnection();

// Payment Service with both callback and async/await support
class PaymentService {
  
  // Original callback-based method (for backward compatibility)
  static processPayment(paymentData, callback) {
    // If no callback provided, return promise
    if (!callback || typeof callback !== 'function') {
      return this.processPaymentAsync(paymentData);
    }

    // Original callback implementation
    const { amount, currency, customerId, paymentMethod } = paymentData;
    
    // Validate payment data
    if (!amount || !customerId || !paymentMethod) {
      return callback(new Error('Missing required payment data'));
    }

    if (amount <= 0) {
      return callback(new Error('Invalid payment amount'));
    }

    // Insert payment record
    const insertQuery = `
      INSERT INTO payments (customer_id, amount, currency, payment_method, status, created_at)
      VALUES (?, ?, ?, ?, 'pending', NOW())
    `;
    
    connection.query(insertQuery, [customerId, amount, currency || 'USD', paymentMethod], (err, result) => {
      if (err) {
        return callback(err);
      }

      const paymentId = result.insertId;
      
      // Simulate payment processing
      setTimeout(() => {
        const success = Math.random() > 0.1; // 90% success rate
        const status = success ? 'completed' : 'failed';
        
        // Update payment status
        const updateQuery = 'UPDATE payments SET status = ?, processed_at = NOW() WHERE id = ?';
        
        connection.query(updateQuery, [status, paymentId], (updateErr) => {
          if (updateErr) {
            return callback(updateErr);
          }
          
          callback(null, {
            paymentId,
            status,
            amount,
            currency: currency || 'USD',
            customerId
          });
        });
      }, 1000);
    });
  }

  // New async/await implementation
  static async processPaymentAsync(paymentData) {
    try {
      const { amount, currency, customerId, paymentMethod } = paymentData;
      
      // Validate payment data
      if (!amount || !customerId || !paymentMethod) {
        throw new Error('Missing required payment data');
      }

      if (amount <= 0) {
        throw new Error('Invalid payment amount');
      }

      // Insert payment record
      const insertQuery = `
        INSERT INTO payments (customer_id, amount, currency, payment_method, status, created_at)
        VALUES (?, ?, ?, ?, 'pending', NOW())
      `;
      
      const result = await query(insertQuery, [customerId, amount, currency || 'USD', paymentMethod]);
      const paymentId = result.insertId;
      
      // Simulate payment processing with Promise
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const success = Math.random() > 0.1; // 90% success rate
      const status = success ? 'completed' : 'failed';
      
      // Update payment status
      const updateQuery = 'UPDATE payments SET status = ?, processed_at = NOW() WHERE id = ?';
      await query(updateQuery, [status, paymentId]);
      
      return {
        paymentId,
        status,
        amount,
        currency: currency || 'USD',
        customerId
      };
    } catch (error) {
      throw error;
    }
  }

  // Get payment by ID (callback version)
  static getPayment(paymentId, callback) {
    if (!callback || typeof callback !== 'function') {
      return this.getPaymentAsync(paymentId);
    }

    const selectQuery = 'SELECT * FROM payments WHERE id = ?';
    
    connection.query(selectQuery, [paymentId], (err, results) => {
      if (err) {
        return callback(err);
      }
      
      if (results.length === 0) {
        return callback(new Error('Payment not found'));
      }
      
      callback(null, results[0]);
    });
  }

  // Get payment by ID (async version)
  static async getPaymentAsync(paymentId) {
    try {
      const selectQuery = 'SELECT * FROM payments WHERE id = ?';
      const results = await query(selectQuery, [paymentId]);
      
      if (results.length === 0) {
        throw new Error('Payment not found');
      }
      
      return results[0];
    } catch (error) {
      throw error;
    }
  }

  // Get payments by customer ID (callback version)
  static getPaymentsByCustomer(customerId, callback) {
    if (!callback || typeof callback !== 'function') {
      return this.getPaymentsByCustomerAsync(customerId);
    }

    const selectQuery = 'SELECT * FROM payments WHERE customer_id = ? ORDER BY created_at DESC';
    
    connection.query(selectQuery, [customerId], (err, results) => {
      if (err) {
        return callback(err);
      }
      
      callback(null, results);
    });
  }

  // Get payments by customer ID (async version)
  static async getPaymentsByCustomerAsync(customerId) {
    try {
      const selectQuery = 'SELECT * FROM payments WHERE customer_id = ? ORDER BY created_at DESC';
      const results = await query(selectQuery, [customerId]);
      return results;
    } catch (error) {
      throw error;
    }
  }

  // Refund payment (callback version)
  static refundPayment(paymentId, amount, callback) {
    if (!callback || typeof callback !== 'function') {
      return this.refundPaymentAsync(paymentId, amount);
    }

    // First, get the original payment
    this.getPayment(paymentId, (err, payment) => {
      if (err) {
        return callback(err);
      }

      if (payment.status !== 'completed') {
        return callback(new Error('Can only refund completed payments'));
      }

      const refundAmount = amount || payment.amount;
      if (refundAmount > payment.amount) {
        return callback(new Error('Refund amount cannot exceed original payment amount'));
      }

      // Insert refund record
      const insertQuery = `
        INSERT INTO refunds (payment_id, amount, status, created_at)
        VALUES (?, ?, 'processing', NOW())
      `;
      
      connection.query(insertQuery, [paymentId, refundAmount], (insertErr, result) => {
        if (insertErr) {
          return callback(insertErr);
        }

        const refundId = result.insertId;
        
        // Simulate refund processing
        setTimeout(() => {
          const success = Math.random() > 0.05; // 95% success rate
          const status = success ? 'completed' : 'failed';
          
          // Update refund status
          const updateQuery = 'UPDATE refunds SET status = ?, processed_at = NOW() WHERE id = ?';
          
          connection.query(updateQuery, [status, refundId], (updateErr) => {
            if (updateErr) {
              return callback(updateErr);
            }
            
            callback(null, {
              refundId,
              paymentId,
              amount: refundAmount,
              status
            });
          });
        }, 500);
      });
    });
  }

  // Refund payment (async version)
  static async refundPaymentAsync(paymentId, amount) {
    try {
      // First, get the original payment
      const payment = await this.getPaymentAsync(paymentId);

      if (payment.status !== 'completed') {
        throw new Error('Can only refund completed payments');
      }

      const refundAmount = amount || payment.amount;
      if (refundAmount > payment.amount) {
        throw new Error('Refund amount cannot exceed original payment amount');
      }

      // Insert refund record
      const insertQuery = `
        INSERT INTO refunds (payment_id, amount, status, created_at)
        VALUES (?, ?, 'processing', NOW())
      `;
      
      const result = await query(insertQuery, [paymentId, refundAmount]);
      const refundId = result.insertId;
      
      // Simulate refund processing
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const success = Math.random() > 0.05; // 95% success rate
      const status = success ? 'completed' : 'failed';
      
      // Update refund status
      const updateQuery = 'UPDATE refunds SET status = ?, processed_at = NOW() WHERE id = ?';
      await query(updateQuery, [status, refundId]);
      
      return {
        refundId,
        paymentId,
        amount: refundAmount,
        status
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = PaymentService;