/**
 * Node.js Express MySQL Library - TypeScript Usage Example
 * 
 * This example demonstrates how to use the node-mysql-express library
 * with TypeScript for building RESTful APIs with proper type safety.
 */

import express, { Request, Response, NextFunction, Application } from 'express';
import bodyParser from 'body-parser';
import mysql, { Pool, PoolConnection, MysqlError } from 'mysql';

// Type definitions
interface DatabaseConfig {
  HOST: string;
  USER: string;
  PASSWORD: string;
  DB: string;
}

interface CustomerData {
  id?: number;
  email: string;
  name: string;
  active: boolean;
}

interface ApiResponse<T = any> {
  message?: string;
  data?: T;
  error?: string;
}

interface AuthenticatedRequest extends Request {
  user?: any;
  users?: any[];
}

// Database configuration
const dbConfig: DatabaseConfig = {
  HOST: "localhost",
  USER: "your_username", 
  PASSWORD: "your_password",
  DB: "your_database"
};

// Create MySQL connection pool with proper typing
const connection: Pool = mysql.createPool({
  host: dbConfig.HOST,
  user: dbConfig.USER,
  password: dbConfig.PASSWORD,
  database: dbConfig.DB,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
});

// Initialize Express app
const app: Application = express();

// Middleware setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Authentication middleware with proper typing
const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  // Add your authentication logic here
  // For example: validate JWT token, API key, etc.
  console.log("Authentication middleware executed");
  
  // Example: Add user to request object
  // req.user = { id: 1, username: 'admin' };
  
  next();
};

// Apply auth middleware to API routes
app.use('/api/*', authMiddleware);

// Customer class with proper typing
class Customer {
  public email: string;
  public name: string;
  public active: boolean;
  public id?: number;

  constructor(customer: CustomerData) {
    this.email = customer.email;
    this.name = customer.name;
    this.active = customer.active;
    this.id = customer.id;
  }

  // Create customer with callback typing
  static create(newCustomer: Customer, result: (err: MysqlError | null, data?: CustomerData) => void): void {
    connection.query("INSERT INTO customers SET ?", newCustomer, (err: MysqlError | null, res: any) => {
      if (err) {
        console.log("error: ", err);
        result(err, undefined);
        return;
      }
      const createdCustomer: CustomerData = { id: res.insertId, ...newCustomer };
      console.log("created customer: ", createdCustomer);
      result(null, createdCustomer);
    });
  }

  // Find customer by ID with proper error handling
  static findById(customerId: number, result: (err: any, data?: CustomerData) => void): void {
    connection.query(`SELECT * FROM customers WHERE id = ?`, [customerId], (err: MysqlError | null, res: any[]) => {
      if (err) {
        console.log("error: ", err);
        result(err, undefined);
        return;
      }
      if (res.length) {
        console.log("found customer: ", res[0]);
        result(null, res[0] as CustomerData);
        return;
      }
      result({ kind: "not_found" }, undefined);
    });
  }

  // Get all customers
  static getAll(result: (err: MysqlError | null, data?: CustomerData[]) => void): void {
    connection.query("SELECT * FROM customers", (err: MysqlError | null, res: any[]) => {
      if (err) {
        console.log("error: ", err);
        result(err, undefined);
        return;
      }
      console.log("customers: ", res);
      result(null, res as CustomerData[]);
    });
  }

  // Update customer by ID
  static updateById(id: number, customer: Customer, result: (err: any, data?: CustomerData) => void): void {
    connection.query(
      "UPDATE customers SET email = ?, name = ?, active = ? WHERE id = ?",
      [customer.email, customer.name, customer.active, id],
      (err: MysqlError | null, res: any) => {
        if (err) {
          console.log("error: ", err);
          result(err, undefined);
          return;
        }
        if (res.affectedRows === 0) {
          result({ kind: "not_found" }, undefined);
          return;
        }
        const updatedCustomer: CustomerData = { id: id, ...customer };
        console.log("updated customer: ", updatedCustomer);
        result(null, updatedCustomer);
      }
    );
  }

  // Delete customer by ID
  static remove(id: number, result: (err: any, data?: any) => void): void {
    connection.query("DELETE FROM customers WHERE id = ?", [id], (err: MysqlError | null, res: any) => {
      if (err) {
        console.log("error: ", err);
        result(err, undefined);
        return;
      }
      if (res.affectedRows === 0) {
        result({ kind: "not_found" }, undefined);
        return;
      }
      console.log("deleted customer with id: ", id);
      result(null, res);
    });
  }
}

