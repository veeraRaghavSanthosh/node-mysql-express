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

// Process large batch operations with optimized CPU usage
Customer.processLargeBatch = async (operation, data, options = {}) => {
  const {
    batchSize = 100,
    concurrency = 5,
    delayBetweenBatches = 10,
    onProgress = null,
    onError = null
  } = options;

  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('Data must be a non-empty array');
  }

  const results = [];
  const errors = [];
  let processedCount = 0;

  // Split data into batches to reduce memory usage and CPU load
  const batches = [];
  for (let i = 0; i < data.length; i += batchSize) {
    batches.push(data.slice(i, i + batchSize));
  }

  // Process batches with controlled concurrency
  const processPromise = (batch, batchIndex) => {
    return new Promise((resolve) => {
      // Use setImmediate to yield control back to event loop
      setImmediate(async () => {
        try {
          const batchResults = await processBatch(operation, batch);
          results.push(...batchResults);
          processedCount += batch.length;
          
          if (onProgress) {
            onProgress({
              processed: processedCount,
              total: data.length,
              batchIndex,
              totalBatches: batches.length
            });
          }
          
          resolve(batchResults);
        } catch (error) {
          errors.push({ batchIndex, error: error.message, batch });
          if (onError) {
            onError(error, batchIndex, batch);
          }
          resolve([]);
        }
      });
    });
  };

  // Process batches with controlled concurrency to prevent CPU overload
  for (let i = 0; i < batches.length; i += concurrency) {
    const concurrentBatches = batches.slice(i, i + concurrency);
    const promises = concurrentBatches.map((batch, index) => 
      processPromise(batch, i + index)
    );
    
    await Promise.all(promises);
    
    // Add delay between batch groups to prevent CPU saturation
    if (i + concurrency < batches.length && delayBetweenBatches > 0) {
      await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
    }
  }

  return {
    success: true,
    processed: processedCount,
    results,
    errors: errors.length > 0 ? errors : null,
    totalBatches: batches.length
  };
};

// Helper function to process individual batches
const processBatch = (operation, batch) => {
  return new Promise((resolve, reject) => {
    switch (operation) {
      case 'create':
        processBatchCreate(batch, resolve, reject);
        break;
      case 'update':
        processBatchUpdate(batch, resolve, reject);
        break;
      case 'delete':
        processBatchDelete(batch, resolve, reject);
        break;
      default:
        reject(new Error(`Unsupported operation: ${operation}`));
    }
  });
};

// Optimized batch create using prepared statements
const processBatchCreate = (customers, resolve, reject) => {
  if (customers.length === 0) {
    resolve([]);
    return;
  }

  // Use bulk insert for better performance
  const values = customers.map(customer => [customer.email, customer.name, customer.active]);
  const placeholders = customers.map(() => '(?, ?, ?)').join(', ');
  const flatValues = values.flat();

  sql.query(
    `INSERT INTO customers (email, name, active) VALUES ${placeholders}`,
    flatValues,
    (err, res) => {
      if (err) {
        reject(err);
        return;
      }

      const results = customers.map((customer, index) => ({
        id: res.insertId + index,
        ...customer
      }));

      resolve(results);
    }
  );
};

// Optimized batch update using case statements
const processBatchUpdate = (updates, resolve, reject) => {
  if (updates.length === 0) {
    resolve([]);
    return;
  }

  // Build dynamic case statements for bulk update
  const ids = updates.map(update => update.id);
  const emailCases = updates.map(update => `WHEN ${update.id} THEN '${update.email}'`).join(' ');
  const nameCases = updates.map(update => `WHEN ${update.id} THEN '${update.name}'`).join(' ');
  const activeCases = updates.map(update => `WHEN ${update.id} THEN ${update.active ? 1 : 0}`).join(' ');

  const query = `
    UPDATE customers SET 
      email = CASE id ${emailCases} END,
      name = CASE id ${nameCases} END,
      active = CASE id ${activeCases} END
    WHERE id IN (${ids.join(',')})
  `;

  sql.query(query, (err, res) => {
    if (err) {
      reject(err);
      return;
    }

    resolve(updates.map(update => ({ id: update.id, ...update })));
  });
};

// Optimized batch delete using IN clause
const processBatchDelete = (ids, resolve, reject) => {
  if (ids.length === 0) {
    resolve([]);
    return;
  }

  sql.query(
    'DELETE FROM customers WHERE id IN (?)',
    [ids],
    (err, res) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(ids.map(id => ({ id, deleted: true })));
    }
  );
};

module.exports = Customer;
