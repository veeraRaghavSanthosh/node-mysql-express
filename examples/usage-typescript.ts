/**
 * TypeScript Usage Example for Node.js Express MySQL CRUD API
 * 
 * This example demonstrates how to use the customer management API
 * with proper TypeScript types and interfaces
 */

import express, { Application, Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import axios, { AxiosInstance, AxiosResponse } from 'axios';

// Type definitions
interface CustomerData {
  email: string;
  name: string;
  active: boolean;
}

interface Customer extends CustomerData {
  id: number;
}

interface CustomerModel {
  email: string;
  name: string;
  active: boolean;
}

interface DatabaseResult {
  insertId?: number;
  affectedRows?: number;
}

interface ApiError {
  kind?: string;
  message?: string;
}

interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

// Callback type definitions
type CustomerCallback<T> = (error: ApiError | null, data: T | null) => void;

// Example 1: TypeScript server setup with proper typing
class ExpressServer {
  private app: Application;
  private port: number;

  constructor(port: number = 3000) {
    this.app = express();
    this.port = port;
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    // Body parser middleware
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));

    // Custom authentication middleware with proper typing
    const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
      // Add your authentication logic here
      console.log('Authentication middleware executed');
      next();
    };

    this.app.use('/api/*', authMiddleware);

    // Error handling middleware
    this.app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
      console.error('Server error:', err.stack);
      res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
      });
    });
  }

  private setupRoutes(): void {
    // Load customer routes (assuming they exist)
    // require('../app/routes/customer.routes')(this.app);
    
    // 404 handler
    this.app.use((req: Request, res: Response) => {
      res.status(404).json({
        message: 'Route not found'
      });
    });
  }

  public getApp(): Application {
    return this.app;
  }

  public start(): Promise<void> {
    return new Promise((resolve) => {
      this.app.listen(this.port, () => {
        console.log(`Server is running on port ${this.port}`);
        resolve();
      });
    });
  }
}

// Example 2: TypeScript Customer Model class
class CustomerModel {
  public email: string;
  public name: string;
  public active: boolean;

  constructor(customer: CustomerData) {
    this.email = customer.email;
    this.name = customer.name;
    this.active = customer.active;
  }

  // Static methods with proper typing
  static create(newCustomer: CustomerModel, callback: CustomerCallback<Customer>): void {
    // Simulate database operation
    const customer: Customer = {
      id: Math.floor(Math.random() * 1000),
      ...newCustomer
    };
    
    setTimeout(() => {
      callback(null, customer);
    }, 100);
  }

  static findById(customerId: number, callback: CustomerCallback<Customer>): void {
    // Simulate database operation
    setTimeout(() => {
      if (customerId <= 0) {
        callback({ kind: "not_found" }, null);
        return;
      }
      
      const customer: Customer = {
        id: customerId,
        email: 'example@test.com',
        name: 'Test User',
        active: true
      };
      
      callback(null, customer);
    }, 100);
  }

  static getAll(callback: CustomerCallback<Customer[]>): void {
    // Simulate database operation
    const customers: Customer[] = [
      { id: 1, email: 'user1@test.com', name: 'User 1', active: true },
      { id: 2, email: 'user2@test.com', name: 'User 2', active: false }
    ];
    
    setTimeout(() => {
      callback(null, customers);
    }, 100);
  }

  static updateById(
    id: number, 
    customer: CustomerModel, 
    callback: CustomerCallback<Customer>
  ): void {
    // Simulate database operation
    setTimeout(() => {
      if (id <= 0) {
        callback({ kind: "not_found" }, null);
        return;
      }
      
      const updatedCustomer: Customer = { id, ...customer };
      callback(null, updatedCustomer);
    }, 100);
  }

  static remove(id: number, callback: CustomerCallback<DatabaseResult>): void {
    // Simulate database operation
    setTimeout(() => {
      if (id <= 0) {
        callback({ kind: "not_found" }, null);
        return;
      }
      
      callback(null, { affectedRows: 1 });
    }, 100);
  }

  static removeAll(callback: CustomerCallback<DatabaseResult>): void {
    // Simulate database operation
    setTimeout(() => {
      callback(null, { affectedRows: 5 });
    }, 100);
  }
}

// Example 3: TypeScript API client with proper error handling
class CustomerAPIClient {
  private axios: AxiosInstance;
  private baseURL: string;

  constructor(baseURL: string = 'http://localhost:3000') {
    this.baseURL = baseURL;
    this.axios = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 5000
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.axios.interceptors.request.use(
      (config) => {
        console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.axios.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        const message = error.response?.data?.message || error.message;
        console.error(`API Error: ${message}`);
        return Promise.reject(new Error(message));
      }
    );
  }

  async createCustomer(customerData: CustomerData): Promise<Customer> {
    try {
      const response: AxiosResponse<Customer> = await this.axios.post('/customers', customerData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create customer: ${error}`);
    }
  }

  async getAllCustomers(): Promise<Customer[]> {
    try {
      const response: AxiosResponse<Customer[]> = await this.axios.get('/customers');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get customers: ${error}`);
    }
  }

