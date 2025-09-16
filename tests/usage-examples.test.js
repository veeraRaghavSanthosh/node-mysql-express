/**
 * Unit Tests for Usage Examples
 * 
 * Tests for the JavaScript and TypeScript usage examples
 */

const {
  createServer,
  CustomerAPIClient,
  demonstrateAPIUsage,
  startServer
} = require('../examples/usage-javascript');

// Mock axios to avoid actual HTTP requests during testing
jest.mock('axios');
const axios = require('axios');

describe('Usage Examples Tests', () => {
  describe('createServer function', () => {
    it('should create an Express app with proper middleware', () => {
      const app = createServer();
      
      expect(app).toBeDefined();
      expect(typeof app.listen).toBe('function');
      expect(typeof app.use).toBe('function');
      expect(typeof app.get).toBe('function');
    });
  });

  describe('CustomerAPIClient', () => {
    let client;
    let mockAxios;

    beforeEach(() => {
      mockAxios = {
        create: jest.fn().mockReturnThis(),
        post: jest.fn(),
        get: jest.fn(),
        put: jest.fn(),
        delete: jest.fn()
      };
      
      axios.create.mockReturnValue(mockAxios);
      client = new CustomerAPIClient('http://localhost:3000');
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should initialize with correct base URL', () => {
      expect(axios.create).toHaveBeenCalledWith({
        baseURL: 'http://localhost:3000',
        headers: {
          'Content-Type': 'application/json'
        }
      });
    });

    it('should create a customer successfully', async () => {
      const customerData = {
        email: 'test@example.com',
        name: 'Test User',
        active: true
      };
      
      const expectedResponse = { id: 1, ...customerData };
      mockAxios.post.mockResolvedValue({ data: expectedResponse });

      const result = await client.createCustomer(customerData);

      expect(mockAxios.post).toHaveBeenCalledWith('/customers', customerData);
      expect(result).toEqual(expectedResponse);
    });

    it('should handle create customer errors', async () => {
      const customerData = {
        email: 'test@example.com',
        name: 'Test User',
        active: true
      };
      
      const errorResponse = {
        response: {
          data: { message: 'Validation failed' }
        }
      };
      
      mockAxios.post.mockRejectedValue(errorResponse);

      await expect(client.createCustomer(customerData))
        .rejects
        .toThrow('Failed to create customer: Validation failed');
    });

    it('should get all customers successfully', async () => {
      const customers = [
        { id: 1, email: 'user1@test.com', name: 'User 1', active: true },
        { id: 2, email: 'user2@test.com', name: 'User 2', active: false }
      ];
      
      mockAxios.get.mockResolvedValue({ data: customers });

      const result = await client.getAllCustomers();

      expect(mockAxios.get).toHaveBeenCalledWith('/customers');
      expect(result).toEqual(customers);
    });

    it('should get customer by ID successfully', async () => {
      const customer = { id: 1, email: 'test@example.com', name: 'Test User', active: true };
      
      mockAxios.get.mockResolvedValue({ data: customer });

      const result = await client.getCustomerById(1);

      expect(mockAxios.get).toHaveBeenCalledWith('/customers/1');
      expect(result).toEqual(customer);
    });

    it('should update customer successfully', async () => {
      const customerData = {
        email: 'updated@example.com',
        name: 'Updated User',
        active: false
      };
      
      const expectedResponse = { id: 1, ...customerData };
      mockAxios.put.mockResolvedValue({ data: expectedResponse });

      const result = await client.updateCustomer(1, customerData);

      expect(mockAxios.put).toHaveBeenCalledWith('/customers/1', customerData);
      expect(result).toEqual(expectedResponse);
    });

    it('should delete customer successfully', async () => {
      const expectedResponse = { message: 'Customer was deleted successfully!' };
      mockAxios.delete.mockResolvedValue({ data: expectedResponse });

      const result = await client.deleteCustomer(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/customers/1');
      expect(result).toEqual(expectedResponse);
    });

    it('should delete all customers successfully', async () => {
      const expectedResponse = { message: 'All Customers were deleted successfully!' };
      mockAxios.delete.mockResolvedValue({ data: expectedResponse });

      const result = await client.deleteAllCustomers();

      expect(mockAxios.delete).toHaveBeenCalledWith('/customers');
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('Error handling', () => {
    let client;
    let mockAxios;

    beforeEach(() => {
      mockAxios = {
        create: jest.fn().mockReturnThis(),
        post: jest.fn(),
        get: jest.fn(),
        put: jest.fn(),
        delete: jest.fn()
      };
      
      axios.create.mockReturnValue(mockAxios);
      client = new CustomerAPIClient();
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network Error');
      mockAxios.get.mockRejectedValue(networkError);

      await expect(client.getAllCustomers())
        .rejects
        .toThrow('Failed to get customers: Network Error');
    });

    it('should handle HTTP error responses', async () => {
      const httpError = {
        response: {
          data: { message: 'Internal Server Error' }
        }
      };
      
      mockAxios.get.mockRejectedValue(httpError);

      await expect(client.getAllCustomers())
        .rejects
        .toThrow('Failed to get customers: Internal Server Error');
    });

    it('should handle errors without response data', async () => {
      const error = {
        message: 'Request timeout'
      };
      
      mockAxios.get.mockRejectedValue(error);

      await expect(client.getAllCustomers())
        .rejects
        .toThrow('Failed to get customers: Request timeout');
    });
  });

  describe('demonstrateAPIUsage function', () => {
    let consoleSpy;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    it('should run demonstration without errors when API calls succeed', async () => {
      const mockAxios = {
        create: jest.fn().mockReturnThis(),
        post: jest.fn().mockResolvedValue({ 
          data: { id: 1, email: 'jane.smith@example.com', name: 'Jane Smith', active: true }
        }),
        get: jest.fn().mockImplementation((url) => {
          if (url === '/customers') {
            return Promise.resolve({ data: [
              { id: 1, email: 'jane.smith@example.com', name: 'Jane Smith', active: true }
            ]});
          } else if (url === '/customers/1') {
            return Promise.resolve({ 
              data: { id: 1, email: 'jane.smith@example.com', name: 'Jane Smith', active: true }
            });
          }
        }),
        put: jest.fn().mockResolvedValue({ 
          data: { id: 1, email: 'jane.updated@example.com', name: 'Jane Updated Smith', active: false }
        }),
        delete: jest.fn().mockResolvedValue({ 
          data: { message: 'Customer was deleted successfully!' }
        })
      };
      
      axios.create.mockReturnValue(mockAxios);

      await expect(demonstrateAPIUsage()).resolves.not.toThrow();
      
      expect(mockAxios.post).toHaveBeenCalled();
      expect(mockAxios.get).toHaveBeenCalled();
      expect(mockAxios.put).toHaveBeenCalled();
      expect(mockAxios.delete).toHaveBeenCalled();
    });

    it('should handle API errors gracefully', async () => {
      const mockAxios = {
        create: jest.fn().mockReturnThis(),
        post: jest.fn().mockRejectedValue(new Error('API Error'))
      };
      
      axios.create.mockReturnValue(mockAxios);

      await expect(demonstrateAPIUsage()).resolves.not.toThrow();
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('API Error')
      );
    });
  });

  describe('startServer function', () => {
    it('should return a server instance', () => {
      const server = startServer(0); // Use port 0 to get a random available port
      
      expect(server).toBeDefined();
      expect(typeof server.close).toBe('function');
      
      // Clean up
      server.close();
    });

    it('should start server on specified port', (done) => {
      const server = startServer(0); // Use port 0 to get a random available port
      
      server.on('listening', () => {
        expect(server.listening).toBe(true);
        server.close(done);
      });
    });
  });
});