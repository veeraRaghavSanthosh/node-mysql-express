const Customer = require("../models/customer.model.js");

// Create and Save a new Customer
exports.create = (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  // Additional validation for required fields
  if (!req.body.email || !req.body.name) {
    res.status(400).send({
      message: "Email and name are required fields!"
    });
    return;
  }

  // Create a Customer
  const customer = new Customer({
    email: req.body.email,
    name: req.body.name,
    active: req.body.active !== undefined ? req.body.active : true
  });

  // Save Customer in the database
  Customer.create(customer, (err, data) => {
    if (err) {
      // Handle specific database errors
      if (err.code === 'ER_DUP_ENTRY') {
        res.status(409).send({
          message: "A customer with this email already exists."
        });
      } else {
        res.status(500).send({
          message: err.message || "Some error occurred while creating the Customer."
        });
      }
    } else {
      res.status(201).send(data);
    }
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
    return;
  }

  // Ensure at least one field is being updated
  if (!req.body.email && !req.body.name && req.body.active === undefined) {
    res.status(400).send({
      message: "At least one field (email, name, or active) must be provided for update!"
    });
    return;
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
        } else if (err.code === 'ER_DUP_ENTRY') {
          res.status(409).send({
            message: "A customer with this email already exists."
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
  // Add confirmation requirement for bulk delete
  if (req.query.confirm !== 'true') {
    res.status(400).send({
      message: "Bulk delete requires confirmation. Add ?confirm=true to the request."
    });
    return;
  }

  Customer.removeAll((err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all customers."
      });
    else res.send({ message: `All Customers were deleted successfully!` });
  });
};