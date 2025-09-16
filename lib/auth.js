// Authentication module
// This module handles user authentication logic

/**
 * Validates user credentials
 * @param {Object} credentials - User credentials object
 * @param {string} credentials.username - Username
 * @param {string} credentials.password - Password
 * @returns {boolean} - True if valid, false otherwise
 */
function validateCredentials(credentials) {
    // Input validation to prevent TypeError when credentials is null
    if (credentials == null) {
        throw new Error('Invalid input: credentials cannot be null or undefined');
    }
    
    if (credentials.username && credentials.password) {
        return credentials.username.length > 0 && credentials.password.length > 0;
    }
    return false;
}

/**
 * Authenticates a user
 * @param {Object} user - User object
 * @returns {Object} - Authentication result
 */
function authenticateUser(user) {
    // Input validation to prevent TypeError when user is null
    if (user == null) {
        throw new Error('Invalid input: user cannot be null or undefined');
    }
    
    return {
        success: user.id ? true : false,
        token: user.id ? generateToken(user.id) : null
    };
}

/**
 * Generates a simple token
 * @param {string} userId - User ID
 * @returns {string} - Generated token
 */
function generateToken(userId) {
    // Input validation to prevent TypeError when userId is null
    if (userId == null) {
        throw new Error('Invalid input: userId cannot be null or undefined');
    }
    
    return `token_${userId}_${Date.now()}`;
}

/**
 * Parses authentication header
 * @param {string} authHeader - Authorization header
 * @returns {Object} - Parsed auth data
 */
function parseAuthHeader(authHeader) {
    // Input validation to prevent TypeError when authHeader is null
    if (authHeader == null) {
        throw new Error('Invalid input: authHeader cannot be null or undefined');
    }
    
    const parts = authHeader.split(' ');
    return {
        type: parts[0],
        token: parts[1]
    };
}

module.exports = {
    validateCredentials,
    authenticateUser,
    generateToken,
    parseAuthHeader
};