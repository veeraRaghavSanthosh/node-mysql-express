const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const sql = require('../app/models/db.js');

// Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const SALT_ROUNDS = 10;

// Promisify SQL query method
const queryAsync = promisify(sql.query).bind(sql);

// Hash password using async/await
const hashPassword = async (password) => {
  try {
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    return hash;
  } catch (error) {
    throw new Error(`Password hashing failed: ${error.message}`);
  }
};

// Compare password using async/await
const comparePassword = async (password, hash) => {
  try {
    const result = await bcrypt.compare(password, hash);
    return result;
  } catch (error) {
    throw new Error(`Password comparison failed: ${error.message}`);
  }
};

// Generate JWT token using async/await
const generateToken = async (payload) => {
  try {
    const token = await new Promise((resolve, reject) => {
      jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' }, (err, token) => {
        if (err) reject(err);
        else resolve(token);
      });
    });
    return token;
  } catch (error) {
    throw new Error(`Token generation failed: ${error.message}`);
  }
};

// Verify JWT token using async/await
const verifyToken = async (token) => {
  try {
    const decoded = await new Promise((resolve, reject) => {
      jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) reject(err);
        else resolve(decoded);
      });
    });
    return decoded;
  } catch (error) {
    throw new Error(`Token verification failed: ${error.message}`);
  }
};

// Create user in database using async/await
const createUser = async (userData) => {
  const { email, name, password } = userData;
  
  try {
    // Check if user already exists
    const existingUsers = await queryAsync('SELECT * FROM users WHERE email = ?', [email]);
    
    if (existingUsers.length > 0) {
      throw new Error('User already exists');
    }
    
    // Hash password before storing
    const hashedPassword = await hashPassword(password);
    
    // Insert user into database
    const newUser = {
      email,
      name,
      password: hashedPassword,
      created_at: new Date()
    };
    
    const result = await queryAsync('INSERT INTO users SET ?', newUser);
    
    const createdUser = {
      id: result.insertId,
      email,
      name,
      created_at: newUser.created_at
    };
    
    return createdUser;
  } catch (error) {
    throw new Error(`User creation failed: ${error.message}`);
  }
};

// Authenticate user using async/await
const authenticateUser = async (email, password) => {
  try {
    // Find user by email
    const results = await queryAsync('SELECT * FROM users WHERE email = ?', [email]);
    
    if (results.length === 0) {
      throw new Error('User not found');
    }
    
    const user = results[0];
    
    // Compare password
    const isMatch = await comparePassword(password, user.password);
    
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }
    
    // Generate token
    const payload = {
      id: user.id,
      email: user.email,
      name: user.name
    };
    
    const token = await generateToken(payload);
    
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      token
    };
  } catch (error) {
    throw new Error(`Authentication failed: ${error.message}`);
  }
};

// Get user by ID using async/await
const getUserById = async (userId) => {
  try {
    const results = await queryAsync('SELECT id, email, name, created_at FROM users WHERE id = ?', [userId]);
    
    if (results.length === 0) {
      throw new Error('User not found');
    }
    
    return results[0];
  } catch (error) {
    throw new Error(`Failed to get user: ${error.message}`);
  }
};

// Update user password using async/await
const updatePassword = async (userId, oldPassword, newPassword) => {
  try {
    // First get the user's current password hash
    const results = await queryAsync('SELECT password FROM users WHERE id = ?', [userId]);
    
    if (results.length === 0) {
      throw new Error('User not found');
    }
    
    const currentHash = results[0].password;
    
    // Verify old password
    const isMatch = await comparePassword(oldPassword, currentHash);
    
    if (!isMatch) {
      throw new Error('Current password is incorrect');
    }
    
    // Hash new password
    const newHash = await hashPassword(newPassword);
    
    // Update password in database
    await queryAsync('UPDATE users SET password = ? WHERE id = ?', [newHash, userId]);
    
    return { message: 'Password updated successfully' };
  } catch (error) {
    throw new Error(`Password update failed: ${error.message}`);
  }
};

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  createUser,
  authenticateUser,
  getUserById,
  updatePassword
};