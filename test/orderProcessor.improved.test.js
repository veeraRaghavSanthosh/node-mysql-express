const OrderProcessor = require('../app/models/orderProcessor.improved');

// Mock the database connection
jest.mock('../app/models/db.js', () => ({
  query: jest.fn()
}));

const mockDb = require('../app/models/db.js');

describe('OrderProcessor (Improved - Fully Deterministic)', () => {
  let processor;
  let mockIdGenerator;
  let mockDateProvider;
  let fixedDate;
  
  beforeEach(() => {
    // Create deterministic mocks
    let idCounter = 1000;
    mockIdGenerator = jest.fn(() => ++idCounter);
    fixedDate = new Date('2024-01-01T00:00:00.000Z');
    mockDateProvider = jest.fn(() => fixedDate);
    
    // Initialize processor with mocked dependencies
    processor = new OrderProcessor({
      idGenerator: mockIdGenerator,
      dateProvider: mockDateProvider
    });
    
    jest.clearAllMocks();
  });

  describe('orderProcessor_should_handle_zero_items (Fully Fixed)', () => {
    it('should create welcome order for new customer with zero items', async () => {
      const orderData = {
        customerId: 123,
        items: []
      };

      // Mock database response for new customer
      mockDb.query.mockImplementation((query, params, callback) => {
        expect(query).toContain('SELECT COUNT(*) as count FROM orders WHERE customer_id = ?');
        expect(params).toEqual([123]);
        
        // Simulate immediate callback
        setImmediate(() => {
          callback(null, [{ count: 0 }]);
        });
      });

      const result = await processor.processOrder(orderData);

      expect(result).toEqual({
        id: 1001, // Deterministic ID
        customerId: 123,
        status: 'welcome',
        items: [],
        total: 0,
        createdAt: fixedDate
      });

      expect(mockIdGenerator).toHaveBeenCalledTimes(1);
      expect(mockDateProvider).toHaveBeenCalledTimes(1);
      expect(mockDb.query).toHaveBeenCalledTimes(1);
    });

    it('should reject empty order for existing customer', async () => {
      const orderData = {
        customerId: 456,
        items: []
      };

      // Mock database response for existing customer
      mockDb.query.mockImplementation((query, params, callback) => {
        setImmediate(() => {
          callback(null, [{ count: 3 }]); // Customer has 3 existing orders
        });
      });

      const result = await processor.processOrder(orderData);

      expect(result).toEqual({
        id: null,
        customerId: 456,
        status: 'rejected',
        reason: 'Empty order not allowed for existing customer',
        items: [],
        total: 0,
        createdAt: fixedDate
      });

      expect(mockIdGenerator).not.toHaveBeenCalled(); // No ID generated for rejected orders
      expect(mockDateProvider).toHaveBeenCalledTimes(1);
    });

    it('should handle database errors properly', async () => {
      const orderData = {
        customerId: 789,
        items: []
      };

      const dbError = new Error('Connection timeout');
      mockDb.query.mockImplementation((query, params, callback) => {
        setImmediate(() => {
          callback(dbError, null);
        });
      });

      await expect(processor.processOrder(orderData)).rejects.toThrow('Connection timeout');
      
      expect(mockIdGenerator).not.toHaveBeenCalled();
      expect(mockDateProvider).not.toHaveBeenCalled();
    });

    it('should handle multiple zero-item orders deterministically', async () => {
      const orders = [
        { customerId: 100, items: [] },
        { customerId: 200, items: [] },
        { customerId: 300, items: [] }
      ];

      // Mock database to return different customer states
      mockDb.query.mockImplementation((query, params, callback) => {
        const customerId = params[0];
        setImmediate(() => {
          const count = customerId === 100 ? 0 : (customerId === 200 ? 1 : 0);
          callback(null, [{ count }]);
        });
      });

      const results = await Promise.all(orders.map(order => processor.processOrder(order)));

      // Verify results are deterministic
      expect(results[0].status).toBe('welcome'); // New customer
      expect(results[0].id).toBe(1001);
      expect(results[0].customerId).toBe(100);

      expect(results[1].status).toBe('rejected'); // Existing customer
      expect(results[1].id).toBe(null);
      expect(results[1].customerId).toBe(200);

      expect(results[2].status).toBe('welcome'); // New customer
      expect(results[2].id).toBe(1002);
      expect(results[2].customerId).toBe(300);

      // Verify deterministic ID generation
      expect(mockIdGenerator).toHaveBeenCalledTimes(2); // Only for welcome orders
    });

    it('should process batch orders safely', async () => {
      const orders = [
        { customerId: 400, items: [] },
        { customerId: 500, items: [{ id: 1, price: 10, quantity: 1 }] }
      ];

      mockDb.query.mockImplementation((query, params, callback) => {
        setImmediate(() => {
          callback(null, [{ count: 0 }]); // Both are new customers
        });
      });

      const results = await processor.processBatch(orders);

      expect(results).toHaveLength(2);
      expect(results[0].status).toBe('welcome');
      expect(results[1].status).toBe('processed');
      expect(results[1].total).toBe(10);
    });
  });

  describe('processOrder with items', () => {
    it('should process orders with items deterministically', async () => {
      const orderData = {
        customerId: 789,
        items: [
          { id: 1, name: 'Item 1', price: 10, quantity: 2 },
          { id: 2, name: 'Item 2', price: 5, quantity: 1 }
        ]
      };

      const result = await processor.processOrder(orderData);
      
      expect(result).toEqual({
        id: 1001,
        status: 'processed',
        items: [
          { id: 1, name: 'Item 1', price: 10, quantity: 2 },
          { id: 2, name: 'Item 2', price: 5, quantity: 1 }
        ],
        total: 25,
        createdAt: fixedDate
      });

      expect(mockIdGenerator).toHaveBeenCalledTimes(1);
      expect(mockDateProvider).toHaveBeenCalledTimes(1);
    });

    it('should handle item processing errors', async () => {
      const orderData = {
        customerId: 999,
        items: [
          { id: 1, price: 'invalid', quantity: 2 } // Invalid price
        ]
      };

      await expect(processor.processOrder(orderData)).rejects.toThrow('Failed to process items');
    });
  });
});