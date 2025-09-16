/**
 * Middleware Helper Functions
 * Contains reusable middleware functions to avoid code duplication
 */

/**
 * Authentication middleware placeholder
 * TODO: Implement actual authentication logic based on requirements
 * 
 * Edge cases handled:
 * - Currently passes through all requests (no-op for backward compatibility)
 * - Should be enhanced with proper token validation, session checks, etc.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object  
 * @param {Function} next - Express next middleware function
 */
const authMiddleware = (req, res, next) => {
  // EDGE CASE: Currently no authentication is performed
  // This maintains backward compatibility but should be enhanced
  // with proper authentication logic (JWT, session validation, etc.)
  next();
};

/**
 * User data provider middleware
 * Supplies mock user data to the request object
 * 
 * Edge cases handled:
 * - Returns empty array if no users available (prevents undefined errors)
 * - Hardcoded data should be replaced with database calls in production
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const userDataMiddleware = (req, res, next) => {
  try {
    // EDGE CASE: Hardcoded data - should be replaced with database query
    // in production environment to avoid stale data issues
    const users = [
      {
        "id": 1,
        "name": "test3"
      },
      {
        "id": 2, 
        "name": "test4"
      }
    ];
    
    // EDGE CASE: Ensure users array exists even if empty to prevent
    // downstream middleware from failing on undefined
    req.users = users || [];
    next();
  } catch (error) {
    // EDGE CASE: Handle any unexpected errors in middleware chain
    console.error('Error in userDataMiddleware:', error);
    req.users = []; // Provide fallback empty array
    next(); // Continue processing to maintain app stability
  }
};

/**
 * User response middleware
 * Sends user data as JSON response
 * 
 * Edge cases handled:
 * - Handles case where req.users might be undefined
 * - Provides consistent response format
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function (unused in this case)
 */
const userResponseMiddleware = (req, res, next) => {
  try {
    // EDGE CASE: Fallback to empty array if users is undefined
    // This prevents the API from returning undefined which could break clients
    const users = req.users || [];
    
    res.json({ user: users });
  } catch (error) {
    // EDGE CASE: Handle JSON serialization errors or response errors
    console.error('Error in userResponseMiddleware:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      user: [] 
    });
  }
};

module.exports = {
  authMiddleware,
  userDataMiddleware,
  userResponseMiddleware
};