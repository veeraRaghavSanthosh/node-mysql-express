const Customer = require("../models/customer.model.js");

// Create and Save a new Customer
exports.create = (req, res) => {
  // Input validation is already handled by middleware
  // Create a Customer with validated and sanitized data
  const customer = new Customer({
    email: req.body.email,
    name: req.body.name,
    active: req.body.active || false // Default to false if not provided
  });

  // Save Customer in the database
  Customer.create(customer, (err, data) => {
    if (err) {
      // Check for duplicate email error
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
          error: "Email already exists",
          message: "A customer with this email address already exists."
        });
      }
      return res.status(500).json({
        error: "Database error",
        message: err.message || "Some error occurred while creating the Customer."
      });
    }
    res.status(201).json(data);
  });
};

// Retrieve all Customers from the database.
exports.findAll = (req, res) => {
  Customer.getAll((err, data) => {
    if (err) {
      return res.status(500).json({
        error: "Database error",
        message: err.message || "Some error occurred while retrieving customers."
      });
    }
    res.json(data);
  });
};

// Find a single Customer with a customerId
exports.findOne = (req, res) => {
  // Customer ID validation is already handled by middleware
  Customer.findById(req.params.customerId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        return res.status(404).json({
          error: "Not found",
          message: `Customer with id ${req.params.customerId} not found.`
        });
      } else {
        return res.status(500).json({
          error: "Database error",
          message: "Error retrieving Customer with id " + req.params.customerId
        });
      }
    }
    res.json(data);
  });
};

// Update a Customer identified by the customerId in the request
exports.update = (req, res) => {
  // Input validation is already handled by middleware
  // Only update fields that are provided in the request
  const updateData = {};
  if (req.body.email !== undefined) updateData.email = req.body.email;
  if (req.body.name !== undefined) updateData.name = req.body.name;
  if (req.body.active !== undefined) updateData.active = req.body.active;

  // Check if there's any data to update
  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({
      error: "Validation failed",
      message: "At least one field (email, name, or active) must be provided for update."
    });
  }

  Customer.updateById(
    req.params.customerId,
    new Customer(updateData),
    (err, data) => {
      if (err) {
        if (err.kind === "not_found") {
          return res.status(404).json({
            error: "Not found",
            message: `Customer with id ${req.params.customerId} not found.`
          });
        } else if (err.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({
            error: "Email already exists",
            message: "A customer with this email address already exists."
          });
        } else {
          return res.status(500).json({
            error: "Database error",
            message: "Error updating Customer with id " + req.params.customerId
          });
        }
      }
      res.json(data);
    }
  );
};

// Delete a Customer with the specified customerId in the request
exports.delete = (req, res) => {
  // Customer ID validation is already handled by middleware
  Customer.remove(req.params.customerId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        return res.status(404).json({
          error: "Not found",
          message: `Customer with id ${req.params.customerId} not found.`
        });
      } else {
        return res.status(500).json({
          error: "Database error",
          message: "Could not delete Customer with id " + req.params.customerId
        });
      }
    }
    res.json({ 
      success: true,
      message: `Customer with id ${req.params.customerId} was deleted successfully!` 
    });
  });
};

// Delete all Customers from the database.
exports.deleteAll = (req, res) => {
  Customer.removeAll((err, data) => {
    if (err) {
      return res.status(500).json({
        error: "Database error",
        message: err.message || "Some error occurred while removing all customers."
      });
    }
    res.json({ 
      success: true,
      message: `All customers were deleted successfully!`,
      deletedCount: data.affectedRows || 0
    });
  });
};