// Controller class with proper typing
class CustomerController {
  // Create and Save a new Customer
  static create(req: Request, res: Response): void {
    if (!req.body) {
      res.status(400).send({
        message: "Content can not be empty!"
      } as ApiResponse);
      return;
    }

    const customerData: CustomerData = {
      email: req.body.email,
      name: req.body.name,
      active: req.body.active
    };

    const customer = new Customer(customerData);

    Customer.create(customer, (err: MysqlError | null, data?: CustomerData) => {
      if (err) {
        res.status(500).send({
          message: err.message || "Some error occurred while creating the Customer."
        } as ApiResponse);
      } else {
        res.send(data);
      }
    });
  }

  // Retrieve all Customers
  static findAll(req: Request, res: Response): void {
    Customer.getAll((err: MysqlError | null, data?: CustomerData[]) => {
      if (err) {
        res.status(500).send({
          message: err.message || "Some error occurred while retrieving customers."
        } as ApiResponse);
      } else {
        res.send(data);
      }
    });
  }

  // Find a single Customer with a customerId
  static findOne(req: Request, res: Response): void {
    const customerId: number = parseInt(req.params.customerId);
    
    if (isNaN(customerId)) {
      res.status(400).send({
        message: "Invalid customer ID"
      } as ApiResponse);
      return;
    }

    Customer.findById(customerId, (err: any, data?: CustomerData) => {
      if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: `Not found Customer with id ${customerId}.`
          } as ApiResponse);
        } else {
          res.status(500).send({
            message: "Error retrieving Customer with id " + customerId
          } as ApiResponse);
        }
      } else {
        res.send(data);
      }
    });
  }

  // Update a Customer identified by the customerId
  static update(req: Request, res: Response): void {
    if (!req.body) {
      res.status(400).send({
        message: "Content can not be empty!"
      } as ApiResponse);
      return;
    }

    const customerId: number = parseInt(req.params.customerId);
    
    if (isNaN(customerId)) {
      res.status(400).send({
        message: "Invalid customer ID"
      } as ApiResponse);
      return;
    }

    const customerData: CustomerData = {
      email: req.body.email,
      name: req.body.name,
      active: req.body.active
    };

    Customer.updateById(
      customerId,
      new Customer(customerData),
      (err: any, data?: CustomerData) => {
        if (err) {
          if (err.kind === "not_found") {
            res.status(404).send({
              message: `Not found Customer with id ${customerId}.`
            } as ApiResponse);
          } else {
            res.status(500).send({
              message: "Error updating Customer with id " + customerId
            } as ApiResponse);
          }
        } else {
          res.send(data);
        }
      }
    );
  }

  // Delete a Customer with the specified customerId
  static delete(req: Request, res: Response): void {
    const customerId: number = parseInt(req.params.customerId);
    
    if (isNaN(customerId)) {
      res.status(400).send({
        message: "Invalid customer ID"
      } as ApiResponse);
      return;
    }

    Customer.remove(customerId, (err: any, data?: any) => {
      if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: `Not found Customer with id ${customerId}.`
          } as ApiResponse);
        } else {
          res.status(500).send({
            message: "Could not delete Customer with id " + customerId
          } as ApiResponse);
        }
      } else {
        res.send({ 
          message: `Customer was deleted successfully!` 
        } as ApiResponse);
      }
    });
  }
}

// Routes with proper typing
app.post("/api/customers", CustomerController.create);
app.get("/api/customers", CustomerController.findAll);
app.get("/api/customers/:customerId", CustomerController.findOne);
app.put("/api/customers/:customerId", CustomerController.update);
app.delete("/api/customers/:customerId", CustomerController.delete);

// Custom middleware with proper typing
const dataMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const users = [
    { id: 1, name: "John Doe" },
    { id: 2, name: "Jane Smith" }
  ];
  req.users = users;
  next();
};

const responseMiddleware = (req: AuthenticatedRequest, res: Response): void => {
  const users = req.users;
  res.json({ users: users });
};

// Example route with middleware chain
app.get("/api/users", dataMiddleware, responseMiddleware);

// Error handling middleware with proper typing
app.use((err: Error, req: Request, res: Response, next: NextFunction): void => {
  console.error(err.stack);
  res.status(500).send({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err.message
  } as ApiResponse);
});

// 404 handler
app.use((req: Request, res: Response): void => {
  res.status(404).send({
    message: 'Route not found'
  } as ApiResponse);
});

// Start server
const PORT: number = parseInt(process.env.PORT || '3000');
app.listen(PORT, (): void => {
  console.log(`Server is running on port ${PORT}.`);
});

// Export for testing or module usage
export default app;