  async getCustomerById(id: number): Promise<Customer> {
    try {
      const response: AxiosResponse<Customer> = await this.axios.get(`/customers/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get customer: ${error}`);
    }
  }

  async updateCustomer(id: number, customerData: CustomerData): Promise<Customer> {
    try {
      const response: AxiosResponse<Customer> = await this.axios.put(`/customers/${id}`, customerData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update customer: ${error}`);
    }
  }

  async deleteCustomer(id: number): Promise<ApiResponse<void>> {
    try {
      const response: AxiosResponse<ApiResponse<void>> = await this.axios.delete(`/customers/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to delete customer: ${error}`);
    }
  }

  async deleteAllCustomers(): Promise<ApiResponse<void>> {
    try {
      const response: AxiosResponse<ApiResponse<void>> = await this.axios.delete('/customers');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to delete all customers: ${error}`);
    }
  }
}

// Example 4: Service class with business logic
class CustomerService {
  private apiClient: CustomerAPIClient;

  constructor(apiClient: CustomerAPIClient) {
    this.apiClient = apiClient;
  }

  async validateAndCreateCustomer(customerData: CustomerData): Promise<Customer> {
    // Validation logic
    if (!customerData.email || !customerData.name) {
      throw new Error('Email and name are required');
    }

    if (!this.isValidEmail(customerData.email)) {
      throw new Error('Invalid email format');
    }

    return await this.apiClient.createCustomer(customerData);
  }

  async getActiveCustomers(): Promise<Customer[]> {
    const allCustomers = await this.apiClient.getAllCustomers();
    return allCustomers.filter(customer => customer.active);
  }

  async updateCustomerStatus(id: number, active: boolean): Promise<Customer> {
    const customer = await this.apiClient.getCustomerById(id);
    return await this.apiClient.updateCustomer(id, {
      ...customer,
      active
    });
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

// Example 5: Complete usage demonstration with async/await
async function demonstrateTypedAPIUsage(): Promise<void> {
  const client = new CustomerAPIClient();
  const service = new CustomerService(client);

  try {
    console.log('=== TypeScript API Usage Demo ===\n');

    // Create a new customer with validation
    console.log('1. Creating customer with validation...');
    const newCustomerData: CustomerData = {
      email: 'typescript@example.com',
      name: 'TypeScript User',
      active: true
    };

    const createdCustomer = await service.validateAndCreateCustomer(newCustomerData);
    console.log('Created customer:', createdCustomer);

    // Get all customers
    console.log('\n2. Getting all customers...');
    const allCustomers = await client.getAllCustomers();
    console.log(`Found ${allCustomers.length} customers`);

    // Get active customers only
    console.log('\n3. Getting active customers...');
    const activeCustomers = await service.getActiveCustomers();
    console.log(`Found ${activeCustomers.length} active customers`);

    // Update customer status
    console.log('\n4. Updating customer status...');
    const updatedCustomer = await service.updateCustomerStatus(createdCustomer.id, false);
    console.log('Updated customer:', updatedCustomer);

    // Get specific customer
    console.log('\n5. Getting specific customer...');
    const specificCustomer = await client.getCustomerById(createdCustomer.id);
    console.log('Retrieved customer:', specificCustomer);

    // Delete customer
    console.log('\n6. Deleting customer...');
    const deleteResult = await client.deleteCustomer(createdCustomer.id);
    console.log('Delete result:', deleteResult);

  } catch (error) {
    console.error('Demo error:', error instanceof Error ? error.message : error);
  }
}

// Example 6: Promise-based model usage
function demonstrateModelUsage(): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log('\n=== Model Usage Demo ===\n');

    const customerData: CustomerData = {
      email: 'model@example.com',
      name: 'Model User',
      active: true
    };

    const customer = new CustomerModel(customerData);

    // Create customer
    CustomerModel.create(customer, (err, data) => {
      if (err) {
        reject(err);
        return;
      }

      console.log('Model created customer:', data);

      // Find customer
      if (data) {
        CustomerModel.findById(data.id, (err, foundCustomer) => {
          if (err) {
            reject(err);
            return;
          }

          console.log('Model found customer:', foundCustomer);

          // Get all customers
          CustomerModel.getAll((err, customers) => {
            if (err) {
              reject(err);
              return;
            }

            console.log('Model found all customers:', customers);
            resolve();
          });
        });
      }
    });
  });
}

// Export classes and functions for use in other modules
export {
  ExpressServer,
  CustomerModel,
  CustomerAPIClient,
  CustomerService,
  demonstrateTypedAPIUsage,
  demonstrateModelUsage,
  CustomerData,
  Customer,
  ApiError,
  ApiResponse
};

// Run examples if this file is executed directly
if (require.main === module) {
  (async () => {
    try {
      await demonstrateTypedAPIUsage();
      await demonstrateModelUsage();
      console.log('\nTypeScript demo completed successfully!');
    } catch (error) {
      console.error('Demo failed:', error);
      process.exit(1);
    }
  })();
}