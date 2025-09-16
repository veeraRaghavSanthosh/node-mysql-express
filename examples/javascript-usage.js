/**
 * Node.js Express MySQL Library - JavaScript Usage Example
 * 
 * This example demonstrates how to use the node-mysql-express library
 * for building RESTful APIs with Node.js, Express, and MySQL.
 */

const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql");

// Initialize Express app
const app = express();

// Database configuration
const dbConfig = {
  HOST: "localhost",
  USER: "your_username",
  PASSWORD: "your_password",
  DB: "your_database"
};

// Create MySQL connection pool
const connection = mysql.createPool({
  host: dbConfig.HOST,
  user: dbConfig.USER,
  password: dbConfig.PASSWORD,
  database: dbConfig.DB,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
});

// Middleware setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Authentication middleware (optional)
const authMiddleware = (req, res, next) => {
  // Add your authentication logic here
  // For example: validate JWT token, API key, etc.
  console.log("Authentication middleware executed");
  next();
};

// Apply auth middleware to API routes
app.use('/api/*', authMiddleware);

// Customer Model
const Customer = function(customer) {
  this.email = customer.email;
  this.name = customer.name;
  this.active = customer.active;
};

// Create customer
Customer.create = (newCustomer, result) => {
  connection.query("INSERT INTO customers SET ?", newCustomer, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    console.log("created customer: ", { id: res.insertId, ...newCustomer });
    result(null, { id: res.insertId, ...newCustomer });
  });
};

// Find customer by ID
Customer.findById = (customerId, result) => {
  connection.query(`SELECT * FROM customers WHERE id = ?`, [customerId], (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    if (res.length) {
      console.log("found customer: ", res[0]);
      result(null, res[0]);
      return;
    }
    result({ kind: "not_found" }, null);
  });
};

// Get all customers
Customer.getAll = (result) => {
  connection.query("SELECT * FROM customers", (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    console.log("customers: ", res);
    result(null, res);
  });
};

// Update customer by ID
Customer.updateById = (id, customer, result) => {
  connection.query(
    "UPDATE customers SET email = ?, name = ?, active = ? WHERE id = ?",
    [customer.email, customer.name, customer.active, id],
    (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }
      if (res.affectedRows == 0) {
        result({ kind: "not_found" }, null);
        return;
      }
      console.log("updated customer: ", { id: id, ...customer });
      result(null, { id: id, ...customer });
    }
  );
};

// Delete customer by ID
Customer.remove = (id, result) => {
  connection.query("DELETE FROM customers WHERE id = ?", id, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    if (res.affectedRows == 0) {
      result({ kind: "not_found" }, null);
      return;
    }
    console.log("deleted customer with id: ", id);
    result(null, res);
  });
};

// Controller functions
const customerController = {
  // Create and Save a new Customer
  create: (req, res) => {
    if (!req.body) {
      res.status(400).send({
        message: "Content can not be empty!"
      });
      return;
    }

    const customer = new Customer({
      email: req.body.email,
      name: req.body.name,
      active: req.body.active
    });

    Customer.create(customer, (err, data) => {
      if (err) {
        res.status(500).send({
          message: err.message || "Some error occurred while creating the Customer."
        });
      } else {
        res.send(data);
      }
    });
  },

  // Retrieve all Customers
  findAll: (req, res) => {
    Customer.getAll((err, data) => {
      if (err) {
        res.status(500).send({
          message: err.message || "Some error occurred while retrieving customers."
        });
      } else {
        res.send(data);
      }
    });
  },

  // Find a single Customer with a customerId
  findOne: (req, res) => {
    Customer.findById(req.params.customerId, (err, data) => {
      if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: `Not found Customer with id ${req.params.customerId}.`
          });
        } else {
          res.status(500).send({
            message: "Error retrieving Customer with id " + req.params.customerId
          });
        }
      } else {
        res.send(data);
      }
    });
  },

  // Update a Customer identified by the customerId
  update: (req, res) => {
    if (!req.body) {
      res.status(400).send({
        message: "Content can not be empty!"
      });
      return;
    }

    Customer.updateById(
      req.params.customerId,
      new Customer(req.body),
      (err, data) => {
        if (err) {
          if (err.kind === "not_found") {
            res.status(404).send({
              message: `Not found Customer with id ${req.params.customerId}.`
            });
          } else {
            res.status(500).send({
              message: "Error updating Customer with id " + req.params.customerId
            });
          }
        } else {
          res.send(data);
        }
      }
    );
  },

  // Delete a Customer with the specified customerId
  delete: (req, res) => {
    Customer.remove(req.params.customerId, (err, data) => {
      if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: `Not found Customer with id ${req.params.customerId}.`
          });
        } else {
          res.status(500).send({
            message: "Could not delete Customer with id " + req.params.customerId
          });
        }
      } else {
        res.send({ message: `Customer was deleted successfully!` });
      }
    });
  }
};

// Routes
app.post("/api/customers", customerController.create);
app.get("/api/customers", customerController.findAll);
app.get("/api/customers/:customerId", customerController.findOne);
app.put("/api/customers/:customerId", customerController.update);
app.delete("/api/customers/:customerId", customerController.delete);

// Custom middleware example
const dataMiddleware = (req, res, next) => {
  const users = [
    { id: 1, name: "John Doe" },
    { id: 2, name: "Jane Smith" }
  ];
  req.users = users;
  next();
};

const responseMiddleware = (req, res, next) => {
  const users = req.users;
  res.json({ users: users });
};

// Example route with middleware chain
app.get("/api/users", dataMiddleware, responseMiddleware);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).send({
    message: 'Route not found'
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

// Export for testing or module usage
module.exports = app;

/* 
Usage Examples:

1. Create a customer:
POST /api/customers
{
  "name": "John Doe",
  "email": "john@example.com",
  "active": true
}

2. Get all customers:
GET /api/customers

3. Get customer by ID:
GET /api/customers/1

4. Update customer:
PUT /api/customers/1
{
  "name": "John Updated",
  "email": "john.updated@example.com",
  "active": false
}

5. Delete customer:
DELETE /api/customers/1

6. Get users (middleware example):
GET /api/users
*/