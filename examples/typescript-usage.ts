// TypeScript Usage Example for node-mysql-express library
// This example demonstrates how to use the Customer REST API with TypeScript

import express, { Request, Response, NextFunction, Application } from 'express';
import bodyParser from 'body-parser';
import mysql, { Pool, MysqlError, PoolConnection } from 'mysql';

// Type definitions
interface DatabaseConfig {
  HOST: string;
  USER: string;
  PASSWORD: string;
  DB: string;
}

interface CustomerData {
  email: string;
  name: string;
  active: boolean;
}

interface CustomerWithId extends CustomerData {
  id: number;
}

interface ApiError {
  kind?: string;
  message?: string;
}

type CustomerCallback<T> = (error: ApiError | null, result: T | null) => void;

// Initialize Express app
const app: Application = express();
const PORT: number = parseInt(process.env.PORT || '3000', 10);

// Middleware setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database configuration
const dbConfig: DatabaseConfig = {
  HOST: "localhost",
  USER: "your_username",
  PASSWORD: "your_password",
  DB: "your_database_name"
};

// Create MySQL connection pool
const connection: Pool = mysql.createPool({
  host: dbConfig.HOST,
  user: dbConfig.USER,
  password: dbConfig.PASSWORD,
  database: dbConfig.DB
});

// Customer class with TypeScript types
class Customer {
  public email: string;
  public name: string;
  public active: boolean;

  constructor(customer: CustomerData) {
    this.email = customer.email;
    this.name = customer.name;
    this.active = customer.active;
  }

  // Static method to create a customer
  static create(newCustomer: Customer, result: CustomerCallback<CustomerWithId>): void {
    connection.query("INSERT INTO customers SET ?", newCustomer, (err: MysqlError | null, res: any) => {
      if (err) {
        console.log("error: ", err);
        result(err, null);
        return;
      }
      console.log("created customer: ", { id: res.insertId, ...newCustomer });
      result(null, { id: res.insertId, ...newCustomer });
    });
  }

  // Static method to find all customers
  static findAll(result: CustomerCallback<CustomerWithId[]>): void {
    connection.query("SELECT * FROM customers", (err: MysqlError | null, res: CustomerWithId[]) => {
      if (err) {
        console.log("error: ", err);
        result(err, null);
        return;
      }
      console.log("customers: ", res);
      result(null, res);
    });
  }

  // Static method to find customer by ID
  static findById(customerId: number, result: CustomerCallback<CustomerWithId>): void {
    connection.query(
      `SELECT * FROM customers WHERE id = ?`, 
      [customerId], 
      (err: MysqlError | null, res: CustomerWithId[]) => {
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
      }
    );
  }

  // Static method to update customer by ID
  static updateById(id: number, customer: Customer, result: CustomerCallback<CustomerWithId>): void {
    connection.query(
      "UPDATE customers SET email = ?, name = ?, active = ? WHERE id = ?",
      [customer.email, customer.name, customer.active, id],
      (err: MysqlError | null, res: any) => {
        if (err) {
          console.log("error: ", err);
          result(err, null);
          return;
        }
        if (res.affectedRows === 0) {
          result({ kind: "not_found" }, null);
          return;
        }
        console.log("updated customer: ", { id: id, ...customer });
        result(null, { id: id, ...customer });
      }
    );
  }

  // Static method to remove customer by ID
  static remove(id: number, result: CustomerCallback<any>): void {
    connection.query("DELETE FROM customers WHERE id = ?", [id], (err: MysqlError | null, res: any) => {
      if (err) {
        console.log("error: ", err);
        result(err, null);
        return;
      }
      if (res.affectedRows === 0) {
        result({ kind: "not_found" }, null);
        return;
      }
      console.log("deleted customer with id: ", id);
      result(null, res);
    });
  }
}

// Controller interface
interface CustomerController {
  create(req: Request, res: Response): void;
  findAll(req: Request, res: Response): void;
  findOne(req: Request, res: Response): void;
  update(req: Request, res: Response): void;
  delete(req: Request, res: Response): void;
}

// Controllers with proper TypeScript typing
const customerController: CustomerController = {
  // Create and Save a new Customer
  create: (req: Request, res: Response): void => {
    if (!req.body) {
      res.status(400).send({
        message: "Content can not be empty!"
      });
      return;
    }

    const customerData: CustomerData = {
      email: req.body.email,
      name: req.body.name,
      active: req.body.active
    };

    const customer = new Customer(customerData);

    Customer.create(customer, (err: ApiError | null, data: CustomerWithId | null) => {
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
  findAll: (req: Request, res: Response): void => {
    Customer.findAll((err: ApiError | null, data: CustomerWithId[] | null) => {
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
  findOne: (req: Request, res: Response): void => {
    const customerId: number = parseInt(req.params.customerId, 10);
    
    Customer.findById(customerId, (err: ApiError | null, data: CustomerWithId | null) => {
      if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: `Not found Customer with id ${customerId}.`
          });
        } else {
          res.status(500).send({
            message: `Error retrieving Customer with id ${customerId}`
          });
        }
      } else {
        res.send(data);
      }
    });
  },

  // Update a Customer
  update: (req: Request, res: Response): void => {
    if (!req.body) {
      res.status(400).send({
        message: "Content can not be empty!"
      });
      return;
    }

    const customerId: number = parseInt(req.params.customerId, 10);
    const customerData: CustomerData = {
      email: req.body.email,
      name: req.body.name,
      active: req.body.active
    };

    Customer.updateById(
      customerId,
      new Customer(customerData),
      (err: ApiError | null, data: CustomerWithId | null) => {
        if (err) {
          if (err.kind === "not_found") {
            res.status(404).send({
              message: `Not found Customer with id ${customerId}.`
            });
          } else {
            res.status(500).send({
              message: `Error updating Customer with id ${customerId}`
            });
          }
        } else {
          res.send(data);
        }
      }
    );
  },

  // Delete a Customer
  delete: (req: Request, res: Response): void => {
    const customerId: number = parseInt(req.params.customerId, 10);
    
    Customer.remove(customerId, (err: ApiError | null, data: any) => {
      if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: `Not found Customer with id ${customerId}.`
          });
        } else {
          res.status(500).send({
            message: `Could not delete Customer with id ${customerId}`
          });
        }
      } else {
        res.send({ message: `Customer was deleted successfully!` });
      }
    });
  }
};

// Routes setup with proper typing
app.post("/customers", customerController.create);
app.get("/customers", customerController.findAll);
app.get("/customers/:customerId", customerController.findOne);
app.put("/customers/:customerId", customerController.update);
app.delete("/customers/:customerId", customerController.delete);

// Middleware example with TypeScript
interface User {
  id: number;
  name: string;
}

interface RequestWithUsers extends Request {
  users?: User[];
}

const middleware1 = (req: RequestWithUsers, res: Response, next: NextFunction): void => {
  const users: User[] = [
    { id: 1, name: "test3" },
    { id: 2, name: "test4" }
  ];
  req.users = users;
  next();
};

const middleware2 = (req: RequestWithUsers, res: Response): void => {
  const users = req.users;
  res.json({ user: users });
};

// Simple middleware route
app.get("/user", middleware1, middleware2);

// Basic route
app.get("/", (req: Request, res: Response): void => {
  res.json({ message: "Welcome to Customer Management API." });
});

// Start server
app.listen(PORT, (): void => {
  console.log(`Server is running on port ${PORT}.`);
});

// Export for testing or module usage
export { app, Customer, customerController };