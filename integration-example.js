// Example of how to integrate the new user API into the existing server
// This file demonstrates backward compatibility

const express = require("express");
const bodyParser = require("body-parser");

const app = express();

// Existing middleware
const authMiddleware = (req, res, next) => {
    next();
};

// Parse requests
app.use(bodyParser.json());
app.use('api/*', authMiddleware);
app.use(bodyParser.urlencoded({ extended: true }));

// EXISTING CODE - Keep backward compatibility
function middleware1(req, res, next) {
    // Logic to supply the data 
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
    req.users = users;
    next();
}

function middleware2(req, res, next) {
    const users = req.users;
    res.json({ user: users });
}

// EXISTING ROUTE - Maintain backward compatibility
app.get("/user", middleware1, middleware2);

// NEW USER API - Enhanced with validation and error handling
const userRouter = require("./src/api/user");
app.use("/api/users", userRouter);

// Existing customer routes
require("./app/routes/customer.routes.js")(app);

// Error handling middleware for the new API
app.use((error, req, res, next) => {
    console.error('API Error:', error);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

// Set port, listen for requests
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
    console.log(`
Available endpoints:
- GET  /user (legacy endpoint)
- GET  /api/users (new endpoint)
- GET  /api/users/:id
- POST /api/users
- PUT  /api/users/:id
- DELETE /api/users/:id
- GET  /api/users/search/:query
    `);
});

module.exports = app;