const express = require("express");
const bodyParser = require("body-parser");
const { securityHeaders } = require("./security.middleware.js");

const app = express();

// Apply security headers first
app.use(securityHeaders);

// Existing auth middleware (preserved for backward compatibility)
const authMiddleware=(req,res,next)=>{
next()
}

// parse requests of content-type - application/json
app.use(bodyParser.json({ limit: '10mb' })); // Add size limit to prevent large payload attacks
app.use('api/*',authMiddleware);

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' })); // Add size limit

// Existing middleware functions (preserved for backward compatibility)
function middleware1 (req,res,next)  {
  // Logic to supply the data 

  const users=[
    {
        "id": 1,
        "name": "test3"
    },
    {
        "id": 2,
        "name": "test4"
    }
];
  req.users=users;
next();
  
};

function middleware2 (req,res,next){
  const users= req.users;
   res.json({ user:users });
 
 };

// simple route (preserved for backward compatibility)
app.get("/user",middleware1 ,middleware2);

// Customer routes with security middleware
require("./app/routes/customer.routes.js")(app);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    ...(process.env.NODE_ENV === 'development' && { error: err.message })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found'
  });
});

// set port, listen for requests
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});