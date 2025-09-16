const Customer = require("../models/customer.model.js");
const logger = require("../config/logger.config.js");

// Create and Save a new Customer
exports.create = (req, res) => {
  logger.trace("Create customer request received", { body: req.body });
  
  // Validate request
  if (!req.body) {
    logger.warn("Create customer request with empty body");
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

  logger.trace("Customer object created", { customer });

  // Save Customer in the database
  Customer.create(customer, (err, data) => {
    if (err) {
      logger.error("Failed to create customer", { error: err, customer });
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Customer."
      });
    } else {
      logger.trace("Customer creation successful, sending response", { data });
      res.send(data);
    }
  });
};

// Retrieve all Customers from the database.
exports.findAll = (req, res) => {
  logger.trace("Find all customers request received");
  
  Customer.getAll((err, data) => {
    if (err) {
      logger.error("Failed to retrieve all customers", { error: err });
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving customers."
      });
    } else {
      logger.trace("Find all customers successful, sending response", { count: data ? data.length : 0 });
      res.send(data);
    }
  });
};

// Find a single Customer with a customerId
exports.findOne = (req, res) => {
  const customerId = req.params.customerId;
  logger.trace("Find one customer request received", { customerId });
  
  Customer.findById(customerId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        logger.warn("Customer not found for findOne request", { customerId });
        res.status(404).send({
          message: `Not found Customer with id ${customerId}.`
        });
      } else {
        logger.error("Error in findOne customer request", { error: err, customerId });
        res.status(500).send({
          message: "Error retrieving Customer with id " + customerId
        });
      }
    } else {
      logger.trace("Find one customer successful, sending response", { customerId, data });
      res.send(data);
    }
  });
};

// Update a Customer identified by the customerId in the request
exports.update = (req, res) => {
  const customerId = req.params.customerId;
  logger.trace("Update customer request received", { customerId, body: req.body });
  
  // Validate Request
  if (!req.body) {
    logger.warn("Update customer request with empty body", { customerId });
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  Customer.updateById(
    customerId,
    new Customer(req.body),
    (err, data) => {
      if (err) {
        if (err.kind === "not_found") {
          logger.warn("Customer not found for update request", { customerId });
          res.status(404).send({
            message: `Not found Customer with id ${customerId}.`
          });
        } else {
          logger.error("Error in update customer request", { error: err, customerId, body: req.body });
          res.status(500).send({
            message: "Error updating Customer with id " + customerId
          });
        }
      } else {
        logger.trace("Update customer successful, sending response", { customerId, data });
        res.send(data);
      }
    }
  );
};

// Delete a Customer with the specified customerId in the request
exports.delete = (req, res) => {
  const customerId = req.params.customerId;
  logger.trace("Delete customer request received", { customerId });
  
  Customer.remove(customerId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        logger.warn("Customer not found for delete request", { customerId });
        res.status(404).send({
          message: `Not found Customer with id ${customerId}.`
        });
      } else {
        logger.error("Error in delete customer request", { error: err, customerId });
        res.status(500).send({
          message: "Could not delete Customer with id " + customerId
        });
      }
    } else {
      logger.trace("Delete customer successful, sending response", { customerId });
      res.send({ message: `Customer was deleted successfully!` });
    }
  });
};

// Delete all Customers from the database.
exports.deleteAll = (req, res) => {
  logger.trace("Delete all customers request received");
  
  Customer.removeAll((err, data) => {
    if (err) {
      logger.error("Failed to delete all customers", { error: err });
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all customers."
      });
    } else {
      logger.trace("Delete all customers successful, sending response", { deletedCount: data ? data.affectedRows : 0 });
      res.send({ message: `All Customers were deleted successfully!` });
    }
  });
};