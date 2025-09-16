const Customer = require("../models/customer.model.js");

// Create and Save a new Customer
exports.create = async (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  // Create a Customer
  const customer = new Customer({
    email: req.body.email,
    name: req.body.name,
    active: req.body.active
  });

  try {
    // Save Customer in the database
    const data = await Customer.create(customer);
    res.send(data);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while creating the Customer."
    });
  }
};

// Retrieve all Customers from the database.
exports.findAll = async (req, res) => {
  try {
    const data = await Customer.getAll();
    res.send(data);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while retrieving customers."
    });
  }
};

// Find a single Customer with a customerId
exports.findOne = async (req, res) => {
  try {
    const data = await Customer.findById(req.params.customerId);
    res.send(data);
  } catch (err) {
    if (err.kind === "not_found") {
      res.status(404).send({
        message: `Not found Customer with id ${req.params.customerId}.`
      });
    } else {
      res.status(500).send({
        message: "Error retrieving Customer with id " + req.params.customerId
      });
    }
  }
};

// Update a Customer identified by the customerId in the request
exports.update = async (req, res) => {
  // Validate Request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  console.log(req.body);

  try {
    const data = await Customer.updateById(
      req.params.customerId,
      new Customer(req.body)
    );
    res.send(data);
  } catch (err) {
    if (err.kind === "not_found") {
      res.status(404).send({
        message: `Not found Customer with id ${req.params.customerId}.`
      });
    } else {
      res.status(500).send({
        message: "Error updating Customer with id " + req.params.customerId
      });
    }
  }
};

// Delete a Customer with the specified customerId in the request
exports.delete = async (req, res) => {
  try {
    await Customer.remove(req.params.customerId);
    res.send({ message: `Customer was deleted successfully!` });
  } catch (err) {
    if (err.kind === "not_found") {
      res.status(404).send({
        message: `Not found Customer with id ${req.params.customerId}.`
      });
    } else {
      res.status(500).send({
        message: "Could not delete Customer with id " + req.params.customerId
      });
    }
  }
};

// Delete all Customers from the database.
exports.deleteAll = async (req, res) => {
  try {
    const data = await Customer.removeAll();
    res.send({ message: `All Customers were deleted successfully!` });
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while removing all customers."
    });
  }
};
