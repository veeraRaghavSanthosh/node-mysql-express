const Customer = require("../models/customer.model.js");

// Create and Save a new Customer
exports.create = (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  // Create a Customer
  const customer = new Customer({
    email: req.body.email,
    name: req.body.name,
    active: req.body.active
  });

  // Save Customer in the database
  Customer.create(customer, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Customer."
      });
    else res.send(data);
  });
};

// Retrieve all Customers from the database.
exports.findAll = (req, res) => {
  Customer.getAll((err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving customers."
      });
    else res.send(data);
  });
};

// Find a single Customer with a customerId
exports.findOne = (req, res) => {
  Customer.findById(req.params.customerId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found Customer with id ${req.params.customerId}.`
        });
      } else {
        res.status(500).send({
          message: "Error retrieving Customer with id " + req.params.customerId
        });
      }
    } else res.send(data);
  });
};

// Update a Customer identified by the customerId in the request
exports.update = (req, res) => {
  // Validate Request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  console.log(req.body);

  Customer.updateById(
    req.params.customerId,
    new Customer(req.body),
    (err, data) => {
      if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: `Not found Customer with id ${req.params.customerId}.`
          });
        } else {
          res.status(500).send({
            message: "Error updating Customer with id " + req.params.customerId
          });
        }
      } else res.send(data);
    }
  );
};

// Delete a Customer with the specified customerId in the request
exports.delete = (req, res) => {
  Customer.remove(req.params.customerId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found Customer with id ${req.params.customerId}.`
        });
      } else {
        res.status(500).send({
          message: "Could not delete Customer with id " + req.params.customerId
        });
      }
    } else res.send({ message: `Customer was deleted successfully!` });
  });
};

// Delete all Customers from the database.
exports.deleteAll = (req, res) => {
  Customer.removeAll((err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all customers."
      });
    else res.send({ message: `All Customers were deleted successfully!` });
  });
};

// Process large batch operations with CPU optimization
exports.processLargeBatch = async (req, res) => {
  try {
    const { operation, data, batchSize = 100, delayMs = 10 } = req.body;
    
    if (!data || !Array.isArray(data)) {
      return res.status(400).send({
        message: "Data must be provided as an array"
      });
    }

    if (!operation || !['create', 'update', 'delete'].includes(operation)) {
      return res.status(400).send({
        message: "Operation must be one of: create, update, delete"
      });
    }

    const results = await _processLargeBatchOptimized(operation, data, batchSize, delayMs);
    
    res.send({
      message: `Batch ${operation} operation completed successfully`,
      processed: results.processed,
      errors: results.errors,
      totalTime: results.totalTime
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Error occurred during batch processing"
    });
  }
};

// Optimized batch processing function with CPU usage reduction techniques
const _processLargeBatchOptimized = async (operation, data, batchSize, delayMs) => {
  const startTime = Date.now();
  const results = { processed: 0, errors: [], totalTime: 0 };
  
  // Process data in chunks to reduce memory pressure and CPU spikes
  for (let i = 0; i < data.length; i += batchSize) {
    const chunk = data.slice(i, i + batchSize);
    
    // Process chunk with Promise.all for parallel execution within batch
    const chunkPromises = chunk.map(async (item, index) => {
      try {
        await _processItem(operation, item, i + index);
        results.processed++;
      } catch (error) {
        results.errors.push({
          index: i + index,
          item,
          error: error.message
        });
      }
    });
    
    // Wait for current batch to complete
    await Promise.all(chunkPromises);
    
    // Add small delay between batches to prevent CPU overload
    // This allows other processes to run and reduces CPU usage
    if (i + batchSize < data.length && delayMs > 0) {
      await _sleep(delayMs);
    }
    
    // Yield control to event loop periodically
    if (i % (batchSize * 10) === 0) {
      await _setImmediate();
    }
  }
  
  results.totalTime = Date.now() - startTime;
  return results;
};

// Process individual item based on operation type
const _processItem = (operation, item, index) => {
  return new Promise((resolve, reject) => {
    switch (operation) {
      case 'create':
        if (!item.email || !item.name) {
          return reject(new Error(`Invalid data at index ${index}: email and name are required`));
        }
        const customer = new Customer({
          email: item.email,
          name: item.name,
          active: item.active !== undefined ? item.active : true
        });
        Customer.create(customer, (err, data) => {
          if (err) reject(err);
          else resolve(data);
        });
        break;
        
      case 'update':
        if (!item.id) {
          return reject(new Error(`Invalid data at index ${index}: id is required for update`));
        }
        Customer.updateById(item.id, new Customer(item), (err, data) => {
          if (err) reject(err);
          else resolve(data);
        });
        break;
        
      case 'delete':
        if (!item.id) {
          return reject(new Error(`Invalid data at index ${index}: id is required for delete`));
        }
        Customer.remove(item.id, (err, data) => {
          if (err) reject(err);
          else resolve(data);
        });
        break;
        
      default:
        reject(new Error(`Unsupported operation: ${operation}`));
    }
  });
};

// Utility function for non-blocking sleep
const _sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Utility function to yield control to event loop
const _setImmediate = () => {
  return new Promise(resolve => setImmediate(resolve));
};
