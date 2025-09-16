const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require("../models/user.model.js");

// JWT Secret - In production, this should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
exports.register = (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send({
      success: false,
      message: "Content can not be empty!"
    });
    return;
  }

  // Validate required fields
  const { email, name, password } = req.body;
  if (!email || !name || !password) {
    res.status(400).send({
      success: false,
      message: "Email, name, and password are required!"
    });
    return;
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).send({
      success: false,
      message: "Please provide a valid email address!"
    });
    return;
  }

  // Validate password strength
  if (password.length < 6) {
    res.status(400).send({
      success: false,
      message: "Password must be at least 6 characters long!"
    });
    return;
  }

  // Check if user already exists
  User.findByEmail(email, (err, data) => {
    if (err && err.kind !== "not_found") {
      res.status(500).send({
        success: false,
        message: err.message || "Some error occurred while checking user existence."
      });
      return;
    }

    if (data) {
      res.status(409).send({
        success: false,
        message: "User with this email already exists!"
      });
      return;
    }

    // Create a User
    const user = new User({
      email: req.body.email,
      name: req.body.name,
      password: req.body.password,
      role: req.body.role || 'user'
    });

    // Save User in the database
    User.create(user, (err, data) => {
      if (err) {
        res.status(500).send({
          success: false,
          message: err.message || "Some error occurred while creating the User."
        });
        return;
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: data.id, 
          email: data.email,
          role: data.role 
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      // Remove password from response
      const { password, ...userWithoutPassword } = data;

      res.status(201).send({
        success: true,
        message: "User registered successfully!",
        data: {
          user: userWithoutPassword,
          token: token
        }
      });
    });
  });
};

/**
 * Login user
 * @route POST /api/auth/login
 * @access Public
 */
exports.login = (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send({
      success: false,
      message: "Content can not be empty!"
    });
    return;
  }

  const { email, password } = req.body;

  // Validate required fields
  if (!email || !password) {
    res.status(400).send({
      success: false,
      message: "Email and password are required!"
    });
    return;
  }

  // Find user by email
  User.findByEmail(email, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(401).send({
          success: false,
          message: "Invalid email or password!"
        });
        return;
      }
      res.status(500).send({
        success: false,
        message: "Error occurred while finding user."
      });
      return;
    }

    // Check if user is active
    if (!data.active) {
      res.status(401).send({
        success: false,
        message: "Account is deactivated. Please contact administrator."
      });
      return;
    }

    // Compare password
    User.comparePassword(password, data.password, (err, isMatch) => {
      if (err) {
        res.status(500).send({
          success: false,
          message: "Error occurred while verifying password."
        });
        return;
      }

      if (!isMatch) {
        res.status(401).send({
          success: false,
          message: "Invalid email or password!"
        });
        return;
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: data.id, 
          email: data.email,
          role: data.role 
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      // Remove password from response
      const { password: pwd, ...userWithoutPassword } = data;

      res.send({
        success: true,
        message: "Login successful!",
        data: {
          user: userWithoutPassword,
          token: token
        }
      });
    });
  });
};

/**
 * Get current user profile
 * @route GET /api/auth/profile
 * @access Private
 */
exports.getProfile = (req, res) => {
  User.findById(req.user.id, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          success: false,
          message: `User not found.`
        });
        return;
      }
      res.status(500).send({
        success: false,
        message: "Error retrieving user profile."
      });
      return;
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = data;

    res.send({
      success: true,
      message: "Profile retrieved successfully!",
      data: {
        user: userWithoutPassword
      }
    });
  });
};

/**
 * Update user profile
 * @route PUT /api/auth/profile
 * @access Private
 */
exports.updateProfile = (req, res) => {
  // Validate Request
  if (!req.body) {
    res.status(400).send({
      success: false,
      message: "Content can not be empty!"
    });
    return;
  }

  // Users can only update their own profile (except admins)
  const userId = req.user.id;

  User.updateById(userId, new User(req.body), (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          success: false,
          message: `User not found.`
        });
        return;
      }
      res.status(500).send({
        success: false,
        message: "Error updating user profile."
      });
      return;
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = data;

    res.send({
      success: true,
      message: "Profile updated successfully!",
      data: {
        user: userWithoutPassword
      }
    });
  });
};

/**
 * Change password
 * @route PUT /api/auth/change-password
 * @access Private
 */
exports.changePassword = (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Validate required fields
  if (!currentPassword || !newPassword) {
    res.status(400).send({
      success: false,
      message: "Current password and new password are required!"
    });
    return;
  }

  // Validate new password strength
  if (newPassword.length < 6) {
    res.status(400).send({
      success: false,
      message: "New password must be at least 6 characters long!"
    });
    return;
  }

  // Find user
  User.findById(req.user.id, (err, data) => {
    if (err) {
      res.status(500).send({
        success: false,
        message: "Error occurred while finding user."
      });
      return;
    }

    // Verify current password
    User.comparePassword(currentPassword, data.password, (err, isMatch) => {
      if (err) {
        res.status(500).send({
          success: false,
          message: "Error occurred while verifying current password."
        });
        return;
      }

      if (!isMatch) {
        res.status(401).send({
          success: false,
          message: "Current password is incorrect!"
        });
        return;
      }

      // Update password
      User.updateById(req.user.id, { password: newPassword }, (err, data) => {
        if (err) {
          res.status(500).send({
            success: false,
            message: "Error occurred while updating password."
          });
          return;
        }

        res.send({
          success: true,
          message: "Password changed successfully!"
        });
      });
    });
  });
};

/**
 * Refresh JWT token
 * @route POST /api/auth/refresh-token
 * @access Private
 */
exports.refreshToken = (req, res) => {
  // Generate new JWT token
  const token = jwt.sign(
    { 
      id: req.user.id, 
      email: req.user.email,
      role: req.user.role 
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  res.send({
    success: true,
    message: "Token refreshed successfully!",
    data: {
      token: token
    }
  });
};

/**
 * Logout user (client-side token removal)
 * @route POST /api/auth/logout
 * @access Private
 */
exports.logout = (req, res) => {
  // Note: With JWT, logout is typically handled client-side by removing the token
  // For server-side logout, you would need to implement a token blacklist
  
  res.send({
    success: true,
    message: "Logout successful! Please remove the token from client storage."
  });
};

module.exports = exports;