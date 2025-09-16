// JavaScript Usage Example for node-mysql-express library
// This example demonstrates how to use the Customer REST API

const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql");

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database configuration
const dbConfig = {
  HOST: "localhost",
  USER: "your_username", 
  PASSWORD: "your_password",
  DB: "your_database_name"
};

// Create MySQL connection pool
const connection = mysql.createPool({
  host: dbConfig.HOST,
  user: dbConfig.USER,
  password: dbConfig.PASSWORD,
  database: dbConfig.DB
});

// Customer model constructor
const Customer = function(customer) {
  this.email = customer.email;
  this.name = customer.name;
  this.active = customer.active;
};

// Customer CRUD operations
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

Customer.findAll = (result) => {
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

Customer.findById = (customerId, result) => {
  connection.query(`SELECT * FROM customers WHERE id = ${customerId}`, (err, res) => {
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

// Controllers
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
      if (err)
        res.status(500).send({
          message: err.message || "Some error occurred while creating the Customer."
        });
      else res.send(data);
    });
  },

  // Retrieve all Customers
  findAll: (req, res) => {
    Customer.findAll((err, data) => {
      if (err)
        res.status(500).send({
          message: err.message || "Some error occurred while retrieving customers."
        });
      else res.send(data);
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
      } else res.send(data);
    });
  },

  // Update a Customer
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
        } else res.send(data);
      }
    );
  },

  // Delete a Customer
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
      } else res.send({ message: `Customer was deleted successfully!` });
    });
  }
};

// Routes setup
app.post("/customers", customerController.create);
app.get("/customers", customerController.findAll);
app.get("/customers/:customerId", customerController.findOne);
app.put("/customers/:customerId", customerController.update);
app.delete("/customers/:customerId", customerController.delete);

// Simple middleware example
app.get("/user", (req, res, next) => {
  const users = [
    { id: 1, name: "test3" },
    { id: 2, name: "test4" }
  ];
  req.users = users;
  next();
}, (req, res) => {
  res.json({ user: req.users });
});

// Basic route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Customer Management API." });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

// Example usage with HTTP client (using fetch or axios)
/*
// Create a customer
fetch('http://localhost:3000/customers', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john.doe@example.com',
    active: true
  })
});

// Get all customers
fetch('http://localhost:3000/customers')
  .then(response => response.json())
  .then(data => console.log(data));

// Get customer by ID
fetch('http://localhost:3000/customers/1')
  .then(response => response.json())
  .then(data => console.log(data));

// Update customer
fetch('http://localhost:3000/customers/1', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'John Smith',
    email: 'john.smith@example.com',
    active: true
  })
});

// Delete customer
fetch('http://localhost:3000/customers/1', {
  method: 'DELETE'
});
*/