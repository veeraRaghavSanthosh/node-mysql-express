const express = require("express");
const bodyParser = require("body-parser");

const app = express();

/**
 * Helper function to create a standardized auth middleware
 * Edge case: Currently passes through all requests - implement actual auth logic as needed
 * @param {Function} authLogic - Optional custom authentication logic
 * @returns {Function} Express middleware function
 */
const createAuthMiddleware = (authLogic = null) => {
  return (req, res, next) => {
    // Edge case: No auth logic provided, pass through (development mode)
    if (!authLogic) {
      return next();
    }
    
    try {
      authLogic(req, res, next);
    } catch (error) {
      // Edge case: Auth middleware throws error, return 401
      res.status(401).json({ message: "Authentication failed", error: error.message });
    }
  };
};

// Configure middleware stack
// Edge case: Order matters - JSON parser must come before URL encoded parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Edge case: Fixed path syntax - was 'api/*', should be '/api/*' for proper routing
app.use('/api/*', createAuthMiddleware());

/**
 * Helper function to create data provider middleware
 * Edge case: Handles cases where data might not be available or malformed
 * @param {Function} dataProvider - Function that returns data for the request
 * @param {string} dataKey - Key to attach data to req object
 * @returns {Function} Express middleware function
 */
const createDataProviderMiddleware = (dataProvider, dataKey = 'data') => {
  return (req, res, next) => {
    try {
      const data = dataProvider();
      
      // Edge case: Data provider returns null/undefined
      if (!data) {
        return res.status(500).json({ message: `No ${dataKey} available` });
      }
      
      req[dataKey] = data;
      next();
    } catch (error) {
      // Edge case: Data provider throws error
      res.status(500).json({ message: `Error fetching ${dataKey}`, error: error.message });
    }
  };
};

/**
 * Helper function to create JSON response middleware
 * Edge case: Handles cases where data might be missing from request
 * @param {string} dataKey - Key to read data from req object
 * @param {string} responseKey - Key to use in JSON response
 * @returns {Function} Express middleware function
 */
const createJsonResponseMiddleware = (dataKey = 'data', responseKey = null) => {
  return (req, res, next) => {
    const data = req[dataKey];
    
    // Edge case: Required data is missing from request
    if (!data) {
      return res.status(500).json({ message: `Missing ${dataKey} in request` });
    }
    
    const response = responseKey ? { [responseKey]: data } : data;
    res.json(response);
  };
};

// Mock user data provider
const getUsersData = () => {
  return [
    {
      "id": 1,
      "name": "test3"
    },
    {
      "id": 2,
      "name": "test4"
    }
  ];
};

// Example route using helper middlewares
// Edge case: Chain of middlewares ensures data is available before response
app.get("/user", 
  createDataProviderMiddleware(getUsersData, 'users'),
  createJsonResponseMiddleware('users', 'user')
);

require("./app/routes/customer.routes.js")(app);


// Server configuration
const PORT = process.env.PORT || 3000;

/**
 * Start the server with error handling
 * Edge case: Handle server startup failures gracefully
 */
const startServer = () => {
  try {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}.`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
