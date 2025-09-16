const express = require("express");
const bodyParser = require("body-parser");
const { securityHeaders } = require("./security-middleware.js");

const app = express();

// Apply security headers
app.use(securityHeaders);

const authMiddleware=(req,res,next)=>{
next()
}

// parse requests of content-type - application/json
app.use(bodyParser.json());
app.use('api/*',authMiddleware);

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