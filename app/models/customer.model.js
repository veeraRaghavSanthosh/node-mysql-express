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
  // Default options for optimization
  const {
    chunkSize = 100,           // Process in chunks to reduce memory usage
    concurrency = 3,           // Limit concurrent operations to prevent CPU overload
    operation = 'create',      // Default operation: create, update, delete
    delayMs = 10              // Small delay between chunks to prevent CPU blocking
  } = options;

  // Validate input
  if (!Array.isArray(batchData) || batchData.length === 0) {
    return result(new Error("batchData must be a non-empty array"), null);
  }

  // Split data into chunks for efficient processing
  const chunks = [];
  for (let i = 0; i < batchData.length; i += chunkSize) {
    chunks.push(batchData.slice(i, i + chunkSize));
  }

  let processedCount = 0;
  let errors = [];
  let results = [];
  let activeOperations = 0;
  let chunkIndex = 0;

  const processNextChunk = () => {
    if (chunkIndex >= chunks.length && activeOperations === 0) {
      // All chunks processed
      if (errors.length > 0) {
        return result({
          message: "Batch processing completed with errors",
          errors: errors,
          processed: processedCount,
          total: batchData.length
        }, results);
      }
      return result(null, {
        message: "Batch processing completed successfully",
        processed: processedCount,
        total: batchData.length,
        results: results
      });
    }

    // Process chunks with concurrency limit
    while (activeOperations < concurrency && chunkIndex < chunks.length) {
      const currentChunk = chunks[chunkIndex++];
      activeOperations++;

      // Use setImmediate to prevent blocking the event loop
      setImmediate(() => {
        processChunk(currentChunk, (err, chunkResults) => {
          activeOperations--;
          
          if (err) {
            errors.push({
              chunkIndex: chunkIndex - 1,
              error: err.message || err
            });
          } else {
            processedCount += currentChunk.length;
            if (chunkResults) {
              results.push(...chunkResults);
            }
          }

          // Small delay to prevent CPU overload
          setTimeout(() => {
            processNextChunk();
          }, delayMs);
        });
      });
    }
  };

  const processChunk = (chunk, chunkCallback) => {
    switch (operation) {
      case 'create':
        processBatchCreate(chunk, chunkCallback);
        break;
      case 'update':
        processBatchUpdate(chunk, chunkCallback);
        break;
      case 'delete':
        processBatchDelete(chunk, chunkCallback);
        break;
      default:
        chunkCallback(new Error(`Unsupported operation: ${operation}`));
    }
  };

  const processBatchCreate = (chunk, callback) => {
    // Use bulk insert for better performance
    const values = chunk.map(customer => [
      customer.email || '',
      customer.name || '',
      customer.active !== undefined ? customer.active : true
    ]);

    const placeholders = chunk.map(() => '(?, ?, ?)').join(', ');
    const flatValues = values.flat();

    sql.query(
      `INSERT INTO customers (email, name, active) VALUES ${placeholders}`,
      flatValues,
      (err, res) => {
        if (err) {
          console.log("Batch create error:", err);
          return callback(err);
        }
        
        const chunkResults = chunk.map((customer, index) => ({
          id: res.insertId + index,
          ...customer
        }));
        
        callback(null, chunkResults);
      }
    );
  };

  const processBatchUpdate = (chunk, callback) => {
    // Process updates in parallel but limited by chunk size
    let completed = 0;
    let chunkErrors = [];
    let chunkResults = [];

    chunk.forEach((customer, index) => {
      if (!customer.id) {
        chunkErrors.push(`Customer at index ${index} missing id`);
        completed++;
        if (completed === chunk.length) {
          callback(chunkErrors.length > 0 ? new Error(chunkErrors.join('; ')) : null, chunkResults);
        }
        return;
      }

      sql.query(
        "UPDATE customers SET email = ?, name = ?, active = ? WHERE id = ?",
        [customer.email, customer.name, customer.active, customer.id],
        (err, res) => {
          completed++;
          
          if (err) {
            chunkErrors.push(`Update failed for id ${customer.id}: ${err.message}`);
          } else if (res.affectedRows === 0) {
            chunkErrors.push(`Customer with id ${customer.id} not found`);
          } else {
            chunkResults.push({ id: customer.id, ...customer });
          }

          if (completed === chunk.length) {
            callback(chunkErrors.length > 0 ? new Error(chunkErrors.join('; ')) : null, chunkResults);
          }
        }
      );
    });
  };

  const processBatchDelete = (chunk, callback) => {
    // Use bulk delete for better performance
    const ids = chunk.map(item => typeof item === 'object' ? item.id : item);
    const placeholders = ids.map(() => '?').join(', ');

    sql.query(
      `DELETE FROM customers WHERE id IN (${placeholders})`,
      ids,
      (err, res) => {
        if (err) {
          console.log("Batch delete error:", err);
          return callback(err);
        }
        
        callback(null, { deletedCount: res.affectedRows });
      }
    );
  };

  // Start processing
  processNextChunk();
};

module.exports = Customer;
