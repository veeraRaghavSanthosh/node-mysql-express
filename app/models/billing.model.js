const sql = require("./db.js");
const logger = require("../config/logger.config.js");

// constructor
const Billing = function(billing) {
  this.customer_id = billing.customer_id;
  this.amount = billing.amount;
  this.description = billing.description;
  this.status = billing.status || 'pending';
  this.created_at = new Date();
};

// Create and save a new billing record
Billing.create = (newBilling, result) => {
  logger.trace('Entering Billing.create', { billing: newBilling });
  
  const query = "INSERT INTO billing SET ?";
  logger.debug('Executing billing creation query', { query, data: newBilling });
  
  sql.query(query, newBilling, (err, res) => {
    if (err) {
      logger.error('Error creating billing record', { 
        error: err.message, 
        stack: err.stack,
        billing: newBilling 
      });
      result(err, null);
      return;
    }

    const createdBilling = { id: res.insertId, ...newBilling };
    logger.info('Successfully created billing record', { 
      billingId: res.insertId,
      customerId: newBilling.customer_id,
      amount: newBilling.amount 
    });
    logger.trace('Exiting Billing.create with success', { createdBilling });
    
    result(null, createdBilling);
  });
};

// Find billing record by ID
Billing.findById = (billingId, result) => {
  logger.trace('Entering Billing.findById', { billingId });
  
  const query = `SELECT * FROM billing WHERE id = ${billingId}`;
  logger.debug('Executing billing lookup query', { query, billingId });
  
  sql.query(query, (err, res) => {
    if (err) {
      logger.error('Error finding billing record by ID', { 
        error: err.message,
        stack: err.stack,
        billingId 
      });
      result(err, null);
      return;
    }

    if (res.length) {
      logger.info('Found billing record', { billingId, status: res[0].status });
      logger.trace('Exiting Billing.findById with found record', { billing: res[0] });
      result(null, res[0]);
      return;
    }

    logger.warn('Billing record not found', { billingId });
    logger.trace('Exiting Billing.findById with not found');
    result({ kind: "not_found" }, null);
  });
};

// Get all billing records for a customer
Billing.findByCustomerId = (customerId, result) => {
  logger.trace('Entering Billing.findByCustomerId', { customerId });
  
  const query = `SELECT * FROM billing WHERE customer_id = ${customerId}`;
  logger.debug('Executing customer billing lookup query', { query, customerId });
  
  sql.query(query, (err, res) => {
    if (err) {
      logger.error('Error finding billing records for customer', { 
        error: err.message,
        stack: err.stack,
        customerId 
      });
      result(err, null);
      return;
    }

    logger.info('Found billing records for customer', { 
      customerId, 
      recordCount: res.length 
    });
    logger.trace('Exiting Billing.findByCustomerId', { billingRecords: res });
    
    result(null, res);
  });
};

// Get all billing records
Billing.getAll = result => {
  logger.trace('Entering Billing.getAll');
  
  const query = "SELECT * FROM billing";
  logger.debug('Executing get all billing records query', { query });
  
  sql.query(query, (err, res) => {
    if (err) {
      logger.error('Error retrieving all billing records', { 
        error: err.message,
        stack: err.stack 
      });
      result(err, null);
      return;
    }

    logger.info('Retrieved all billing records', { recordCount: res.length });
    logger.trace('Exiting Billing.getAll', { billingRecords: res });
    
    result(null, res);
  });
};

// Update billing record by ID
Billing.updateById = (id, billing, result) => {
  logger.trace('Entering Billing.updateById', { billingId: id, updates: billing });
  
  const query = "UPDATE billing SET customer_id = ?, amount = ?, description = ?, status = ? WHERE id = ?";
  const params = [billing.customer_id, billing.amount, billing.description, billing.status, id];
  
  logger.debug('Executing billing update query', { query, params });
  
  sql.query(query, params, (err, res) => {
    if (err) {
      logger.error('Error updating billing record', { 
        error: err.message,
        stack: err.stack,
        billingId: id,
        updates: billing 
      });
      result(err, null);
      return;
    }

    if (res.affectedRows == 0) {
      logger.warn('Billing record not found for update', { billingId: id });
      logger.trace('Exiting Billing.updateById with not found');
      result({ kind: "not_found" }, null);
      return;
    }

    const updatedBilling = { id: id, ...billing };
    logger.info('Successfully updated billing record', { 
      billingId: id,
      affectedRows: res.affectedRows 
    });
    logger.trace('Exiting Billing.updateById with success', { updatedBilling });
    
    result(null, updatedBilling);
  });
};

