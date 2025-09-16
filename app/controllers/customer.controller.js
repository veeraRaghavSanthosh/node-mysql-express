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

// Process large batch operations with optimized performance
exports.processLargeBatch = async (req, res) => {
  try {
    // Validate request
    if (!req.body || !req.body.operation || !req.body.data) {
      return res.status(400).send({
        message: "Operation and data are required. Format: { operation: 'create|update|delete', data: [...], options?: {...} }"
      });
    }

    const { operation, data, options = {} } = req.body;

    // Validate operation type
    if (!['create', 'update', 'delete'].includes(operation)) {
      return res.status(400).send({
        message: "Operation must be one of: create, update, delete"
      });
    }

    // Validate data format
    if (!Array.isArray(data) || data.length === 0) {
      return res.status(400).send({
        message: "Data must be a non-empty array"
      });
    }

    // Set up progress tracking if requested
    let progressCallback = null;
    if (options.trackProgress) {
      progressCallback = (progress) => {
        console.log(`Batch Progress: ${progress.processed}/${progress.total} (${Math.round(progress.processed/progress.total*100)}%)`);
      };
    }

    // Process the batch with optimized settings
    const result = await Customer.processLargeBatch(operation, data, {
      ...options,
      onProgress: progressCallback,
      onError: (error, batchIndex, batch) => {
        console.error(`Error in batch ${batchIndex}:`, error.message);
      }
    });

    res.send({
      success: true,
      message: `Batch ${operation} completed successfully`,
      ...result
    });

  } catch (error) {
    console.error('Batch processing error:', error);
    res.status(500).send({
      message: error.message || "Some error occurred during batch processing."
    });
  }
};
