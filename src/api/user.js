const User = require("../../app/models/user.model.js");

/**
 * Validates input data for user operations
 * @param {Object} data - Input data to validate
 * @param {Array} requiredFields - Array of required field names
 * @returns {Object} - Validation result with isValid boolean and errors array
 */
function validateInput(data, requiredFields = []) {
  const errors = [];
  
  // Check if data exists and is not null
  if (!data || data === null || typeof data !== 'object') {
    return {
      isValid: false,
      errors: ['Request body is required and must be a valid object']
    };
  }

  // Check for required fields
  requiredFields.forEach(field => {
    if (!data.hasOwnProperty(field) || data[field] === null || data[field] === undefined || data[field] === '') {
      errors.push(`${field} is required and cannot be null or empty`);
    }
  });

  // Validate email format if email is provided
  if (data.email && typeof data.email === 'string') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errors.push('Email must be in valid format');
    }
  }

  // Validate name if provided
  if (data.name && typeof data.name !== 'string') {
    errors.push('Name must be a string');
  }

  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

/**
 * Validates user ID parameter
 * @param {string|number} userId - User ID to validate
 * @returns {Object} - Validation result
 */
function validateUserId(userId) {
  if (!userId || userId === null || userId === undefined) {
    return {
      isValid: false,
      error: 'User ID is required'
    };
  }

  const numericId = parseInt(userId);
  if (isNaN(numericId) || numericId <= 0) {
    return {
      isValid: false,
      error: 'User ID must be a positive number'
    };
  }

  return {
    isValid: true,
    userId: numericId
  };
}

// Create and Save a new User
exports.create = (req, res) => {
  try {
    // Validate request with required fields
    const validation = validateInput(req.body, ['email', 'name']);
    
    if (!validation.isValid) {
      return res.status(400).send({
        message: "Validation failed",
        errors: validation.errors
      });
    }

    // Create a User with safe property access
    const userData = {
      email: req.body.email,
      name: req.body.name,
      active: req.body.active !== undefined ? req.body.active : false // Default to false if not provided
    };

    const user = new User(userData);

    // Save User in the database
    User.create(user, (err, data) => {
      if (err) {
        console.error("Error creating user:", err);
        return res.status(500).send({
          message: err.message || "Some error occurred while creating the User."
        });
      }
      res.send(data);
    });

  } catch (error) {
    console.error("Unexpected error in create:", error);
    res.status(500).send({
      message: "Internal server error occurred while creating user"
    });
  }
};

// Retrieve all Users from the database
exports.findAll = (req, res) => {
  try {
    User.getAll((err, data) => {
      if (err) {
        console.error("Error retrieving users:", err);
        return res.status(500).send({
          message: err.message || "Some error occurred while retrieving users."
        });
      }
      res.send(data || []); // Return empty array if data is null
    });
  } catch (error) {
    console.error("Unexpected error in findAll:", error);
    res.status(500).send({
      message: "Internal server error occurred while retrieving users"
    });
  }
};

// Find a single User with a userId
exports.findOne = (req, res) => {
  try {
    // Validate user ID
    const idValidation = validateUserId(req.params.userId);
    
    if (!idValidation.isValid) {
      return res.status(400).send({
        message: idValidation.error
      });
    }

    User.findById(idValidation.userId, (err, data) => {
      if (err) {
        if (err.kind === "not_found") {
          return res.status(404).send({
            message: `Not found User with id ${idValidation.userId}.`
          });
        }
        console.error("Error finding user:", err);
        return res.status(500).send({
          message: "Error retrieving User with id " + idValidation.userId
        });
      }
      res.send(data);
    });

  } catch (error) {
    console.error("Unexpected error in findOne:", error);
    res.status(500).send({
      message: "Internal server error occurred while finding user"
    });
  }
};

// Update a User identified by the userId in the request
exports.update = (req, res) => {
  try {
    // Validate user ID
    const idValidation = validateUserId(req.params.userId);
    
    if (!idValidation.isValid) {
      return res.status(400).send({
        message: idValidation.error
      });
    }

    // Validate request body (at least one field should be provided for update)
    const validation = validateInput(req.body);
    
    if (!validation.isValid) {
      return res.status(400).send({
        message: "Validation failed",
        errors: validation.errors
      });
    }

    // Check if at least one updateable field is provided
    const updateableFields = ['email', 'name', 'active'];
    const hasUpdateableField = updateableFields.some(field => 
      req.body.hasOwnProperty(field) && req.body[field] !== null && req.body[field] !== undefined
    );

    if (!hasUpdateableField) {
      return res.status(400).send({
        message: "At least one field (email, name, or active) must be provided for update"
      });
    }

    // Create update object with only provided fields
    const updateData = {};
    if (req.body.hasOwnProperty('email') && req.body.email !== null) updateData.email = req.body.email;
    if (req.body.hasOwnProperty('name') && req.body.name !== null) updateData.name = req.body.name;
    if (req.body.hasOwnProperty('active') && req.body.active !== null) updateData.active = req.body.active;

    User.updateById(idValidation.userId, new User(updateData), (err, data) => {
      if (err) {
        if (err.kind === "not_found") {
          return res.status(404).send({
            message: `Not found User with id ${idValidation.userId}.`
          });
        }
        console.error("Error updating user:", err);
        return res.status(500).send({
          message: "Error updating User with id " + idValidation.userId
        });
      }
      res.send(data);
    });

  } catch (error) {
    console.error("Unexpected error in update:", error);
    res.status(500).send({
      message: "Internal server error occurred while updating user"
    });
  }
};

// Delete a User with the specified userId in the request
exports.delete = (req, res) => {
  try {
    // Validate user ID
    const idValidation = validateUserId(req.params.userId);
    
    if (!idValidation.isValid) {
      return res.status(400).send({
        message: idValidation.error
      });
    }

    User.remove(idValidation.userId, (err, data) => {
      if (err) {
        if (err.kind === "not_found") {
          return res.status(404).send({
            message: `Not found User with id ${idValidation.userId}.`
          });
        }
        console.error("Error deleting user:", err);
        return res.status(500).send({
          message: "Could not delete User with id " + idValidation.userId
        });
      }
      res.send({ message: `User was deleted successfully!` });
    });

  } catch (error) {
    console.error("Unexpected error in delete:", error);
    res.status(500).send({
      message: "Internal server error occurred while deleting user"
    });
  }
};

// Delete all Users from the database
exports.deleteAll = (req, res) => {
  try {
    User.removeAll((err, data) => {
      if (err) {
        console.error("Error deleting all users:", err);
        return res.status(500).send({
          message: err.message || "Some error occurred while removing all users."
        });
      }
      res.send({ message: `All Users were deleted successfully!` });
    });
  } catch (error) {
    console.error("Unexpected error in deleteAll:", error);
    res.status(500).send({
      message: "Internal server error occurred while deleting all users"
    });
  }
};

// Export validation functions for testing
exports.validateInput = validateInput;
exports.validateUserId = validateUserId;