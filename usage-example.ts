/**
 * Node.js Express MySQL CRUD API - TypeScript Usage Example
 */

import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';

// Type definitions
interface CustomerData {
  id?: number;
  name: string;
  email: string;
  active: boolean;
}

interface CustomRequest extends Request {
  timestamp?: string;
  users?: Array<{ id: number; name: string }>;
}

// Initialize Express app
const app = express();

// Configure middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Authentication middleware
const authMiddleware = (req: CustomRequest, res: Response, next: NextFunction): void => {
  console.log('Authentication middleware executed');
  next();
};

app.use('/api/*', authMiddleware);

// Data processing middleware
const dataProcessingMiddleware = (req: CustomRequest, res: Response, next: NextFunction): void => {
  req.timestamp = new Date().toISOString();
  console.log(`Request received at: ${req.timestamp}`);
  next();
};

app.use(dataProcessingMiddleware);

// Customer controller with TypeScript
const customerController = {
  create: (req: Request, res: Response): void => {
    if (!req.body) {
      res.status(400).send({ message: "Content can not be empty!" });
      return;
    }

    const customer: CustomerData = {
      email: req.body.email,
      name: req.body.name,
      active: req.body.active
    };

    // Simulate database operation
    const createdCustomer: CustomerData = { id: Date.now(), ...customer };
    res.send(createdCustomer);
  },

  findAll: (req: Request, res: Response): void => {
    const customers: CustomerData[] = [
      { id: 1, name: "John Doe", email: "john@example.com", active: true },
      { id: 2, name: "Jane Smith", email: "jane@example.com", active: false }
    ];
    res.send(customers);
  },

  findOne: (req: Request, res: Response): void => {
    const customerId: number = parseInt(req.params.customerId);
    const customer: CustomerData = {
      id: customerId,
      name: "Sample Customer",
      email: "sample@example.com",
      active: true
    };
    res.send(customer);
  },

  update: (req: Request, res: Response): void => {
    const customerId: number = parseInt(req.params.customerId);
    const updatedCustomer: CustomerData = {
      id: customerId,
      name: req.body.name,
      email: req.body.email,
      active: req.body.active
    };
    res.send(updatedCustomer);
  },

  delete: (req: Request, res: Response): void => {
    const customerId: number = parseInt(req.params.customerId);
    res.send({ message: `Customer ${customerId} was deleted successfully!` });
  },

  deleteAll: (req: Request, res: Response): void => {
    res.send({ message: "All Customers were deleted successfully!" });
  }
};

// Define routes
app.post("/customers", customerController.create);
app.get("/customers", customerController.findAll);
app.get("/customers/:customerId", customerController.findOne);
app.put("/customers/:customerId", customerController.update);
app.delete("/customers/:customerId", customerController.delete);
app.delete("/customers", customerController.deleteAll);

// Health check route
app.get("/health", (req: Request, res: Response): void => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "Node.js Express MySQL API"
  });
});

// Error handling
app.use((err: Error, req: Request, res: Response, next: NextFunction): void => {
  console.error('Error:', err.message);
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message
  });
});

// 404 handler
app.use((req: Request, res: Response): void => {
  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.originalUrl} not found`
  });
});

// Start server
const PORT: number = parseInt(process.env.PORT || '3000');
app.listen(PORT, (): void => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`👥 Customers API: http://localhost:${PORT}/customers`);
});

export default app;