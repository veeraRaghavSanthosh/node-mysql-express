const express = require("express");
const bodyParser = require("body-parser");

const app = express();

// Helper function for authentication middleware
// Edge case: Currently passes through all requests - implement actual auth logic as needed
const authMiddleware = (req, res, next) => {
    // TODO: Add actual authentication logic here
    // Edge case: Consider handling missing auth headers, invalid tokens, etc.
    next();
};

// Helper function to create user data middleware
// Extracts repeated pattern of attaching data to request object
const createDataMiddleware = (dataKey, dataValue) => {
    return (req, res, next) => {
        // Edge case: Validate that dataKey is a string and not empty
        if (typeof dataKey !== 'string' || !dataKey.trim()) {
            return res.status(500).json({ error: 'Invalid data key provided to middleware' });
        }
        
        req[dataKey] = dataValue;
        next();
    };
};

// Helper function to create response middleware
// Extracts repeated pattern of sending JSON responses
const createResponseMiddleware = (dataKey, responseKey = 'data') => {
    return (req, res, next) => {
        // Edge case: Handle missing data on request object
        if (!req[dataKey]) {
            return res.status(500).json({ error: `Missing ${dataKey} data in request` });
        }
        
        const responseData = req[dataKey];
        res.json({ [responseKey]: responseData });
    };
};

// Configure body parsing middleware
// Edge case: Set limits to prevent payload too large errors
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Apply authentication middleware to API routes
// Edge case: Pattern 'api/*' may not match '/api/...' - consider using '/api/*' if needed
app.use('api/*', authMiddleware);

// Sample user data - in production, this should come from a database
const sampleUsers = [
    {
        "id": 1,
        "name": "test3"
    },
    {
        "id": 2,
        "name": "test4"
    }
];

// Create reusable middleware using helpers
const userDataMiddleware = createDataMiddleware('users', sampleUsers);
const userResponseMiddleware = createResponseMiddleware('users', 'user');

// User route using refactored middleware helpers
// Edge case: Route responds with user data - ensure data exists before sending response
app.get("/user", userDataMiddleware, userResponseMiddleware);

// Load customer routes
// Edge case: Ensure customer routes file exists and exports a valid function
try {
    require("./app/routes/customer.routes.js")(app);
} catch (error) {
    console.error("Failed to load customer routes:", error.message);
    // Edge case: Server can still run without customer routes for basic functionality
}

// Server configuration and startup
// Edge case: Use environment PORT if available, fallback to 3000
const PORT = process.env.PORT || 3000;

// Edge case: Handle server startup errors gracefully
app.listen(PORT, (error) => {
    if (error) {
        console.error(`Failed to start server on port ${PORT}:`, error.message);
        process.exit(1);
    }
    console.log(`Server is running on port ${PORT}.`);
});
