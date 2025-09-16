const express = require("express");
const bodyParser = require("body-parser");

const app = express();

const authMiddleware = (req, res, next) => {
  // Extract token from Authorization header
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Access denied. No token provided or invalid format.',
      message: 'Please provide a valid Bearer token in the Authorization header'
    });
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  
  if (!token) {
    return res.status(401).json({
      error: 'Access denied. Token is empty.',
      message: 'Please provide a valid token'
    });
  }

  // For now, we'll use a simple validation
  // In a real app, you'd verify JWT tokens here
  if (token === 'valid-token') {
    req.user = { id: 1, email: 'test@example.com', role: 'user' };
    next();
  } else if (token === 'admin-token') {
    req.user = { id: 2, email: 'admin@example.com', role: 'admin' };
    next();
  } else {
    return res.status(403).json({
      error: 'Access denied. Invalid token.',
      message: 'The provided token is not valid'
    });
  }
}

// parse requests of content-type - application/json
app.use(bodyParser.json());
app.use('api/*',authMiddleware);



 
// GET, PUT, POST, DELETE, 


// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));


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

// simple route
app.get("/user",middleware1 ,middleware2);

require("./app/routes/customer.routes.js")(app);

// Auth routes (not protected by authMiddleware)
const auth = require("./app/controllers/auth.controller.js");
app.post("/auth/login", auth.login);
app.post("/auth/register", auth.register);
app.get("/auth/profile", authMiddleware, auth.profile);


// set port, listen for requests
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
