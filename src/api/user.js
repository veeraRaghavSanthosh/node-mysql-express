// User API with comprehensive null input validation
const User = require("../../app/models/user.model.js");

// Helper function to validate user input and prevent TypeError
function validateInput(input) {
  const errors = [];
  
  // Primary null/undefined check - this prevents the main TypeError
  if (input === null || input === undefined) {
    errors.push('Input cannot be null or undefined');
    return errors;
  }
  
  // Check if input is an object (not string, number, etc.)
  if (typeof input !== 'object' || Array.isArray(input)) {
    errors.push('Input must be an object');
    return errors;
  }
  
  return errors;
}

// Validate user data specifically
function validateUserData(userData) {
  // First check for null/undefined
  const basicErrors = validateInput(userData);
  if (basicErrors.length > 0) {
    return basicErrors;
  }
  
  const errors = [];
  
  // Validate name
  if (!userData.name) {
    errors.push('Name is required');
  } else if (typeof userData.name !== 'string') {
    errors.push('Name must be a string');
  } else if (userData.name.trim() === '') {
    errors.push('Name cannot be empty');
  }
  
  // Validate email
  if (!userData.email) {
    errors.push('Email is required');
  } else if (typeof userData.email !== 'string') {
    errors.push('Email must be a string');
  } else if (userData.email.trim() === '') {
    errors.push('Email cannot be empty');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      errors.push('Email must be a valid email address');
    }
  }
  
  // Validate age (optional)
  if (userData.age !== undefined && userData.age !== null) {
    if (typeof userData.age !== 'number') {
      errors.push('Age must be a number');
    } else if (userData.age < 0 || userData.age > 150) {
      errors.push('Age must be between 0 and 150');
    }
  }
  
  return errors;
}

// API Functions with null validation

// Create user
exports.createUser = (req, res) => {
  try {
    // This is the main fix for TypeError when input is null
    if (!req || !req.body) {
      return res.status(400).json({
        success: false,
        message: "Request body cannot be null or empty",
        error: "NULL_INPUT_ERROR"
      });
    }

    // Validate the user data
    const validationErrors = validateUserData(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors
      });
    }

    // Create user object safely
    const userData = {
      name: req.body.name.trim(),
      email: req.body.email.trim(),
      age: req.body.age || null
    };

    const user = new User(userData);

    User.create(user, (err, data) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Error creating user",
          error: err.message
        });
      }

      res.status(201).json({
        success: true,
        message: "User created successfully",
        data: data
      });
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Get all users
exports.getAllUsers = (req, res) => {
  try {
    User.getAll((err, data) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Error retrieving users",
          error: err.message
        });
      }

      res.json({
        success: true,
        data: data || [],
        count: data ? data.length : 0
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Get user by ID
exports.getUserById = (req, res) => {
  try {
    // Validate request parameters
    if (!req || !req.params) {
      return res.status(400).json({
        success: false,
        message: "Request parameters cannot be null",
        error: "NULL_PARAMS_ERROR"
      });
    }

    const userId = req.params.id;
    
    // Validate user ID
    if (!userId || userId === 'null' || userId === 'undefined') {
      return res.status(400).json({
        success: false,
        message: "User ID is required and cannot be null",
        error: "INVALID_USER_ID"
      });
    }

    User.findById(userId, (err, data) => {
      if (err) {
        if (err.kind === "not_found") {
          return res.status(404).json({
            success: false,
            message: `User with ID ${userId} not found`
          });
        }
        return res.status(500).json({
          success: false,
          message: "Error retrieving user",
          error: err.message
        });
      }

      res.json({
        success: true,
        data: data
      });
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Update user
exports.updateUser = (req, res) => {
  try {
    // Validate request
    if (!req || !req.params || !req.body) {
      return res.status(400).json({
        success: false,
        message: "Request parameters and body cannot be null",
        error: "NULL_REQUEST_ERROR"
      });
    }

    const userId = req.params.id;
    
    // Validate user ID
    if (!userId || userId === 'null' || userId === 'undefined') {
      return res.status(400).json({
        success: false,
        message: "User ID is required and cannot be null",
        error: "INVALID_USER_ID"
      });
    }

    // Validate user data
    const validationErrors = validateUserData(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors
      });
    }

    const userData = {
      name: req.body.name.trim(),
      email: req.body.email.trim(),
      age: req.body.age || null
    };

    const user = new User(userData);

    User.updateById(userId, user, (err, data) => {
      if (err) {
        if (err.kind === "not_found") {
          return res.status(404).json({
            success: false,
            message: `User with ID ${userId} not found`
          });
        }
        return res.status(500).json({
          success: false,
          message: "Error updating user",
          error: err.message
        });
      }

      res.json({
        success: true,
        message: "User updated successfully",
        data: data
      });
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Delete user
exports.deleteUser = (req, res) => {
  try {
    // Validate request
    if (!req || !req.params) {
      return res.status(400).json({
        success: false,
        message: "Request parameters cannot be null",
        error: "NULL_PARAMS_ERROR"
      });
    }

    const userId = req.params.id;
    
    // Validate user ID
    if (!userId || userId === 'null' || userId === 'undefined') {
      return res.status(400).json({
        success: false,
        message: "User ID is required and cannot be null",
        error: "INVALID_USER_ID"
      });
    }

    User.remove(userId, (err, data) => {
      if (err) {
        if (err.kind === "not_found") {
          return res.status(404).json({
            success: false,
            message: `User with ID ${userId} not found`
          });
        }
        return res.status(500).json({
          success: false,
          message: "Error deleting user",
          error: err.message
        });
      }

      res.json({
        success: true,
        message: "User deleted successfully"
      });
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Export validation functions for testing
exports.validateInput = validateInput;
exports.validateUserData = validateUserData;