const User = require("../../app/models/user.model.js");

/**
 * Validates if the input object is not null or undefined
 * @param {*} input - The input to validate
 * @param {string} fieldName - The name of the field for error messaging
 * @returns {boolean} - Returns true if valid, false otherwise
 */
const validateNotNull = (input, fieldName = 'Input') => {
  if (input === null || input === undefined) {
    throw new TypeError(`${fieldName} cannot be null or undefined`);
  }
  return true;
};

/**
 * Validates user object properties
 * @param {Object} user - User object to validate
 * @returns {Object} - Validation result with isValid and errors
 */
const validateUser = (user) => {
  const errors = [];
  
  try {
    validateNotNull(user, 'User object');
    
    // Check required fields
    if (!user.email || user.email === null || user.email === undefined) {
      errors.push('Email is required and cannot be null');
    }
    
    if (!user.name || user.name === null || user.name === undefined) {
      errors.push('Name is required and cannot be null');
    }
    
    // Validate email format if provided
    if (user.email && typeof user.email === 'string') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(user.email)) {
        errors.push('Invalid email format');
      }
    }
    
    // Validate name if provided
    if (user.name && typeof user.name !== 'string') {
      errors.push('Name must be a string');
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  } catch (error) {
    return {
      isValid: false,
      errors: [error.message]
    };
  }
};

// Create and Save a new User
exports.create = (req, res) => {
  try {
    // Validate request body is not null
    validateNotNull(req, 'Request object');
    validateNotNull(req.body, 'Request body');
    
    if (Object.keys(req.body).length === 0) {
      return res.status(400).send({
        message: "Content cannot be empty!"
      });
    }

    // Validate user data
    const validation = validateUser(req.body);
    if (!validation.isValid) {
      return res.status(400).send({
        message: "Validation failed",
        errors: validation.errors
      });
    }

    // Create a User
    const user = new User({
      email: req.body.email,
      name: req.body.name,
      active: req.body.active !== undefined ? req.body.active : true
    });

    // Save User in the database
    User.create(user, (err, data) => {
      if (err) {
        res.status(500).send({
          message: err.message || "Some error occurred while creating the User."
        });
      } else {
        res.send(data);
      }
    });
  } catch (error) {
    res.status(400).send({
      message: error.message || "Invalid input provided"
    });
  }
};

// Retrieve all Users from the database.
exports.findAll = (req, res) => {
  try {
    validateNotNull(req, 'Request object');
    
    User.getAll((err, data) => {
      if (err) {
        res.status(500).send({
          message: err.message || "Some error occurred while retrieving users."
        });
      } else {
        res.send(data || []);
      }
    });
  } catch (error) {
    res.status(400).send({
      message: error.message || "Invalid request"
    });
  }
};

// Find a single User with a userId
exports.findOne = (req, res) => {
  try {
    validateNotNull(req, 'Request object');
    validateNotNull(req.params, 'Request parameters');
    validateNotNull(req.params.userId, 'User ID');
    
    const userId = req.params.userId;
    
    // Validate userId is not empty string
    if (userId === '' || userId.trim() === '') {
      return res.status(400).send({
        message: "User ID cannot be empty"
      });
    }
    
    User.findById(userId, (err, data) => {
      if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: `Not found User with id ${userId}.`
          });
        } else {
          res.status(500).send({
            message: "Error retrieving User with id " + userId
          });
        }
      } else {
        res.send(data);
      }
    });
  } catch (error) {
    res.status(400).send({
      message: error.message || "Invalid request parameters"
    });
  }
};

// Update a User identified by the userId in the request
exports.update = (req, res) => {
  try {
    // Validate request and parameters
    validateNotNull(req, 'Request object');
    validateNotNull(req.body, 'Request body');
    validateNotNull(req.params, 'Request parameters');
    validateNotNull(req.params.userId, 'User ID');

    if (Object.keys(req.body).length === 0) {
      return res.status(400).send({
        message: "Content cannot be empty!"
      });
    }

    const userId = req.params.userId;
    
    // Validate userId is not empty string
    if (userId === '' || userId.trim() === '') {
      return res.status(400).send({
        message: "User ID cannot be empty"
      });
    }

    // Validate user data (partial validation for updates)
    const updateData = { ...req.body };
    
    // Check for null values in provided fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === null) {
        throw new TypeError(`${key} cannot be null`);
      }
    });

    // Validate email format if provided
    if (updateData.email && typeof updateData.email === 'string') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updateData.email)) {
        return res.status(400).send({
          message: "Invalid email format"
        });
      }
    }

    User.updateById(
      userId,
      new User(updateData),
      (err, data) => {
        if (err) {
          if (err.kind === "not_found") {
            res.status(404).send({
              message: `Not found User with id ${userId}.`
            });
          } else {
            res.status(500).send({
              message: "Error updating User with id " + userId
            });
          }
        } else {
          res.send(data);
        }
      }
    );
  } catch (error) {
    res.status(400).send({
      message: error.message || "Invalid input provided"
    });
  }
};

// Delete a User with the specified userId in the request
exports.delete = (req, res) => {
  try {
    validateNotNull(req, 'Request object');
    validateNotNull(req.params, 'Request parameters');
    validateNotNull(req.params.userId, 'User ID');
    
    const userId = req.params.userId;
    
    // Validate userId is not empty string
    if (userId === '' || userId.trim() === '') {
      return res.status(400).send({
        message: "User ID cannot be empty"
      });
    }
    
    User.remove(userId, (err, data) => {
      if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: `Not found User with id ${userId}.`
          });
        } else {
          res.status(500).send({
            message: "Could not delete User with id " + userId
          });
        }
      } else {
        res.send({ message: `User was deleted successfully!` });
      }
    });
  } catch (error) {
    res.status(400).send({
      message: error.message || "Invalid request parameters"
    });
  }
};

// Delete all Users from the database.
exports.deleteAll = (req, res) => {
  try {
    validateNotNull(req, 'Request object');
    
    User.removeAll((err, data) => {
      if (err) {
        res.status(500).send({
          message: err.message || "Some error occurred while removing all users."
        });
      } else {
        res.send({ message: `All Users were deleted successfully!` });
      }
    });
  } catch (error) {
    res.status(400).send({
      message: error.message || "Invalid request"
    });
  }
};

module.exports = {
  create: exports.create,
  findAll: exports.findAll,
  findOne: exports.findOne,
  update: exports.update,
  delete: exports.delete,
  deleteAll: exports.deleteAll,
  // Export validation functions for testing
  validateNotNull,
  validateUser
};