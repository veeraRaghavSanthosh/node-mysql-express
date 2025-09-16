module.exports = app => {
  const auth = require("../controllers/auth.controller.js");
  const { authenticateToken, authorizeRoles, rateLimitAuth } = require("../middleware/auth.middleware.js");

  // Apply rate limiting to auth endpoints
  const authRateLimit = rateLimitAuth(5, 15 * 60 * 1000); // 5 attempts per 15 minutes

  // Public routes
  
  /**
   * @api {post} /api/auth/register Register a new user
   * @apiName RegisterUser
   * @apiGroup Authentication
   * @apiVersion 1.0.0
   * 
   * @apiParam {String} email User's email address (required)
   * @apiParam {String} name User's full name (required)
   * @apiParam {String} password User's password (min 6 characters) (required)
   * @apiParam {String} [role="user"] User's role (optional, defaults to "user")
   * 
   * @apiSuccess {Boolean} success Success status
   * @apiSuccess {String} message Success message
   * @apiSuccess {Object} data Response data
   * @apiSuccess {Object} data.user User object (without password)
   * @apiSuccess {String} data.token JWT authentication token
   * 
   * @apiSuccessExample Success-Response:
   *     HTTP/1.1 201 Created
   *     {
   *       "success": true,
   *       "message": "User registered successfully!",
   *       "data": {
   *         "user": {
   *           "id": 1,
   *           "email": "john@example.com",
   *           "name": "John Doe",
   *           "role": "user",
   *           "active": true,
   *           "created_at": "2023-01-01T00:00:00.000Z"
   *         },
   *         "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   *       }
   *     }
   * 
   * @apiError {Boolean} success Error status (false)
   * @apiError {String} message Error message
   * 
   * @apiErrorExample Error-Response:
   *     HTTP/1.1 400 Bad Request
   *     {
   *       "success": false,
   *       "message": "Email, name, and password are required!"
   *     }
   */
  app.post("/api/auth/register", authRateLimit, auth.register);

  /**
   * @api {post} /api/auth/login Login user
   * @apiName LoginUser
   * @apiGroup Authentication
   * @apiVersion 1.0.0
   * 
   * @apiParam {String} email User's email address (required)
   * @apiParam {String} password User's password (required)
   * 
   * @apiSuccess {Boolean} success Success status
   * @apiSuccess {String} message Success message
   * @apiSuccess {Object} data Response data
   * @apiSuccess {Object} data.user User object (without password)
   * @apiSuccess {String} data.token JWT authentication token
   * 
   * @apiSuccessExample Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *       "success": true,
   *       "message": "Login successful!",
   *       "data": {
   *         "user": {
   *           "id": 1,
   *           "email": "john@example.com",
   *           "name": "John Doe",
   *           "role": "user",
   *           "active": true,
   *           "created_at": "2023-01-01T00:00:00.000Z"
   *         },
   *         "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   *       }
   *     }
   * 
   * @apiError {Boolean} success Error status (false)
   * @apiError {String} message Error message
   * 
   * @apiErrorExample Error-Response:
   *     HTTP/1.1 401 Unauthorized
   *     {
   *       "success": false,
   *       "message": "Invalid email or password!"
   *     }
   */
  app.post("/api/auth/login", authRateLimit, auth.login);

  // Protected routes (require authentication)

  /**
   * @api {get} /api/auth/profile Get current user profile
   * @apiName GetProfile
   * @apiGroup Authentication
   * @apiVersion 1.0.0
   * 
   * @apiHeader {String} Authorization Bearer JWT token
   * @apiHeaderExample {json} Header-Example:
   *     {
   *       "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   *     }
   * 
   * @apiSuccess {Boolean} success Success status
   * @apiSuccess {String} message Success message
   * @apiSuccess {Object} data Response data
   * @apiSuccess {Object} data.user User object (without password)
   * 
   * @apiSuccessExample Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *       "success": true,
   *       "message": "Profile retrieved successfully!",
   *       "data": {
   *         "user": {
   *           "id": 1,
   *           "email": "john@example.com",
   *           "name": "John Doe",
   *           "role": "user",
   *           "active": true,
   *           "created_at": "2023-01-01T00:00:00.000Z"
   *         }
   *       }
   *     }
   */
  app.get("/api/auth/profile", authenticateToken, auth.getProfile);

  /**
   * @api {put} /api/auth/profile Update user profile
   * @apiName UpdateProfile
   * @apiGroup Authentication
   * @apiVersion 1.0.0
   * 
   * @apiHeader {String} Authorization Bearer JWT token
   * @apiParam {String} [email] User's email address
   * @apiParam {String} [name] User's full name
   * @apiParam {String} [role] User's role (admin only)
   * 
   * @apiSuccess {Boolean} success Success status
   * @apiSuccess {String} message Success message
   * @apiSuccess {Object} data Response data
   * @apiSuccess {Object} data.user Updated user object (without password)
   */
  app.put("/api/auth/profile", authenticateToken, auth.updateProfile);

  /**
   * @api {put} /api/auth/change-password Change user password
   * @apiName ChangePassword
   * @apiGroup Authentication
   * @apiVersion 1.0.0
   * 
   * @apiHeader {String} Authorization Bearer JWT token
   * @apiParam {String} currentPassword Current password (required)
   * @apiParam {String} newPassword New password (min 6 characters) (required)
   * 
   * @apiSuccess {Boolean} success Success status
   * @apiSuccess {String} message Success message
   * 
   * @apiSuccessExample Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *       "success": true,
   *       "message": "Password changed successfully!"
   *     }
   */
  app.put("/api/auth/change-password", authenticateToken, auth.changePassword);

  /**
   * @api {post} /api/auth/refresh-token Refresh JWT token
   * @apiName RefreshToken
   * @apiGroup Authentication
   * @apiVersion 1.0.0
   * 
   * @apiHeader {String} Authorization Bearer JWT token
   * 
   * @apiSuccess {Boolean} success Success status
   * @apiSuccess {String} message Success message
   * @apiSuccess {Object} data Response data
   * @apiSuccess {String} data.token New JWT token
   * 
   * @apiSuccessExample Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *       "success": true,
   *       "message": "Token refreshed successfully!",
   *       "data": {
   *         "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   *       }
   *     }
   */
  app.post("/api/auth/refresh-token", authenticateToken, auth.refreshToken);

  /**
   * @api {post} /api/auth/logout Logout user
   * @apiName LogoutUser
   * @apiGroup Authentication
   * @apiVersion 1.0.0
   * 
   * @apiHeader {String} Authorization Bearer JWT token
   * 
   * @apiSuccess {Boolean} success Success status
   * @apiSuccess {String} message Success message
   * 
   * @apiSuccessExample Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *       "success": true,
   *       "message": "Logout successful! Please remove the token from client storage."
   *     }
   */
  app.post("/api/auth/logout", authenticateToken, auth.logout);

  // Admin only routes

  /**
   * @api {get} /api/auth/users Get all users (Admin only)
   * @apiName GetAllUsers
   * @apiGroup Authentication
   * @apiVersion 1.0.0
   * 
   * @apiHeader {String} Authorization Bearer JWT token (Admin role required)
   * 
   * @apiSuccess {Boolean} success Success status
   * @apiSuccess {String} message Success message
   * @apiSuccess {Object} data Response data
   * @apiSuccess {Array} data.users Array of user objects (without passwords)
   */
  app.get("/api/auth/users", authenticateToken, authorizeRoles('admin'), (req, res) => {
    const User = require("../models/user.model.js");
    
    User.getAll((err, data) => {
      if (err) {
        res.status(500).send({
          success: false,
          message: err.message || "Some error occurred while retrieving users."
        });
        return;
      }
      
      res.send({
        success: true,
        message: "Users retrieved successfully!",
        data: {
          users: data
        }
      });
    });
  });
};