/**
 * API Usage Examples
 * This file demonstrates how to use the authentication API endpoints
 */

const axios = require('axios');

// Base URL for the API
const BASE_URL = 'http://localhost:3000';

// Example user data
const testUser = {
  email: 'test@example.com',
  name: 'Test User',
  password: 'password123'
};

/**
 * Example 1: User Registration
 */
async function registerUser() {
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/register`, testUser);
    console.log('Registration successful:', response.data);
    return response.data.data.token;
  } catch (error) {
    console.error('Registration failed:', error.response?.data || error.message);
  }
}

/**
 * Example 2: User Login
 */
async function loginUser() {
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    console.log('Login successful:', response.data);
    return response.data.data.token;
  } catch (error) {
    console.error('Login failed:', error.response?.data || error.message);
  }
}

/**
 * Example 3: Get User Profile (Protected Route)
 */
async function getUserProfile(token) {
  try {
    const response = await axios.get(`${BASE_URL}/api/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('Profile retrieved:', response.data);
    return response.data.data.user;
  } catch (error) {
    console.error('Profile retrieval failed:', error.response?.data || error.message);
  }
}

/**
 * Example 4: Update User Profile
 */
async function updateProfile(token, updates) {
  try {
    const response = await axios.put(`${BASE_URL}/api/auth/profile`, updates, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('Profile updated:', response.data);
    return response.data.data.user;
  } catch (error) {
    console.error('Profile update failed:', error.response?.data || error.message);
  }
}

/**
 * Example 5: Change Password
 */
async function changePassword(token, currentPassword, newPassword) {
  try {
    const response = await axios.put(`${BASE_URL}/api/auth/change-password`, {
      currentPassword,
      newPassword
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('Password changed:', response.data);
  } catch (error) {
    console.error('Password change failed:', error.response?.data || error.message);
  }
}

/**
 * Example 6: Refresh Token
 */
async function refreshToken(token) {
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/refresh-token`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('Token refreshed:', response.data);
    return response.data.data.token;
  } catch (error) {
    console.error('Token refresh failed:', error.response?.data || error.message);
  }
}

/**
 * Example 7: Admin - Get All Users
 */
async function getAllUsers(adminToken) {
  try {
    const response = await axios.get(`${BASE_URL}/api/auth/users`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    console.log('All users retrieved:', response.data);
    return response.data.data.users;
  } catch (error) {
    console.error('Get all users failed:', error.response?.data || error.message);
  }
}

/**
 * Example 8: Logout
 */
async function logoutUser(token) {
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/logout`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('Logout successful:', response.data);
  } catch (error) {
    console.error('Logout failed:', error.response?.data || error.message);
  }
}

/**
 * Complete Authentication Flow Example
 */
async function completeAuthFlow() {
  console.log('=== Complete Authentication Flow Example ===\n');

  try {
    // Step 1: Register a new user
    console.log('1. Registering new user...');
    let token = await registerUser();
    if (!token) return;

    // Step 2: Get user profile
    console.log('\n2. Getting user profile...');
    const profile = await getUserProfile(token);

    // Step 3: Update profile
    console.log('\n3. Updating profile...');
    await updateProfile(token, {
      name: 'Updated Test User'
    });

    // Step 4: Change password
    console.log('\n4. Changing password...');
    await changePassword(token, 'password123', 'newpassword123');

    // Step 5: Login with new password
    console.log('\n5. Logging in with new password...');
    testUser.password = 'newpassword123';
    token = await loginUser();

    // Step 6: Refresh token
    console.log('\n6. Refreshing token...');
    const newToken = await refreshToken(token);

    // Step 7: Logout
    console.log('\n7. Logging out...');
    await logoutUser(newToken || token);

    console.log('\n=== Authentication flow completed successfully! ===');

  } catch (error) {
    console.error('Authentication flow failed:', error);
  }
}

/**
 * Error Handling Examples
 */
async function errorHandlingExamples() {
  console.log('\n=== Error Handling Examples ===\n');

  // Example 1: Invalid credentials
  try {
    await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'nonexistent@example.com',
      password: 'wrongpassword'
    });
  } catch (error) {
    console.log('Expected error - Invalid credentials:', error.response.data);
  }

  // Example 2: Missing required fields
  try {
    await axios.post(`${BASE_URL}/api/auth/register`, {
      email: 'test@example.com'
      // missing name and password
    });
  } catch (error) {
    console.log('Expected error - Missing fields:', error.response.data);
  }

  // Example 3: Invalid token
  try {
    await axios.get(`${BASE_URL}/api/auth/profile`, {
      headers: {
        'Authorization': 'Bearer invalid-token'
      }
    });
  } catch (error) {
    console.log('Expected error - Invalid token:', error.response.data);
  }

  // Example 4: Insufficient permissions (non-admin accessing admin endpoint)
  const userToken = await loginUser();
  if (userToken) {
    try {
      await axios.get(`${BASE_URL}/api/auth/users`, {
        headers: {
          'Authorization': `Bearer ${userToken}`
        }
      });
    } catch (error) {
      console.log('Expected error - Insufficient permissions:', error.response.data);
    }
  }
}

/**
 * Rate Limiting Example
 */
async function rateLimitingExample() {
  console.log('\n=== Rate Limiting Example ===\n');
  
  console.log('Making multiple rapid login attempts to demonstrate rate limiting...');
  
  const promises = [];
  for (let i = 0; i < 6; i++) {
    promises.push(
      axios.post(`${BASE_URL}/api/auth/login`, {
        email: 'nonexistent@example.com',
        password: 'wrongpassword'
      }).catch(error => error.response)
    );
  }

  const responses = await Promise.all(promises);
  
  responses.forEach((response, index) => {
    console.log(`Attempt ${index + 1}:`, {
      status: response.status,
      message: response.data.message
    });
  });
}

/**
 * Run examples
 */
if (require.main === module) {
  // Check if server is running
  axios.get(`${BASE_URL}/health`)
    .then(() => {
      console.log('Server is running. Starting examples...\n');
      
      // Run examples
      completeAuthFlow()
        .then(() => errorHandlingExamples())
        .then(() => rateLimitingExample())
        .then(() => {
          console.log('\n=== All examples completed! ===');
          process.exit(0);
        })
        .catch(error => {
          console.error('Examples failed:', error);
          process.exit(1);
        });
    })
    .catch(() => {
      console.error('Server is not running. Please start the server first:');
      console.error('npm start or npm run dev');
      process.exit(1);
    });
}

// Export functions for use in other files
module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateProfile,
  changePassword,
  refreshToken,
  getAllUsers,
  logoutUser,
  completeAuthFlow,
  errorHandlingExamples,
  rateLimitingExample
};