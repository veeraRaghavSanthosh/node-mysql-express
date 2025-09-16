const express = require('express');
const router = express.Router();

// Middleware to handle raw null/undefined bodies
const handleRawNullBody = (req, res, next) => {
  // Handle case where body is sent as raw "null" string
  if (req.body === null || (typeof req.body === 'string' && req.body === 'null')) {
    req.body = null;
  }
  next();
};

// Mock users data (in a real app, this would come from a database)
let users = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
];

// Validation middleware
const validateUserInput = (req, res, next) => {
  // Check if request body exists or is null/undefined
  if (!req.body || req.body === null || req.body === undefined) {
    return res.status(400).json({
      error: 'Request body is required'
    });
  }

  next();
};

// Get all users
router.get('/', (req, res) => {
  try {
    res.json({ users });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Get user by ID
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ID parameter
    if (!id || id === 'null' || id === 'undefined') {
      return res.status(400).json({
        error: 'Invalid user ID: ID cannot be null, undefined, or empty'
      });
    }

    const userId = parseInt(id);
    if (isNaN(userId)) {
      return res.status(400).json({
        error: 'Invalid user ID: ID must be a valid number'
      });
    }

    const user = users.find(u => u.id === userId);
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Create new user
router.post('/', handleRawNullBody, validateUserInput, (req, res) => {
  try {
    const { name, email } = req.body;

    // Validate required fields
    if (!name || name === null || name === undefined || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({
        error: 'Invalid name: name is required and must be a non-empty string'
      });
    }

    if (!email || email === null || email === undefined || typeof email !== 'string' || email.trim() === '') {
      return res.status(400).json({
        error: 'Invalid email: email is required and must be a non-empty string'
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Invalid email format'
      });
    }

    // Check if email already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(409).json({
        error: 'User with this email already exists'
      });
    }

    // Create new user
    const newUser = {
      id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
      name: name.trim(),
      email: email.trim()
    };

    users.push(newUser);
    
    res.status(201).json({ 
      message: 'User created successfully',
      user: newUser 
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Update user
router.put('/:id', handleRawNullBody, (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if request body exists or is null/undefined or empty object
    if (!req.body || req.body === null || req.body === undefined || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        error: 'Request body is required'
      });
    }
    
    const { name, email } = req.body;

    // Validate ID parameter
    if (!id || id === 'null' || id === 'undefined') {
      return res.status(400).json({
        error: 'Invalid user ID: ID cannot be null, undefined, or empty'
      });
    }

    const userId = parseInt(id);
    if (isNaN(userId)) {
      return res.status(400).json({
        error: 'Invalid user ID: ID must be a valid number'
      });
    }

    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Validate fields if provided
    if (name !== undefined) {
      if (name === null || typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({
          error: 'Invalid name: name must be a non-empty string'
        });
      }
      users[userIndex].name = name.trim();
    }

    if (email !== undefined) {
      if (email === null || typeof email !== 'string' || email.trim() === '') {
        return res.status(400).json({
          error: 'Invalid email: email must be a non-empty string'
        });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          error: 'Invalid email format'
        });
      }

      // Check if email already exists for another user
      const existingUser = users.find(u => u.email === email && u.id !== userId);
      if (existingUser) {
        return res.status(409).json({
          error: 'User with this email already exists'
        });
      }

      users[userIndex].email = email.trim();
    }

    res.json({ 
      message: 'User updated successfully',
      user: users[userIndex] 
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Delete user
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID parameter
    if (!id || id === 'null' || id === 'undefined') {
      return res.status(400).json({
        error: 'Invalid user ID: ID cannot be null, undefined, or empty'
      });
    }

    const userId = parseInt(id);
    if (isNaN(userId)) {
      return res.status(400).json({
        error: 'Invalid user ID: ID must be a valid number'
      });
    }

    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    const deletedUser = users.splice(userIndex, 1)[0];
    
    res.json({ 
      message: 'User deleted successfully',
      user: deletedUser 
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

module.exports = router;