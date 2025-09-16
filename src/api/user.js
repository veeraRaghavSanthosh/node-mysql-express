// User API controller with input validation
const express = require('express');

/**
 * Validates user input data
 * @param {Object} userData - User data to validate
 * @returns {Object} - Validation result with isValid flag and errors array
 */
function validateUserInput(userData) {
  const errors = [];
  
  // Check if userData is null or undefined
  if (!userData) {
    errors.push('User data cannot be null or undefined');
    return { isValid: false, errors };
  }
  
  // Check if userData is an object
  if (typeof userData !== 'object') {
    errors.push('User data must be an object');
    return { isValid: false, errors };
  }
  
  // Validate required fields
  if (!userData.name || typeof userData.name !== 'string' || userData.name.trim() === '') {
    errors.push('Name is required and must be a non-empty string');
  }
  
  if (!userData.email || typeof userData.email !== 'string') {
    errors.push('Email is required and must be a string');
  } else {
    // Basic email validation - trim first for validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email.trim())) {
      errors.push('Email must be a valid email address');
    }
  }
  
  return { isValid: errors.length === 0, errors };
}

/**
 * Create a new user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createUser = (req, res) => {
  try {
    // Handle cases where body-parser might not parse correctly
    let requestBody = req.body;
    
    // If body-parser receives null, it might set req.body to {}
    // If body-parser receives a string, it might set req.body to {}
    // Check if the raw body was actually null or undefined
    if (req.body === null || req.body === undefined || 
        (typeof req.body === 'object' && Object.keys(req.body).length === 0 && req.get('content-length') === '0')) {
      requestBody = null;
    }
    
    // Validate request body
    const validation = validateUserInput(requestBody);
    
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }
    
    // Create user object with validated data
    const user = {
      id: Date.now(), // Simple ID generation for demo
      name: req.body.name.trim(),
      email: req.body.email.trim().toLowerCase(),
      active: req.body.active !== undefined ? req.body.active : true,
      createdAt: new Date().toISOString()
    };
    
    // In a real application, you would save to database here
    // For now, just return the created user
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user
    });
    
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Get user by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getUserById = (req, res) => {
  try {
    const userId = req.params.id;
    
    // Validate user ID
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    // Mock user data - in real app, fetch from database
    const mockUser = {
      id: userId,
      name: 'John Doe',
      email: 'john@example.com',
      active: true,
      createdAt: new Date().toISOString()
    };
    
    res.status(200).json({
      success: true,
      data: mockUser
    });
    
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Update user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateUser = (req, res) => {
  try {
    const userId = req.params.id;
    
    // Validate user ID
    if (!userId || userId.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    // Validate request body (allow partial updates)
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Update data cannot be empty'
      });
    }
    
    // Validate individual fields if provided
    const errors = [];
    
    if (req.body.name !== undefined) {
      if (typeof req.body.name !== 'string' || req.body.name.trim() === '') {
        errors.push('Name must be a non-empty string');
      }
    }
    
    if (req.body.email !== undefined) {
      if (typeof req.body.email !== 'string') {
        errors.push('Email must be a string');
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(req.body.email)) {
          errors.push('Email must be a valid email address');
        }
      }
    }
    
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    
    // Mock updated user - in real app, update in database
    const updatedUser = {
      id: userId,
      name: req.body.name ? req.body.name.trim() : 'John Doe',
      email: req.body.email ? req.body.email.trim().toLowerCase() : 'john@example.com',
      active: req.body.active !== undefined ? req.body.active : true,
      updatedAt: new Date().toISOString()
    };
    
    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    });
    
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Export the validation function for testing
exports.validateUserInput = validateUserInput;