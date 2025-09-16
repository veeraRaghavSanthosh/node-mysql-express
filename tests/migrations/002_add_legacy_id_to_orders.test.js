const migration = require('../../migrations/002_add_legacy_id_to_orders');

// Mock migration runner
class MockMigrationRunner {
  constructor() {
    this.queries = [];
    this.mockData = {
      existingOrders: [
        { id: 1, order_date: new Date('2025-01-15T10:30:00Z') },
        { id: 2, order_date: new Date('2025-02-20T14:45:00Z') },
        { id: 3, order_date: new Date('2025-03-10T09:15:00Z') }
      ],
      verificationResult: [{ total: 3, with_legacy_id: 3 }]
    };
  }

  async query(sql, params = []) {
    this.queries.push({ sql, params });
    
    // Mock responses for different query types
    if (sql.includes('SELECT id, order_date FROM orders WHERE legacy_id IS NULL')) {
      return this.mockData.existingOrders;
    }
    
    if (sql.includes('SELECT COUNT(*) as total, COUNT(legacy_id) as with_legacy_id FROM orders')) {
      return this.mockData.verificationResult;
    }
    
    if (sql.includes('UPDATE orders SET legacy_id = ?')) {
      return { affectedRows: 1 };
    }
    
    return { affectedRows: 0 };
  }

  setMockData(data) {
    this.mockData = { ...this.mockData, ...data };
  }

  getExecutedQueries() {
    return this.queries;
  }

  clearQueries() {
    this.queries = [];
  }
}

