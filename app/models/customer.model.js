const sql = require("./db.js");

// constructor
const Customer = function(customer) {
  this.email = customer.email;
  this.name = customer.name;
  this.active = customer.active;
};

Customer.create = (newCustomer, result) => {
  sql.query("INSERT INTO customers SET ?", newCustomer, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    console.log("created customer: ", { id: res.insertId, ...newCustomer });
    result(null, { id: res.insertId, ...newCustomer });
  });
};

Customer.findById = (customerId, result) => {
  sql.query(`SELECT * FROM customers WHERE id = ${customerId}`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    if (res.length) {
      console.log("found customer: ", res[0]);
      result(null, res[0]);
      return;
    }

    // not found Customer with the id
    result({ kind: "not_found" }, null);
  });
};

Customer.getAll = result => {
  sql.query("SELECT * FROM customers", (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    console.log("customers: ", res);
    result(null, res);
  });
};

Customer.updateById = (id, customer, result) => {
  sql.query(
    "UPDATE customers SET email = ?, name = ?, active = ? WHERE id = ?",
    [customer.email, customer.name, customer.active, id],
    (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }

      if (res.affectedRows == 0) {
        // not found Customer with the id
        result({ kind: "not_found" }, null);
        return;
      }

      console.log("updated customer: ", { id: id, ...customer });
      result(null, { id: id, ...customer });
    }
  );
};

Customer.remove = (id, result) => {
  sql.query("DELETE FROM customers WHERE id = ?", id, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    if (res.affectedRows == 0) {
      // not found Customer with the id
      result({ kind: "not_found" }, null);
      return;
    }

    console.log("deleted customer with id: ", id);
    result(null, res);
  });
};

Customer.removeAll = result => {
  sql.query("DELETE FROM customers", (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    console.log(`deleted ${res.affectedRows} customers`);
    result(null, res);
  });
};

// Optimized batch processing function for large datasets
Customer.processLargeBatch = (batchData, options = {}, result) => {
  // Default options for CPU optimization
  const defaultOptions = {
    chunkSize: 100,           // Process in chunks of 100 records
    maxConcurrency: 5,        // Limit concurrent operations
    yieldInterval: 50,        // Yield control every 50 operations
    batchSqlSize: 25,         // SQL batch size for bulk operations
    operation: 'insert'       // Default operation: 'insert', 'update', 'delete'
  };
  
  const config = { ...defaultOptions, ...options };
  
  if (!Array.isArray(batchData) || batchData.length === 0) {
    return result({ message: "Invalid batch data provided" }, null);
  }

  let processedCount = 0;
  let errorCount = 0;
  const results = [];
  const startTime = Date.now();

  // Helper function to yield control back to event loop
  const yieldControl = () => {
    return new Promise(resolve => setImmediate(resolve));
  };

  // Process chunk with controlled concurrency
  const processChunk = async (chunk) => {
    const promises = [];
    
    for (let i = 0; i < chunk.length; i += config.batchSqlSize) {
      const batch = chunk.slice(i, i + config.batchSqlSize);
      
      if (config.operation === 'insert') {
        promises.push(processBulkInsert(batch));
      } else if (config.operation === 'update') {
        promises.push(processBulkUpdate(batch));
      } else if (config.operation === 'delete') {
        promises.push(processBulkDelete(batch));
      }
      
      // Limit concurrency to prevent overwhelming the database
      if (promises.length >= config.maxConcurrency) {
        const batchResults = await Promise.allSettled(promises);
        results.push(...batchResults);
        promises.length = 0; // Clear the array
        
        // Yield control periodically
        if (processedCount % config.yieldInterval === 0) {
          await yieldControl();
        }
      }
    }
    
    // Process remaining promises
    if (promises.length > 0) {
      const batchResults = await Promise.allSettled(promises);
      results.push(...batchResults);
    }
  };

  // Bulk insert operation
  const processBulkInsert = (batch) => {
    return new Promise((resolve, reject) => {
      if (batch.length === 1) {
        // Single insert
        const customer = batch[0];
        sql.query("INSERT INTO customers SET ?", customer, (err, res) => {
          if (err) {
            errorCount++;
            resolve({ error: err, data: null });
          } else {
            processedCount++;
            resolve({ error: null, data: { id: res.insertId, ...customer } });
          }
        });
      } else {
        // Bulk insert using VALUES clause
        const values = batch.map(customer => [customer.email, customer.name, customer.active]);
        const query = "INSERT INTO customers (email, name, active) VALUES ?";
        
        sql.query(query, [values], (err, res) => {
          if (err) {
            errorCount += batch.length;
            resolve({ error: err, data: null });
          } else {
            processedCount += batch.length;
            resolve({ error: null, data: { affectedRows: res.affectedRows, insertId: res.insertId } });
          }
        });
      }
    });
  };

  // Bulk update operation
  const processBulkUpdate = (batch) => {
    return new Promise((resolve, reject) => {
      const updatePromises = batch.map(customer => {
        return new Promise((updateResolve) => {
          sql.query(
            "UPDATE customers SET email = ?, name = ?, active = ? WHERE id = ?",
            [customer.email, customer.name, customer.active, customer.id],
            (err, res) => {
              if (err) {
                errorCount++;
                updateResolve({ error: err, data: null });
              } else {
                processedCount++;
                updateResolve({ error: null, data: { affectedRows: res.affectedRows } });
              }
            }
          );
        });
      });
      
      Promise.allSettled(updatePromises).then(resolve);
    });
  };

  // Bulk delete operation
  const processBulkDelete = (batch) => {
    return new Promise((resolve, reject) => {
      const ids = batch.map(item => item.id || item).filter(id => id);
      if (ids.length === 0) {
        resolve({ error: null, data: { affectedRows: 0 } });
        return;
      }
      
      const query = "DELETE FROM customers WHERE id IN (?)";
      sql.query(query, [ids], (err, res) => {
        if (err) {
          errorCount += ids.length;
          resolve({ error: err, data: null });
        } else {
          processedCount += ids.length;
          resolve({ error: null, data: { affectedRows: res.affectedRows } });
        }
      });
    });
  };

  // Main processing logic
  const processBatch = async () => {
    try {
      console.log(`Starting batch processing of ${batchData.length} records...`);
      
      // Process data in chunks to reduce memory usage and CPU load
      for (let i = 0; i < batchData.length; i += config.chunkSize) {
        const chunk = batchData.slice(i, i + config.chunkSize);
        await processChunk(chunk);
        
        // Yield control after each chunk to prevent blocking
        await yieldControl();
        
        // Log progress for large batches
        if (i % (config.chunkSize * 10) === 0) {
          console.log(`Processed ${Math.min(i + config.chunkSize, batchData.length)} / ${batchData.length} records`);
        }
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      const summary = {
        totalRecords: batchData.length,
        processedCount,
        errorCount,
        successRate: ((processedCount / batchData.length) * 100).toFixed(2) + '%',
        duration: duration + 'ms',
        avgTimePerRecord: (duration / batchData.length).toFixed(2) + 'ms',
        results: results
      };
      
      console.log(`Batch processing completed: ${processedCount} successful, ${errorCount} errors in ${duration}ms`);
      result(null, summary);
      
    } catch (error) {
      console.log("Batch processing error: ", error);
      result(error, null);
    }
  };

  // Start processing
  processBatch();
};

module.exports = Customer;
