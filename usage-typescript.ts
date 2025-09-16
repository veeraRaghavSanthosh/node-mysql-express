/**
 * Node.js Express MySQL API - TypeScript Usage Examples
 * 
 * Installation:
 * npm install express mysql body-parser
 * npm install --save-dev typescript @types/node @types/express @types/mysql ts-node nodemon
 */

import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';

// Type definitions
interface CustomerData {
  id?: number;
  email: string;
  name: string;
  active: boolean;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

// Customer class with TypeScript
class Customer {
  email: string;
  name: string;
  active: boolean;

  constructor(customer: CustomerData) {
    this.email = customer.email;
    this.name = customer.name;
    this.active = customer.active;
  }

  static create(newCustomer: Customer, callback: (err: any, data?: any) => void): void {
    // Mock implementation - replace with actual database call
    setTimeout(() => {
      const result = { id: Math.floor(Math.random() * 1000), ...newCustomer };
      callback(null, result);
    }, 100);
  }

  static findById(id: number, callback: (err: any, data?: any) => void): void {
    setTimeout(() => {
      if (id > 0) {
        callback(null, { id, email: "test@example.com", name: "Test User", active: true });
      } else {
        callback({ kind: "not_found" }, null);
      }
    }, 100);
  }

  static getAll(callback: (err: any, data?: any) => void): void {
    setTimeout(() => {
      const customers = [
        { id: 1, email: "user1@test.com", name: "User One", active: true },
        { id: 2, email: "user2@test.com", name: "User Two", active: false }
      ];
      callback(null, customers);
    }, 100);
  }

  static updateById(id: number, customer: Customer, callback: (err: any, data?: any) => void): void {
    setTimeout(() => {
      if (id > 0) {
        callback(null, { id, ...customer });
      } else {
        callback({ kind: "not_found" }, null);
      }
    }, 100);
  }

  static remove(id: number, callback: (err: any, data?: any) => void): void {
    setTimeout(() => {
      if (id > 0) {
        callback(null, { affectedRows: 1 });
      } else {
        callback({ kind: "not_found" }, null);
      }
    }, 100);
  }

  static removeAll(callback: (err: any, data?: any) => void): void {
    setTimeout(() => {
      callback(null, { affectedRows: 5 });
    }, 100);
  }
}

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Validation middleware
const validateCustomer = (req: Request, res: Response, next: NextFunction): void => {
  const { email, name } = req.body;
  
  if (!email?.includes('@')) {
    res.status(400).json({ success: false, message: "Valid email required" });
    return;
  }
  
  if (!name || name.length < 2) {
    res.status(400).json({ success: false, message: "Name must be at least 2 characters" });
    return;
  }
  
  next();
};

// API Routes
app.post('/api/customers', validateCustomer, (req: Request, res: Response): void => {
  const customer = new Customer(req.body);
  
  Customer.create(customer, (err: any, data: CustomerData) => {
    if (err) {
      res.status(500).json({ success: false, message: err.message });
    } else {
      res.status(201).json({ success: true, data, message: "Customer created" });
    }
  });
});

app.get('/api/customers', (req: Request, res: Response): void => {
  Customer.getAll((err: any, data: CustomerData[]) => {
    if (err) {
      res.status(500).json({ success: false, message: err.message });
    } else {
      res.json({ success: true, data, message: `Retrieved ${data.length} customers` });
    }
  });
});

app.get('/api/customers/:id', (req: Request, res: Response): void => {
  const id = parseInt(req.params.id, 10);
  
  if (isNaN(id)) {
    res.status(400).json({ success: false, message: "Invalid ID" });
    return;
  }
  
  Customer.findById(id, (err: any, data: CustomerData) => {
    if (err?.kind === "not_found") {
      res.status(404).json({ success: false, message: "Customer not found" });
    } else if (err) {
      res.status(500).json({ success: false, message: err.message });
    } else {
      res.json({ success: true, data, message: "Customer retrieved" });
    }
  });
});

app.put('/api/customers/:id', validateCustomer, (req: Request, res: Response): void => {
  const id = parseInt(req.params.id, 10);
  const customer = new Customer(req.body);

  Customer.updateById(id, customer, (err: any, data: CustomerData) => {
    if (err?.kind === "not_found") {
      res.status(404).json({ success: false, message: "Customer not found" });
    } else if (err) {
      res.status(500).json({ success: false, message: err.message });
    } else {
      res.json({ success: true, data, message: "Customer updated" });
    }
  });
});

app.delete('/api/customers/:id', (req: Request, res: Response): void => {
  const id = parseInt(req.params.id, 10);

  Customer.remove(id, (err: any) => {
    if (err?.kind === "not_found") {
      res.status(404).json({ success: false, message: "Customer not found" });
    } else if (err) {
      res.status(500).json({ success: false, message: err.message });
    } else {
      res.json({ success: true, message: "Customer deleted" });
    }
  });
});

app.delete('/api/customers', (req: Request, res: Response): void => {
  Customer.removeAll((err: any, data: any) => {
    if (err) {
      res.status(500).json({ success: false, message: err.message });
    } else {
      res.json({ success: true, message: "All customers deleted" });
    }
  });
});

// Error handling
app.use((req: Request, res: Response): void => {
  res.status(404).json({ success: false, message: "Route not found" });
});

const PORT = parseInt(process.env.PORT || '3000', 10);
app.listen(PORT, () => {
  console.log(`TypeScript server running on port ${PORT}`);
});

export default app;