/**
 * Unit Tests for Customer API Client
 * 
 * This test suite covers the CustomerAPIClient functionality
 * using Jest and mock HTTP responses.
 */

const axios = require('axios');
const { CustomerAPIClient, CustomerService } = require('../examples/javascript-usage');

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

describe('CustomerAPIClient', () => {
  let apiClient;
  const baseURL = 'http://localhost:3000';

  beforeEach(() => {
    apiClient = new CustomerAPIClient(baseURL);
    jest.clearAllMocks();
  });

  describe('createCustomer', () => {
    it('should create a customer successfully', async () => {
      const customerData = {
        email: 'test@example.com',
        name: 'Test User',
        active: true
      };

      const expectedResponse = {
        id: 1,
        ...customerData
      };

      mockedAxios.post.mockResolvedValue({ data: expectedResponse });

      const result = await apiClient.createCustomer(customerData);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${baseURL}/customers`,
        customerData
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should handle creation errors', async () => {
      const customerData = {
        email: 'test@example.com',
        name: 'Test User',
        active: true
      };

      const errorResponse = {
        response: {
          data: { message: 'Validation error' }
        }
      };

      mockedAxios.post.mockRejectedValue(errorResponse);

      await expect(apiClient.createCustomer(customerData))
        .rejects.toThrow('Failed to create customer: Validation error');
    });
  });

  describe('getAllCustomers', () => {
    it('should fetch all customers successfully', async () => {
      const expectedCustomers = [
        { id: 1, email: 'user1@example.com', name: 'User 1', active: true },
        { id: 2, email: 'user2@example.com', name: 'User 2', active: false }
      ];

      mockedAxios.get.mockResolvedValue({ data: expectedCustomers });

      const result = await apiClient.getAllCustomers();

      expect(mockedAxios.get).toHaveBeenCalledWith(`${baseURL}/customers`);
      expect(result).toEqual(expectedCustomers);
    });

    it('should handle fetch all customers errors', async () => {
      const errorResponse = {
        response: {
          data: { message: 'Database connection error' }
        }
      };

      mockedAxios.get.mockRejectedValue(errorResponse);

      await expect(apiClient.getAllCustomers())
        .rejects.toThrow('Failed to fetch customers: Database connection error');
    });
  });

  describe('getCustomerById', () => {
    it('should fetch a customer by ID successfully', async () => {
      const customerId = 1;
      const expectedCustomer = {
        id: customerId,
        email: 'user@example.com',
        name: 'User',
        active: true
      };

      mockedAxios.get.mockResolvedValue({ data: expectedCustomer });

      const result = await apiClient.getCustomerById(customerId);

      expect(mockedAxios.get).toHaveBeenCalledWith(`${baseURL}/customers/${customerId}`);
      expect(result).toEqual(expectedCustomer);
    });

    it('should handle customer not found (404)', async () => {
      const customerId = 999;
      const errorResponse = {
        response: { status: 404 }
      };

      mockedAxios.get.mockRejectedValue(errorResponse);

      await expect(apiClient.getCustomerById(customerId))
        .rejects.toThrow(`Customer with ID ${customerId} not found`);
    });
  });

  describe('updateCustomer', () => {
    it('should update a customer successfully', async () => {
      const customerId = 1;
      const updateData = {
        email: 'updated@example.com',
        name: 'Updated User',
        active: false
      };

      const expectedResponse = {
        id: customerId,
        ...updateData
      };

      mockedAxios.put.mockResolvedValue({ data: expectedResponse });

      const result = await apiClient.updateCustomer(customerId, updateData);

      expect(mockedAxios.put).toHaveBeenCalledWith(
        `${baseURL}/customers/${customerId}`,
        updateData
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should handle update customer not found (404)', async () => {
      const customerId = 999;
      const updateData = { name: 'Updated' };
      const errorResponse = {
        response: { status: 404 }
      };

      mockedAxios.put.mockRejectedValue(errorResponse);

      await expect(apiClient.updateCustomer(customerId, updateData))
        .rejects.toThrow(`Customer with ID ${customerId} not found`);
    });
  });

  describe('deleteCustomer', () => {
    it('should delete a customer successfully', async () => {
      const customerId = 1;
      const expectedResponse = { message: 'Customer was deleted successfully!' };

      mockedAxios.delete.mockResolvedValue({ data: expectedResponse });

      const result = await apiClient.deleteCustomer(customerId);

      expect(mockedAxios.delete).toHaveBeenCalledWith(`${baseURL}/customers/${customerId}`);
      expect(result).toEqual(expectedResponse);
    });

    it('should handle delete customer not found (404)', async () => {
      const customerId = 999;
      const errorResponse = {
        response: { status: 404 }
      };

      mockedAxios.delete.mockRejectedValue(errorResponse);

      await expect(apiClient.deleteCustomer(customerId))
        .rejects.toThrow(`Customer with ID ${customerId} not found`);
    });
  });

  describe('deleteAllCustomers', () => {
    it('should delete all customers successfully', async () => {
      const expectedResponse = { message: 'All Customers were deleted successfully!' };

      mockedAxios.delete.mockResolvedValue({ data: expectedResponse });

      const result = await apiClient.deleteAllCustomers();

      expect(mockedAxios.delete).toHaveBeenCalledWith(`${baseURL}/customers`);
      expect(result).toEqual(expectedResponse);
    });
  });
});

describe('CustomerService', () => {
  let customerService;
  let mockApiClient;

  beforeEach(() => {
    mockApiClient = {
      createCustomer: jest.fn(),
      getAllCustomers: jest.fn()
    };
    customerService = new CustomerService(mockApiClient);
  });

  describe('bulkCreateCustomers', () => {
    it('should create multiple customers successfully', async () => {
      const customers = [
        { email: 'user1@example.com', name: 'User 1', active: true },
        { email: 'user2@example.com', name: 'User 2', active: false }
      ];

      const expectedResponses = [
        { id: 1, ...customers[0] },
        { id: 2, ...customers[1] }
      ];

      mockApiClient.createCustomer
        .mockResolvedValueOnce(expectedResponses[0])
        .mockResolvedValueOnce(expectedResponses[1]);

      const result = await customerService.bulkCreateCustomers(customers);

      expect(mockApiClient.createCustomer).toHaveBeenCalledTimes(2);
      expect(result).toEqual(expectedResponses);
    });

    it('should validate email format', async () => {
      const customers = [
        { email: 'invalid-email', name: 'User 1', active: true }
      ];

      await expect(customerService.bulkCreateCustomers(customers))
        .rejects.toThrow('Invalid email format: invalid-email');

      expect(mockApiClient.createCustomer).not.toHaveBeenCalled();
    });

    it('should stop on first creation error', async () => {
      const customers = [
        { email: 'user1@example.com', name: 'User 1', active: true },
        { email: 'user2@example.com', name: 'User 2', active: false }
      ];

      mockApiClient.createCustomer
        .mockRejectedValueOnce(new Error('Creation failed'));

      await expect(customerService.bulkCreateCustomers(customers))
        .rejects.toThrow('Creation failed');

      expect(mockApiClient.createCustomer).toHaveBeenCalledTimes(1);
    });
  });

  describe('getActiveCustomers', () => {
    it('should return only active customers', async () => {
      const allCustomers = [
        { id: 1, email: 'user1@example.com', name: 'User 1', active: true },
        { id: 2, email: 'user2@example.com', name: 'User 2', active: false },
        { id: 3, email: 'user3@example.com', name: 'User 3', active: true }
      ];

      const expectedActiveCustomers = [
        allCustomers[0],
        allCustomers[2]
      ];

      mockApiClient.getAllCustomers.mockResolvedValue(allCustomers);

      const result = await customerService.getActiveCustomers();

      expect(result).toEqual(expectedActiveCustomers);
      expect(result).toHaveLength(2);
      expect(result.every(customer => customer.active)).toBe(true);
    });

    it('should return empty array when no active customers', async () => {
      const allCustomers = [
        { id: 1, email: 'user1@example.com', name: 'User 1', active: false },
        { id: 2, email: 'user2@example.com', name: 'User 2', active: false }
      ];

      mockApiClient.getAllCustomers.mockResolvedValue(allCustomers);

      const result = await customerService.getActiveCustomers();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct email formats', () => {
      const validEmails = [
        'user@example.com',
        'test.email@domain.co.uk',
        'user+tag@example.org',
        'user123@test-domain.com'
      ];

      validEmails.forEach(email => {
        expect(customerService.isValidEmail(email)).toBe(true);
      });
    });

    it('should reject invalid email formats', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'user@',
        'user@.com',
        'user.example.com',
        'user@domain',
        ''
      ];

      invalidEmails.forEach(email => {
        expect(customerService.isValidEmail(email)).toBe(false);
      });
    });
  });
});

describe('Integration Tests', () => {
  let apiClient;

  beforeEach(() => {
    apiClient = new CustomerAPIClient();
  });

  it('should handle network errors gracefully', async () => {
    mockedAxios.get.mockRejectedValue(new Error('Network Error'));

    await expect(apiClient.getAllCustomers())
      .rejects.toThrow('Failed to fetch customers: Network Error');
  });

  it('should handle malformed response data', async () => {
    mockedAxios.get.mockResolvedValue({ data: null });

    const result = await apiClient.getAllCustomers();
    expect(result).toBeNull();
  });
});

// Performance and edge case tests
describe('Edge Cases and Performance', () => {
  let apiClient;

  beforeEach(() => {
    apiClient = new CustomerAPIClient();
  });

  it('should handle empty customer list', async () => {
    mockedAxios.get.mockResolvedValue({ data: [] });

    const result = await apiClient.getAllCustomers();
    expect(result).toEqual([]);
    expect(Array.isArray(result)).toBe(true);
  });

  it('should handle concurrent requests', async () => {
    const customerData = {
      email: 'concurrent@example.com',
      name: 'Concurrent User',
      active: true
    };

    const expectedResponse = { id: 1, ...customerData };
    mockedAxios.post.mockResolvedValue({ data: expectedResponse });

    const promises = Array(5).fill().map(() => 
      apiClient.createCustomer(customerData)
    );

    const results = await Promise.all(promises);

    expect(results).toHaveLength(5);
    expect(mockedAxios.post).toHaveBeenCalledTimes(5);
    results.forEach(result => {
      expect(result).toEqual(expectedResponse);
    });
  });
});