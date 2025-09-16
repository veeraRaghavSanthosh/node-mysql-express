// Auth Controller for handling authentication
const authController = {};

// Mock user database (in real app, this would be in database)
const users = [
  { 
    id: 1, 
    email: 'test@example.com', 
    password: 'password123', 
    role: 'user',
    name: 'Test User'
  },
  { 
    id: 2, 
    email: 'admin@example.com', 
    password: 'admin123', 
    role: 'admin',
    name: 'Admin User'
  }
];

// Login function
authController.login = (req, res) => {
  try {
    // Validate request body
    if (!req.body) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Request body cannot be empty'
      });
    }

    const { email, password } = req.body;

    // Validate required fields
    if (!email) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Email is required'
      });
    }

    if (!password) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Password is required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid email format'
      });
    }

    // Find user
    const user = users.find(u => u.email === email);
    
    if (!user) {
      return res.status(401).json({
        error: 'Authentication Failed',
        message: 'Invalid email or password'
      });
    }

    // Validate password
    if (user.password !== password) {
      return res.status(401).json({
        error: 'Authentication Failed',
        message: 'Invalid email or password'
      });
    }

    // Generate token (simplified for testing)
    const token = user.role === 'admin' ? 'admin-token' : 'valid-token';

    // Return success response
    res.status(200).json({
      message: 'Login successful',
      token: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred during login'
    });
  }
};

// Register function
authController.register = (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Request body cannot be empty'
      });
    }

    const { email, password, name } = req.body;

    // Validate required fields
    if (!email || !password || !name) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Email, password, and name are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid email format'
      });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if user already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'User with this email already exists'
      });
    }

    // Create new user
    const newUser = {
      id: users.length + 1,
      email,
      password,
      name,
      role: 'user'
    };

    users.push(newUser);

    // Return success response (don't send password back)
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred during registration'
    });
  }
};

// Get current user profile
authController.profile = (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    res.status(200).json({
      message: 'Profile retrieved successfully',
      user: req.user
    });

  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred while retrieving profile'
    });
  }
};

module.exports = authController;