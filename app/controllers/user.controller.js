// User controller with proper null input validation
const User = require("../models/user.model.js");

// Helper function to validate user input
function validateUserInput(userData) {
  const errors = [];
  
  // Check if userData is null or undefined
  if (!userData) {
    errors.push('User data is required');
    return errors;
  }
  
  // Check if userData is an object
  if (typeof userData !== 'object') {
    errors.push('User data must be an object');
    return errors;
  }
  
  // Validate name
  if (!userData.name || typeof userData.name !== 'string' || userData.name.trim() === '') {
    errors.push('Name is required and must be a non-empty string');
  }
  
  // Validate email
  if (!userData.email || typeof userData.email !== 'string' || userData.email.trim() === '') {
    errors.push('Email is required and must be a non-empty string');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      errors.push('Email must be a valid email address');
    }
  }
  
  // Validate age (optional, but if provided must be valid)
  if (userData.age !== undefined && userData.age !== null) {
    if (typeof userData.age !== 'number' || userData.age < 0 || userData.age > 150) {
      errors.push('Age must be a number between 0 and 150');
    }
  }
  
  return errors;
}

// Create and Save a new User
exports.create = (req, res) => {
  try {
    // Validate request body - this prevents TypeError when req.body is null
    if (!req.body) {
      return res.status(400).send({
        success: false,
        message: "Content can not be empty!"
      });
    }

    // Validate user input
    const validationErrors = validateUserInput(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    // Create a User
    const user = new User({
      email: req.body.email.trim(),
      name: req.body.name.trim(),
      age: req.body.age || null
    });

    // Save User in the database
    User.create(user, (err, data) => {
      if (err) {
        res.status(500).send({
          success: false,
          message: err.message || "Some error occurred while creating the User."
        });
      } else {
        res.status(201).send({
          success: true,
          message: "User created successfully",
          data: data
        });
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Retrieve all Users from the database
exports.findAll = (req, res) => {
  try {
    User.getAll((err, data) => {
      if (err) {
        res.status(500).send({
          success: false,
          message: err.message || "Some error occurred while retrieving users."
        });
      } else {
        res.send({
          success: true,
          data: data,
          count: data.length
        });
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Find a single User with a userId
exports.findOne = (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Validate userId parameter
    if (!userId || userId === 'null' || userId === 'undefined') {
      return res.status(400).send({
        success: false,
        message: "User ID is required and cannot be null"
      });
    }

    User.findById(userId, (err, data) => {
      if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            success: false,
            message: `Not found User with id ${userId}.`
          });
        } else {
          res.status(500).send({
            success: false,
            message: "Error retrieving User with id " + userId
          });
        }
      } else {
        res.send({
          success: true,
          data: data
        });
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update a User identified by the userId in the request
exports.update = (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Validate userId parameter
    if (!userId || userId === 'null' || userId === 'undefined') {
      return res.status(400).send({
        success: false,
        message: "User ID is required and cannot be null"
      });
    }

    // Validate request body
    if (!req.body) {
      return res.status(400).send({
        success: false,
        message: "Content can not be empty!"
      });
    }

    // Validate user input
    const validationErrors = validateUserInput(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    console.log(req.body);

    User.updateById(
      userId,
      new User({
        email: req.body.email.trim(),
        name: req.body.name.trim(),
        age: req.body.age || null
      }),
      (err, data) => {
        if (err) {
          if (err.kind === "not_found") {
            res.status(404).send({
              success: false,
              message: `Not found User with id ${userId}.`
            });
          } else {
            res.status(500).send({
              success: false,
              message: "Error updating User with id " + userId
            });
          }
        } else {
          res.send({
            success: true,
            message: "User updated successfully",
            data: data
          });
        }
      }
    );
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete a User with the specified userId in the request
exports.delete = (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Validate userId parameter
    if (!userId || userId === 'null' || userId === 'undefined') {
      return res.status(400).send({
        success: false,
        message: "User ID is required and cannot be null"
      });
    }

    User.remove(userId, (err, data) => {
      if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            success: false,
            message: `Not found User with id ${userId}.`
          });
        } else {
          res.status(500).send({
            success: false,
            message: "Could not delete User with id " + userId
          });
        }
      } else {
        res.send({
          success: true,
          message: `User was deleted successfully!`
        });
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete all Users from the database
exports.deleteAll = (req, res) => {
  try {
    User.removeAll((err, data) => {
      if (err) {
        res.status(500).send({
          success: false,
          message: err.message || "Some error occurred while removing all users."
        });
      } else {
        res.send({
          success: true,
          message: `All Users were deleted successfully!`
        });
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Export validation function for testing
exports.validateUserInput = validateUserInput;