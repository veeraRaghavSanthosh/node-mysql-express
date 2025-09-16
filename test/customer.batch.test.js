const Customer = require('../app/models/customer.model.js');
const sql = require('../app/models/db.js');

// Mock the database connection
jest.mock('../app/models/db.js');

describe('Customer.processLargeBatch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Input validation', () => {
    test('should throw error for non-array data', async () => {
      await expect(Customer.processLargeBatch('create', 'invalid'))
        .rejects.toThrow('Data must be a non-empty array');
    });

    test('should throw error for empty array', async () => {
      await expect(Customer.processLargeBatch('create', []))
        .rejects.toThrow('Data must be a non-empty array');
    });

    test('should throw error for invalid operation', async () => {
      const mockData = [{ email: 'test@test.com', name: 'Test', active: true }];
      await expect(Customer.processLargeBatch('invalid', mockData))
        .rejects.toThrow('Unsupported operation: invalid');
    });
  });

  describe('Batch creation operations', () => {
    test('should process small batch create successfully', async () => {
      const mockData = [
        { email: 'test1@test.com', name: 'Test1', active: true },
        { email: 'test2@test.com', name: 'Test2', active: false }
      ];

      sql.query.mockImplementation((query, values, callback) => {
        callback(null, { insertId: 1, affectedRows: 2 });
      });

      const result = await Customer.processLargeBatch('create', mockData);

      expect(result.success).toBe(true);
      expect(result.processed).toBe(2);
      expect(result.results).toHaveLength(2);
      expect(result.errors).toBeNull();
      expect(sql.query).toHaveBeenCalledTimes(1);
    });

    test('should process large batch create with chunking', async () => {
      const mockData = Array.from({ length: 250 }, (_, i) => ({
        email: `test${i}@test.com`,
        name: `Test${i}`,
        active: i % 2 === 0
      }));

      sql.query.mockImplementation((query, values, callback) => {
        callback(null, { insertId: 1, affectedRows: values.length / 3 });
      });

      const result = await Customer.processLargeBatch('create', mockData, { 
        batchSize: 50 
      });

      expect(result.success).toBe(true);
      expect(result.processed).toBe(250);
      expect(result.totalBatches).toBe(5); // 250 / 50 = 5 batches
      expect(sql.query).toHaveBeenCalledTimes(5);
    });

    test('should handle create errors gracefully', async () => {
      const mockData = [
        { email: 'invalid-email', name: 'Test', active: true }
      ];

      sql.query.mockImplementation((query, values, callback) => {
        callback(new Error('Database error'), null);
      });

      const result = await Customer.processLargeBatch('create', mockData);

      expect(result.success).toBe(true);
      expect(result.processed).toBe(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].error).toBe('Database error');
    });
  });

  describe('Batch update operations', () => {
    test('should process batch update successfully', async () => {
      const mockData = [
        { id: 1, email: 'updated1@test.com', name: 'Updated1', active: true },
        { id: 2, email: 'updated2@test.com', name: 'Updated2', active: false }
      ];

      sql.query.mockImplementation((query, callback) => {
        callback(null, { affectedRows: 2 });
      });

      const result = await Customer.processLargeBatch('update', mockData);

      expect(result.success).toBe(true);
      expect(result.processed).toBe(2);
      expect(result.results).toHaveLength(2);
      expect(sql.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE customers SET'),
        expect.any(Function)
      );
    });

    test('should handle update errors gracefully', async () => {
      const mockData = [{ id: 999, email: 'test@test.com', name: 'Test', active: true }];

      sql.query.mockImplementation((query, callback) => {
        callback(new Error('Record not found'), null);
      });

      const result = await Customer.processLargeBatch('update', mockData);

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].error).toBe('Record not found');
    });
  });

  describe('Batch delete operations', () => {
    test('should process batch delete successfully', async () => {
      const mockIds = [1, 2, 3];

      sql.query.mockImplementation((query, values, callback) => {
        callback(null, { affectedRows: 3 });
      });

      const result = await Customer.processLargeBatch('delete', mockIds);

      expect(result.success).toBe(true);
      expect(result.processed).toBe(3);
      expect(result.results).toHaveLength(3);
      expect(sql.query).toHaveBeenCalledWith(
        'DELETE FROM customers WHERE id IN (?)',
        [[1, 2, 3]],
        expect.any(Function)
      );
    });
  });

  describe('Performance optimizations', () => {
    test('should respect batch size configuration', async () => {
      const mockData = Array.from({ length: 10 }, (_, i) => ({
        email: `test${i}@test.com`,
        name: `Test${i}`,
        active: true
      }));

      sql.query.mockImplementation((query, values, callback) => {
        callback(null, { insertId: 1, affectedRows: values.length / 3 });
      });

      const result = await Customer.processLargeBatch('create', mockData, { 
        batchSize: 3 
      });

      expect(result.totalBatches).toBe(4); // 10 items / 3 per batch = 4 batches
      expect(sql.query).toHaveBeenCalledTimes(4);
    });

    test('should call progress callback when provided', async () => {
      const mockData = Array.from({ length: 5 }, (_, i) => ({
        email: `test${i}@test.com`,
        name: `Test${i}`,
        active: true
      }));

      const progressCallback = jest.fn();

      sql.query.mockImplementation((query, values, callback) => {
        callback(null, { insertId: 1, affectedRows: values.length / 3 });
      });

      await Customer.processLargeBatch('create', mockData, {
        batchSize: 2,
        onProgress: progressCallback
      });

      expect(progressCallback).toHaveBeenCalled();
      expect(progressCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          processed: expect.any(Number),
          total: 5,
          batchIndex: expect.any(Number),
          totalBatches: expect.any(Number)
        })
      );
    });

    test('should call error callback when provided', async () => {
      const mockData = [{ email: 'test@test.com', name: 'Test', active: true }];
      const errorCallback = jest.fn();

      sql.query.mockImplementation((query, values, callback) => {
        callback(new Error('Test error'), null);
      });

      await Customer.processLargeBatch('create', mockData, {
        onError: errorCallback
      });

      expect(errorCallback).toHaveBeenCalledWith(
        expect.any(Error),
        0,
        expect.any(Array)
      );
    });

    test('should handle concurrency limits', async () => {
      const mockData = Array.from({ length: 20 }, (_, i) => ({
        email: `test${i}@test.com`,
        name: `Test${i}`,
        active: true
      }));

      sql.query.mockImplementation((query, values, callback) => {
        // Simulate async database operation
        setTimeout(() => {
          callback(null, { insertId: 1, affectedRows: values.length / 3 });
        }, 10);
      });

      const startTime = Date.now();
      await Customer.processLargeBatch('create', mockData, {
        batchSize: 5,
        concurrency: 2,
        delayBetweenBatches: 0
      });
      const endTime = Date.now();

      // With concurrency of 2 and 4 batches, it should take at least 2 cycles
      expect(endTime - startTime).toBeGreaterThan(15); // At least some delay
    });
  });

  describe('Memory efficiency', () => {
    test('should handle very large datasets without memory issues', async () => {
      const largeDataset = Array.from({ length: 10000 }, (_, i) => ({
        email: `test${i}@test.com`,
        name: `Test${i}`,
        active: i % 2 === 0
      }));

      sql.query.mockImplementation((query, values, callback) => {
        // Simulate successful batch processing
        callback(null, { insertId: 1, affectedRows: values.length / 3 });
      });

      const result = await Customer.processLargeBatch('create', largeDataset, {
        batchSize: 100,
        concurrency: 3
      });

      expect(result.success).toBe(true);
      expect(result.processed).toBe(10000);
      expect(result.totalBatches).toBe(100); // 10000 / 100 = 100 batches
    });
  });

  describe('Edge cases', () => {
    test('should handle empty batches gracefully', async () => {
      const mockData = [
        { email: 'test@test.com', name: 'Test', active: true }
      ];

      sql.query.mockImplementation((query, values, callback) => {
        callback(null, { insertId: 1, affectedRows: 0 });
      });

      const result = await Customer.processLargeBatch('create', mockData);

      expect(result.success).toBe(true);
      expect(result.processed).toBe(1);
    });

    test('should handle mixed success and failure scenarios', async () => {
      const mockData = Array.from({ length: 4 }, (_, i) => ({
        email: `test${i}@test.com`,
        name: `Test${i}`,
        active: true
      }));

      let callCount = 0;
      sql.query.mockImplementation((query, values, callback) => {
        callCount++;
        if (callCount === 2) {
          callback(new Error('Batch 2 failed'), null);
        } else {
          callback(null, { insertId: 1, affectedRows: values.length / 3 });
        }
      });

      const result = await Customer.processLargeBatch('create', mockData, {
        batchSize: 2
      });

      expect(result.success).toBe(true);
      expect(result.processed).toBe(2); // Only successful batches counted
      expect(result.errors).toHaveLength(1);
      expect(result.totalBatches).toBe(2);
    });
  });
});