// Example Auth Controller Implementation
// This shows how the auth APIs documented in AUTH_API_DOCUMENTATION.md could be implemented

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model.js');

// JWT Secret (should be in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

// Register User
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
        errors: {
          name: !name ? "Name is required" : undefined,
          email: !email ? "Email is required" : undefined,
          password: !password ? "Password is required" : undefined
        }
      });
    }

    // Check if user exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
        errors: {
          email: "User with this email already exists"
        }
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const userData = {
      name,
      email,
      password: hashedPassword
    };

    const newUser = await User.create(userData);
    const token = generateToken(newUser);

    // Remove password from response
    delete newUser.password;

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: newUser,
        token
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Login User
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
        errors: {
          email: !email ? "Email is required" : undefined,
          password: !password ? "Password is required" : undefined
        }
      });
    }

    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        errors: {
          email: "No user found with this email address"
        }
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
        errors: {
          auth: "Please check your credentials and try again"
        }
      });
    }

    // Update last login
    await User.updateLastLogin(user.id);

    // Generate token
    const token = generateToken(user);

    // Remove password from response
    delete user.password;

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          ...user,
          last_login: new Date().toISOString()
        },
        token,
        expiresIn: JWT_EXPIRES_IN
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Get User Profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Remove password from response
    delete user.password;

    res.status(200).json({
      success: true,
      message: "Profile retrieved successfully",
      data: {
        user
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Update User Profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email } = req.body;

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await User.findByEmail(email);
      if (existingUser && existingUser.id !== userId) {
        return res.status(409).json({
          success: false,
          message: "Email already in use",
          errors: {
            email: "Another user is already using this email address"
          }
        });
      }
    }

    // Update user
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;

    const updatedUser = await User.update(userId, updateData);

    // Remove password from response
    delete updatedUser.password;

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        user: updatedUser
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Change Password
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password confirmation does not match",
        errors: {
          confirmPassword: "New password and confirmation password must match"
        }
      });
    }

    // Get user
    const user = await User.findById(userId);
    
    // Check current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
        errors: {
          currentPassword: "Please provide the correct current password"
        }
      });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await User.updatePassword(userId, hashedNewPassword);

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
      data: {
        message: "Your password has been updated successfully"
      }
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Logout (if using token blacklist)
exports.logout = async (req, res) => {
  try {
    // In a real implementation, you might want to blacklist the token
    // For now, we'll just return success
    res.status(200).json({
      success: true,
      message: "Logout successful",
      data: {
        message: "You have been successfully logged out"
      }
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Auth Middleware
exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided",
      errors: {
        auth: "Authorization header is required"
      }
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
        errors: {
          auth: "Token is invalid or expired"
        }
      });
    }
    
    req.user = user;
    next();
  });
};