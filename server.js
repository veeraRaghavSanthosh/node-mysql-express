const express = require("express");
const bodyParser = require("body-parser");

const app = express();

// Basic security headers middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Simple rate limiting middleware
const rateLimit = {};
const createRateLimit = (windowMs = 15 * 60 * 1000, max = 100) => {
  return (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;

    if (!rateLimit[clientIP]) {
      rateLimit[clientIP] = [];
    }
    
    rateLimit[clientIP] = rateLimit[clientIP].filter(time => time > windowStart);
    
    if (rateLimit[clientIP].length >= max) {
      return res.status(429).json({
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
    
    rateLimit[clientIP].push(now);
    next();
  };
};

// Apply rate limiting to all routes
app.use(createRateLimit(15 * 60 * 1000, 100)); // 100 requests per 15 minutes

const authMiddleware=(req,res,next)=>{
next()
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


// set port, listen for requests
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
