/**
 * TypeScript Unit Tests for Customer API Client
 * 
 * This test suite covers the CustomerAPIClient functionality
 * with TypeScript types and interfaces.
 */

import axios, { AxiosResponse } from 'axios';
import { CustomerAPIClient, CustomerService, Customer, CustomerResponse } from '../examples/typescript-usage';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('CustomerAPIClient (TypeScript)', () => {
  let apiClient: CustomerAPIClient;
  const baseURL = 'http://localhost:3000';

  beforeEach(() => {
    apiClient = new CustomerAPIClient(baseURL);
    jest.clearAllMocks();
  });

  describe('createCustomer', () => {
    it('should create a customer with proper typing', async () => {
      const customerData: Customer = {
        email: 'typed@example.com',
        name: 'Typed User',
        active: true
      };

      const expectedResponse: CustomerResponse = {
        id: 1,
        email: customerData.email,
        name: customerData.name,
        active: customerData.active
      };

      const mockAxiosResponse: AxiosResponse<CustomerResponse> = {
        data: expectedResponse,
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any
      };

      mockedAxios.post.mockResolvedValue(mockAxiosResponse);

      const result: CustomerResponse = await apiClient.createCustomer(customerData);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${baseURL}/customers`,
        customerData
      );
      expect(result).toEqual(expectedResponse);
      expect(result.id).toBeDefined();
      expect(typeof result.id).toBe('number');
    });

    it('should handle type-safe error responses', async () => {
      const customerData: Customer = {
        email: 'error@example.com',
        name: 'Error User',
        active: true
      };

      const errorResponse = {
        response: {
          data: { message: 'Type validation error' },
          status: 400
        }
      };

      mockedAxios.post.mockRejectedValue(errorResponse);

      await expect(apiClient.createCustomer(customerData))
        .rejects.toThrow('Failed to create customer: Type validation error');
    });
  });

  describe('getAllCustomers', () => {
    it('should return typed array of customers', async () => {
      const expectedCustomers: CustomerResponse[] = [
        { id: 1, email: 'user1@example.com', name: 'User 1', active: true },
        { id: 2, email: 'user2@example.com', name: 'User 2', active: false }
      ];

      const mockAxiosResponse: AxiosResponse<CustomerResponse[]> = {
        data: expectedCustomers,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      };

      mockedAxios.get.mockResolvedValue(mockAxiosResponse);

      const result: CustomerResponse[] = await apiClient.getAllCustomers();

      expect(mockedAxios.get).toHaveBeenCalledWith(`${baseURL}/customers`);
      expect(result).toEqual(expectedCustomers);
      expect(Array.isArray(result)).toBe(true);
      
      // Type checking
      result.forEach(customer => {
        expect(typeof customer.id).toBe('number');
        expect(typeof customer.email).toBe('string');
        expect(typeof customer.name).toBe('string');
        expect(typeof customer.active).toBe('boolean');
      });
    });
  });

  describe('getCustomerById', () => {
    it('should return a single typed customer', async () => {
      const customerId = 1;
      const expectedCustomer: CustomerResponse = {
        id: customerId,
        email: 'single@example.com',
        name: 'Single User',
        active: true
      };

      const mockAxiosResponse: AxiosResponse<CustomerResponse> = {
        data: expectedCustomer,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      };

      mockedAxios.get.mockResolvedValue(mockAxiosResponse);

      const result: CustomerResponse = await apiClient.getCustomerById(customerId);

      expect(result).toEqual(expectedCustomer);
      expect(result.id).toBe(customerId);
    });

    it('should handle 404 with type-safe error message', async () => {
      const customerId = 999;
      const errorResponse = {
        response: { 
          status: 404,
          data: { message: 'Not found' }
        }
      };

      mockedAxios.get.mockRejectedValue(errorResponse);

      await expect(apiClient.getCustomerById(customerId))
        .rejects.toThrow(`Customer with ID ${customerId} not found`);
    });
  });

  describe('updateCustomer', () => {
    it('should update customer with type safety', async () => {
      const customerId = 1;
      const updateData: Customer = {
        email: 'updated-typed@example.com',
        name: 'Updated Typed User',
        active: false
      };

      const expectedResponse: CustomerResponse = {
        id: customerId,
        ...updateData
      };

      const mockAxiosResponse: AxiosResponse<CustomerResponse> = {
        data: expectedResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      };

      mockedAxios.put.mockResolvedValue(mockAxiosResponse);

      const result: CustomerResponse = await apiClient.updateCustomer(customerId, updateData);

      expect(result).toEqual(expectedResponse);
      expect(result.id).toBe(customerId);
      expect(result.email).toBe(updateData.email);
    });
  });

  describe('deleteCustomer', () => {
    it('should return typed delete confirmation', async () => {
      const customerId = 1;
      const expectedResponse = { message: 'Customer was deleted successfully!' };

      const mockAxiosResponse: AxiosResponse<{ message: string }> = {
        data: expectedResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      };

      mockedAxios.delete.mockResolvedValue(mockAxiosResponse);

      const result: { message: string } = await apiClient.deleteCustomer(customerId);

      expect(result).toEqual(expectedResponse);
      expect(typeof result.message).toBe('string');
    });
  });
});

describe('CustomerService (TypeScript)', () => {
  let customerService: CustomerService;
  let mockApiClient: jest.Mocked<CustomerAPIClient>;

  beforeEach(() => {
    mockApiClient = {
      createCustomer: jest.fn(),
      getAllCustomers: jest.fn(),
      getCustomerById: jest.fn(),
      updateCustomer: jest.fn(),
      deleteCustomer: jest.fn(),
      deleteAllCustomers: jest.fn()
    } as jest.Mocked<CustomerAPIClient>;

    customerService = new CustomerService(mockApiClient);
  });

  describe('bulkCreateCustomers', () => {
    it('should handle typed bulk creation', async () => {
      const customers: Customer[] = [
        { email: 'bulk1@example.com', name: 'Bulk User 1', active: true },
        { email: 'bulk2@example.com', name: 'Bulk User 2', active: false }
      ];

      const expectedResponses: CustomerResponse[] = [
        { id: 1, ...customers[0] },
        { id: 2, ...customers[1] }
      ];

      mockApiClient.createCustomer
        .mockResolvedValueOnce(expectedResponses[0])
        .mockResolvedValueOnce(expectedResponses[1]);

      const result: CustomerResponse[] = await customerService.bulkCreateCustomers(customers);

      expect(result).toEqual(expectedResponses);
      expect(result).toHaveLength(2);
      
      // Type verification
      result.forEach(customer => {
        expect(typeof customer.id).toBe('number');
        expect(customer.id).toBeGreaterThan(0);
      });
    });

    it('should validate email with TypeScript constraints', async () => {
      const invalidCustomers: Customer[] = [
        { email: 'invalid-email-format', name: 'Invalid User', active: true }
      ];

      await expect(customerService.bulkCreateCustomers(invalidCustomers))
        .rejects.toThrow('Invalid email format: invalid-email-format');
    });
  });

  describe('getActiveCustomers', () => {
    it('should filter and return typed active customers', async () => {
      const allCustomers: CustomerResponse[] = [
        { id: 1, email: 'active1@example.com', name: 'Active User 1', active: true },
        { id: 2, email: 'inactive@example.com', name: 'Inactive User', active: false },
        { id: 3, email: 'active2@example.com', name: 'Active User 2', active: true }
      ];

      mockApiClient.getAllCustomers.mockResolvedValue(allCustomers);

      const result: CustomerResponse[] = await customerService.getActiveCustomers();

      expect(result).toHaveLength(2);
      expect(result.every(customer => customer.active === true)).toBe(true);
      
      // Type safety check
      result.forEach(customer => {
        expect(customer).toHaveProperty('id');
        expect(customer).toHaveProperty('email');
        expect(customer).toHaveProperty('name');
        expect(customer).toHaveProperty('active');
        expect(customer.active).toBe(true);
      });
    });
  });
});

describe('Type Safety Tests', () => {
  let apiClient: CustomerAPIClient;

  beforeEach(() => {
    apiClient = new CustomerAPIClient();
  });

  it('should enforce Customer interface constraints', () => {
    // This test ensures TypeScript compilation catches type errors
    const validCustomer: Customer = {
      email: 'valid@example.com',
      name: 'Valid User',
      active: true
    };

    expect(validCustomer.email).toBeDefined();
    expect(validCustomer.name).toBeDefined();
    expect(typeof validCustomer.active).toBe('boolean');

    // Optional id should work
    const customerWithId: Customer = {
      id: 1,
      email: 'withid@example.com',
      name: 'User With ID',
      active: false
    };

    expect(customerWithId.id).toBe(1);
  });

  it('should enforce CustomerResponse interface constraints', () => {
    const response: CustomerResponse = {
      id: 1,
      email: 'response@example.com',
      name: 'Response User',
      active: true
    };

    // CustomerResponse must have id (not optional like in Customer)
    expect(response.id).toBeDefined();
    expect(typeof response.id).toBe('number');
  });

  it('should handle generic error responses', async () => {
    const errorResponse = {
      response: {
        data: { message: 'Generic error' },
        status: 500
      }
    };

    mockedAxios.get.mockRejectedValue(errorResponse);

    await expect(apiClient.getAllCustomers())
      .rejects.toThrow('Failed to fetch customers: Generic error');
  });
});

// Integration tests with proper typing
describe('TypeScript Integration Tests', () => {
  it('should maintain type safety throughout the request lifecycle', async () => {
    const apiClient = new CustomerAPIClient();
    const customerService = new CustomerService(apiClient);

    // Mock the full flow
    const inputCustomer: Customer = {
      email: 'integration@example.com',
      name: 'Integration User',
      active: true
    };

    const createdCustomer: CustomerResponse = {
      id: 1,
      ...inputCustomer
    };

    const allCustomers: CustomerResponse[] = [createdCustomer];

    mockedAxios.post.mockResolvedValue({ data: createdCustomer });
    mockedAxios.get.mockResolvedValue({ data: allCustomers });

    // Test the flow with type safety
    const created = await apiClient.createCustomer(inputCustomer);
    expect(created.id).toBeDefined();

    const activeCustomers = await customerService.getActiveCustomers();
    expect(activeCustomers).toHaveLength(1);
    expect(activeCustomers[0].active).toBe(true);
  });
});