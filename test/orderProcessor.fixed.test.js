const OrderProcessor = require('../app/models/orderProcessor');
const mysql = require('mysql');

// Mock the database connection
jest.mock('../app/models/db.js', () => ({
  query: jest.fn()
}));

const mockDb = require('../app/models/db.js');

describe('OrderProcessor (Fixed - Deterministic)', () => {
  let processor;
  let mockDate;
  
  beforeEach(() => {
    processor = new OrderProcessor();
    jest.clearAllMocks();
    
    // FIX 1: Mock Date.now() to return deterministic values
    mockDate = jest.spyOn(Date, 'now').mockReturnValue(1640995200000); // Fixed timestamp
    
    // FIX 2: Mock Math.random() to eliminate random delays
    jest.spyOn(Math, 'random').mockReturnValue(0.5); // Fixed value
  });

  afterEach(() => {
    mockDate.mockRestore();
    jest.spyOn(Math, 'random').mockRestore();
  });

  // FIXED VERSION: orderProcessor_should_handle_zero_items
  describe('orderProcessor_should_handle_zero_items (Fixed)', () => {
    it('should handle zero items correctly for new customer', async () => {
      const orderData = {
        customerId: 123,
        items: []
      };

      // FIX 3: Use synchronous mock implementation to avoid race conditions
      mockDb.query.mockImplementation((query, params, callback) => {
        // Immediately call callback instead of using setTimeout
        process.nextTick(() => {
          callback(null, [{ count: 0 }]);
        });
      });

      const result = await processor.processOrder(orderData);

      // FIX 4: Test individual properties instead of comparing objects with timestamps
      expect(result.status).toBe('welcome');
      expect(result.id).toBe(1640995200000); // Deterministic ID
      expect(result.customerId).toBe(123);
      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('should reject empty orders for existing customers', async () => {
      const orderData = {
        customerId: 456,
        items: []
      };

      // FIX 5: Use deterministic mock behavior
      mockDb.query.mockImplementation((query, params, callback) => {
        process.nextTick(() => {
          callback(null, [{ count: 2 }]); // Fixed count instead of random
        });
      });

      const result = await processor.processOrder(orderData);
      
      expect(result.status).toBe('rejected');
      expect(result.reason).toBe('Empty order not allowed for existing customer');
      expect(result.customerId).toBe(456);
      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
    });

    // FIX 6: Add test for error handling
    it('should handle database errors gracefully', async () => {
      const orderData = {
        customerId: 789,
        items: []
      };

      mockDb.query.mockImplementation((query, params, callback) => {
        process.nextTick(() => {
          callback(new Error('Database connection failed'), null);
        });
      });

      await expect(processor.processOrder(orderData)).rejects.toThrow('Database connection failed');
    });

    // FIX 7: Test concurrent processing to ensure no race conditions
    it('should handle concurrent zero-item orders deterministically', async () => {
      const orderData1 = { customerId: 100, items: [] };
      const orderData2 = { customerId: 200, items: [] };

      let callCount = 0;
      mockDb.query.mockImplementation((query, params, callback) => {
        const customerId = params[0];
        process.nextTick(() => {
          // Return different counts based on customer ID for deterministic behavior
          const count = customerId === 100 ? 0 : 1;
          callback(null, [{ count }]);
        });
      });

      // Process orders concurrently
      const [result1, result2] = await Promise.all([
        processor.processOrder(orderData1),
        processor.processOrder(orderData2)
      ]);

      expect(result1.status).toBe('welcome'); // New customer
      expect(result1.customerId).toBe(100);
      
      expect(result2.status).toBe('rejected'); // Existing customer
      expect(result2.customerId).toBe(200);
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
      
      expect(result.status).toBe('processed');
      expect(result.total).toBe(25);
      expect(result.items).toEqual(orderData.items);
      expect(result.id).toBe(1640995200000); // Deterministic ID
    });
  });
});