// Process payment for billing record
Billing.processPayment = (billingId, paymentData, result) => {
  logger.trace('Entering Billing.processPayment', { billingId, paymentData });
  
  // First, get the billing record
  Billing.findById(billingId, (err, billing) => {
    if (err) {
      logger.error('Error finding billing record for payment processing', { 
        error: err.message,
        billingId 
      });
      result(err, null);
      return;
    }

    if (!billing) {
      logger.warn('Billing record not found for payment processing', { billingId });
      result({ kind: "not_found" }, null);
      return;
    }

    logger.debug('Processing payment for billing record', { 
      billingId,
      amount: billing.amount,
      paymentMethod: paymentData.method 
    });

    // Simulate payment processing
    const paymentSuccess = Math.random() > 0.1; // 90% success rate for simulation
    
    if (paymentSuccess) {
      // Update billing status to paid
      const updateQuery = "UPDATE billing SET status = 'paid', paid_at = NOW() WHERE id = ?";
      logger.debug('Updating billing status to paid', { billingId });
      
      sql.query(updateQuery, [billingId], (updateErr, updateRes) => {
        if (updateErr) {
          logger.error('Error updating billing status after payment', { 
            error: updateErr.message,
            stack: updateErr.stack,
            billingId 
          });
          result(updateErr, null);
          return;
        }

        logger.info('Payment processed successfully', { 
          billingId,
          amount: billing.amount,
          paymentMethod: paymentData.method 
        });
        logger.trace('Exiting Billing.processPayment with success', { 
          billingId,
          status: 'paid' 
        });
        
        result(null, { 
          billingId, 
          status: 'paid', 
          amount: billing.amount,
          message: 'Payment processed successfully' 
        });
      });
    } else {
      logger.warn('Payment processing failed', { 
        billingId,
        amount: billing.amount,
        paymentMethod: paymentData.method 
      });
      logger.trace('Exiting Billing.processPayment with failure');
      
      result({ kind: "payment_failed" }, null);
    }
  });
};

// Delete billing record
Billing.remove = (id, result) => {
  logger.trace('Entering Billing.remove', { billingId: id });
  
  const query = "DELETE FROM billing WHERE id = ?";
  logger.debug('Executing billing deletion query', { query, billingId: id });
  
  sql.query(query, [id], (err, res) => {
    if (err) {
      logger.error('Error deleting billing record', { 
        error: err.message,
        stack: err.stack,
        billingId: id 
      });
      result(err, null);
      return;
    }

    if (res.affectedRows == 0) {
      logger.warn('Billing record not found for deletion', { billingId: id });
      logger.trace('Exiting Billing.remove with not found');
      result({ kind: "not_found" }, null);
      return;
    }

    logger.info('Successfully deleted billing record', { 
      billingId: id,
      affectedRows: res.affectedRows 
    });
    logger.trace('Exiting Billing.remove with success');
    
    result(null, res);
  });
};

// Delete all billing records
Billing.removeAll = result => {
  logger.trace('Entering Billing.removeAll');
  
  const query = "DELETE FROM billing";
  logger.debug('Executing delete all billing records query', { query });
  
  sql.query(query, (err, res) => {
    if (err) {
      logger.error('Error deleting all billing records', { 
        error: err.message,
        stack: err.stack 
      });
      result(err, null);
      return;
    }

    logger.info('Successfully deleted all billing records', { 
      deletedCount: res.affectedRows 
    });
    logger.trace('Exiting Billing.removeAll with success', { deletedCount: res.affectedRows });
    
    result(null, res);
  });
};

module.exports = Billing;