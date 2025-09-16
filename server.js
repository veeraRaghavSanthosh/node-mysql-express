const express = require("express");
const bodyParser = require("body-parser");
const {
  apiLimiter,
  speedLimiter,
  securityHeaders,
  securityLogger,
  sanitizeInput
} = require("./app/middleware/security.middleware");

const app = express();

const authMiddleware=(req,res,next)=>{
next()
}

// Apply security middleware
app.use(securityHeaders);
app.use(securityLogger);
app.use(speedLimiter);
app.use('/customers', apiLimiter);

// parse requests of content-type - application/json
app.use(bodyParser.json({ limit: '10mb' }));
app.use(sanitizeInput);
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


// set port, listen for requests
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