describe('Migration: Add legacy_id to orders', () => {
  let mockRunner;

  beforeEach(() => {
    mockRunner = new MockMigrationRunner();
    // Spy on console.log to suppress output during tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    console.log.mockRestore();
  });

  describe('up migration', () => {
    test('should add legacy_id column to orders table', async () => {
      await migration.up(mockRunner);
      
      const queries = mockRunner.getExecutedQueries();
      const addColumnQuery = queries.find(q => q.sql.includes('ALTER TABLE orders'));
      
      expect(addColumnQuery).toBeDefined();
      expect(addColumnQuery.sql).toContain('ADD COLUMN legacy_id VARCHAR(50)');
      expect(addColumnQuery.sql).toContain('ADD INDEX idx_orders_legacy_id');
    });

    test('should backfill legacy_id for existing orders with correct format', async () => {
      await migration.up(mockRunner);
      
      const queries = mockRunner.getExecutedQueries();
      const updateQueries = queries.filter(q => q.sql.includes('UPDATE orders SET legacy_id = ?'));
      
      expect(updateQueries).toHaveLength(3);
      
      // Check the format of generated legacy_id values
      expect(updateQueries[0].params[0]).toBe('LEGACY_20250115_000001');
      expect(updateQueries[0].params[1]).toBe(1);
      
      expect(updateQueries[1].params[0]).toBe('LEGACY_20250220_000002');
      expect(updateQueries[1].params[1]).toBe(2);
      
      expect(updateQueries[2].params[0]).toBe('LEGACY_20250310_000003');
      expect(updateQueries[2].params[1]).toBe(3);
    });

    test('should handle empty orders table gracefully', async () => {
      mockRunner.setMockData({ 
        existingOrders: [],
        verificationResult: [{ total: 0, with_legacy_id: 0 }]
      });
      
      await migration.up(mockRunner);
      
      const queries = mockRunner.getExecutedQueries();
      const updateQueries = queries.filter(q => q.sql.includes('UPDATE orders SET legacy_id = ?'));
      
      expect(updateQueries).toHaveLength(0);
    });

    test('should perform verification after backfill', async () => {
      await migration.up(mockRunner);
      
      const queries = mockRunner.getExecutedQueries();
      const verificationQuery = queries.find(q => 
        q.sql.includes('SELECT COUNT(*) as total, COUNT(legacy_id) as with_legacy_id FROM orders')
      );
      
      expect(verificationQuery).toBeDefined();
    });

    test('should throw error if verification fails', async () => {
      mockRunner.setMockData({
        verificationResult: [{ total: 3, with_legacy_id: 2 }] // Mismatch
      });
      
      await expect(migration.up(mockRunner)).rejects.toThrow(
        'Backfill verification failed: some orders still missing legacy_id'
      );
    });

    test('should generate unique legacy_id values for orders on same date', async () => {
      const sameDate = new Date('2025-01-15T10:30:00Z');
      mockRunner.setMockData({
        existingOrders: [
          { id: 1, order_date: sameDate },
          { id: 2, order_date: sameDate },
          { id: 15, order_date: sameDate }
        ]
      });
      
      await migration.up(mockRunner);
      
      const queries = mockRunner.getExecutedQueries();
      const updateQueries = queries.filter(q => q.sql.includes('UPDATE orders SET legacy_id = ?'));
      
      expect(updateQueries[0].params[0]).toBe('LEGACY_20250115_000001');
      expect(updateQueries[1].params[0]).toBe('LEGACY_20250115_000002');
      expect(updateQueries[2].params[0]).toBe('LEGACY_20250115_000015');
      
      // All legacy_id values should be unique
      const legacyIds = updateQueries.map(q => q.params[0]);
      const uniqueIds = new Set(legacyIds);
      expect(uniqueIds.size).toBe(legacyIds.length);
    });
  });

  describe('down migration', () => {
    test('should remove legacy_id column and index', async () => {
      await migration.down(mockRunner);
      
      const queries = mockRunner.getExecutedQueries();
      
      const dropIndexQuery = queries.find(q => 
        q.sql.includes('ALTER TABLE orders DROP INDEX idx_orders_legacy_id')
      );
      const dropColumnQuery = queries.find(q => 
        q.sql.includes('ALTER TABLE orders DROP COLUMN legacy_id')
      );
      
      expect(dropIndexQuery).toBeDefined();
      expect(dropColumnQuery).toBeDefined();
    });

    test('should drop index before dropping column', async () => {
      await migration.down(mockRunner);
      
      const queries = mockRunner.getExecutedQueries();
      const dropIndexIndex = queries.findIndex(q => 
        q.sql.includes('DROP INDEX idx_orders_legacy_id')
      );
      const dropColumnIndex = queries.findIndex(q => 
        q.sql.includes('DROP COLUMN legacy_id')
      );
      
      expect(dropIndexIndex).toBeLessThan(dropColumnIndex);
    });
  });

  describe('legacy_id format validation', () => {
    test('should generate legacy_id with correct date format', async () => {
      const testDate = new Date('2025-12-25T15:30:45Z');
      mockRunner.setMockData({
        existingOrders: [{ id: 42, order_date: testDate }]
      });
      
      await migration.up(mockRunner);
      
      const queries = mockRunner.getExecutedQueries();
      const updateQuery = queries.find(q => q.sql.includes('UPDATE orders SET legacy_id = ?'));
      
      expect(updateQuery.params[0]).toBe('LEGACY_20251225_000042');
    });

    test('should pad order ID to 6 digits', async () => {
      mockRunner.setMockData({
        existingOrders: [
          { id: 1, order_date: new Date('2025-01-01') },
          { id: 99, order_date: new Date('2025-01-01') },
          { id: 1000, order_date: new Date('2025-01-01') },
          { id: 999999, order_date: new Date('2025-01-01') }
        ]
      });
      
      await migration.up(mockRunner);
      
      const queries = mockRunner.getExecutedQueries();
      const updateQueries = queries.filter(q => q.sql.includes('UPDATE orders SET legacy_id = ?'));
      
      expect(updateQueries[0].params[0]).toBe('LEGACY_20250101_000001');
      expect(updateQueries[1].params[0]).toBe('LEGACY_20250101_000099');
      expect(updateQueries[2].params[0]).toBe('LEGACY_20250101_001000');
      expect(updateQueries[3].params[0]).toBe('LEGACY_20250101_999999');
    });
  });
});