const { CustomerApiClient } = require('../examples/javascript-usage.js');
const axios = require('axios');

// Mock axios for integration tests
jest.mock('axios');
const mockedAxios = axios;

describe('CustomerApiClient Integration Tests', () => {
  let apiClient;
  const baseUrl = 'http://localhost:3000';

  beforeEach(() => {
    apiClient = new CustomerApiClient(baseUrl);
    jest.clearAllMocks();
  });

  describe('createCustomer', () => {
    it('should create a customer successfully', async () => {
      const customerData = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        active: true
      };

      const expectedResponse = {
        id: 1,
        ...customerData
      };

      mockedAxios.post.mockResolvedValue({ data: expectedResponse });

      const result = await apiClient.createCustomer(customerData);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${baseUrl}/customers`,
        customerData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should throw error when API call fails', async () => {
      const customerData = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        active: true
      };

      mockedAxios.post.mockRejectedValue(new Error('Network error'));

      await expect(apiClient.createCustomer(customerData))
        .rejects.toThrow('Failed to create customer: Error: Network error');
    });
  });

  describe('getAllCustomers', () => {
    it('should fetch all customers successfully', async () => {
      const mockCustomers = [
        { id: 1, name: 'John Doe', email: 'john@example.com', active: true },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', active: false }
      ];

      mockedAxios.get.mockResolvedValue({ data: mockCustomers });

      const result = await apiClient.getAllCustomers();

      expect(mockedAxios.get).toHaveBeenCalledWith(`${baseUrl}/customers`);
      expect(result).toEqual(mockCustomers);
    });

    it('should throw error when API call fails', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Server error'));

      await expect(apiClient.getAllCustomers())
        .rejects.toThrow('Failed to fetch customers: Error: Server error');
    });
  });

  describe('getCustomerById', () => {
    it('should fetch a customer by ID successfully', async () => {
      const customerId = 1;
      const mockCustomer = {
        id: customerId,
        name: 'John Doe',
        email: 'john@example.com',
        active: true
      };

      mockedAxios.get.mockResolvedValue({ data: mockCustomer });

      const result = await apiClient.getCustomerById(customerId);

      expect(mockedAxios.get).toHaveBeenCalledWith(`${baseUrl}/customers/${customerId}`);
      expect(result).toEqual(mockCustomer);
    });

    it('should throw error when customer not found', async () => {
      const customerId = 999;
      mockedAxios.get.mockRejectedValue(new Error('Not found'));

      await expect(apiClient.getCustomerById(customerId))
        .rejects.toThrow(`Failed to fetch customer with ID ${customerId}: Error: Not found`);
    });
  });

  describe('updateCustomer', () => {
    it('should update a customer successfully', async () => {
      const customerId = 1;
      const updateData = {
        name: 'John Smith',
        email: 'john.smith@example.com',
        active: false
      };

      const expectedResponse = {
        id: customerId,
        ...updateData
      };

      mockedAxios.put.mockResolvedValue({ data: expectedResponse });

      const result = await apiClient.updateCustomer(customerId, updateData);

      expect(mockedAxios.put).toHaveBeenCalledWith(
        `${baseUrl}/customers/${customerId}`,
        updateData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should throw error when update fails', async () => {
      const customerId = 1;
      const updateData = { name: 'John Smith' };

      mockedAxios.put.mockRejectedValue(new Error('Update failed'));

      await expect(apiClient.updateCustomer(customerId, updateData))
        .rejects.toThrow(`Failed to update customer with ID ${customerId}: Error: Update failed`);
    });
  });

  describe('deleteCustomer', () => {
    it('should delete a customer successfully', async () => {
      const customerId = 1;
      const expectedResponse = { message: 'Customer was deleted successfully!' };

      mockedAxios.delete.mockResolvedValue({ data: expectedResponse });

      const result = await apiClient.deleteCustomer(customerId);

      expect(mockedAxios.delete).toHaveBeenCalledWith(`${baseUrl}/customers/${customerId}`);
      expect(result).toEqual(expectedResponse);
    });

    it('should throw error when deletion fails', async () => {
      const customerId = 1;
      mockedAxios.delete.mockRejectedValue(new Error('Deletion failed'));

      await expect(apiClient.deleteCustomer(customerId))
        .rejects.toThrow(`Failed to delete customer with ID ${customerId}: Error: Deletion failed`);
    });
  });

  describe('deleteAllCustomers', () => {
    it('should delete all customers successfully', async () => {
      const expectedResponse = { message: 'All Customers were deleted successfully!' };

      mockedAxios.delete.mockResolvedValue({ data: expectedResponse });

      const result = await apiClient.deleteAllCustomers();

      expect(mockedAxios.delete).toHaveBeenCalledWith(`${baseUrl}/customers`);
      expect(result).toEqual(expectedResponse);
    });

    it('should throw error when deletion fails', async () => {
      mockedAxios.delete.mockRejectedValue(new Error('Bulk deletion failed'));

      await expect(apiClient.deleteAllCustomers())
        .rejects.toThrow('Failed to delete all customers: Error: Bulk deletion failed');
    });
  });

  describe('Error handling', () => {
    it('should handle network timeouts', async () => {
      mockedAxios.get.mockRejectedValue({ code: 'ECONNABORTED', message: 'timeout' });

      await expect(apiClient.getAllCustomers())
        .rejects.toThrow('Failed to fetch customers');
    });

    it('should handle HTTP error responses', async () => {
      const errorResponse = {
        response: {
          status: 500,
          data: { message: 'Internal server error' }
        }
      };

      mockedAxios.get.mockRejectedValue(errorResponse);

      await expect(apiClient.getAllCustomers())
        .rejects.toThrow('Failed to fetch customers');
    });
  });

  describe('Configuration', () => {
    it('should use custom base URL', () => {
      const customUrl = 'http://api.example.com:8080';
      const customClient = new CustomerApiClient(customUrl);

      expect(customClient.baseUrl).toBe(customUrl);
    });

    it('should use default base URL when none provided', () => {
      const defaultClient = new CustomerApiClient();

      expect(defaultClient.baseUrl).toBe('http://localhost:3000');
    });
  });
});