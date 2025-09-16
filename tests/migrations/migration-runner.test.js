const MigrationRunner = require('../../migrations/migration-runner');
const mysql = require('mysql');
const fs = require('fs');

// Mock dependencies
jest.mock('mysql');
jest.mock('fs');

describe('MigrationRunner', () => {
  let mockConnection;
  let runner;

  beforeEach(() => {
    mockConnection = {
      connect: jest.fn(),
      query: jest.fn(),
      end: jest.fn()
    };
    mysql.createConnection.mockReturnValue(mockConnection);
    
    runner = new MigrationRunner();
    
    // Spy on console methods
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
    console.log.mockRestore();
    console.error.mockRestore();
  });

  describe('connect', () => {
    test('should connect to database successfully', async () => {
      mockConnection.connect.mockImplementation((callback) => {
        callback(null);
      });

      await runner.connect();

      expect(mockConnection.connect).toHaveBeenCalledTimes(1);
      expect(console.log).toHaveBeenCalledWith('Connected to database');
    });

    test('should handle connection errors', async () => {
      const error = new Error('Connection failed');
      mockConnection.connect.mockImplementation((callback) => {
        callback(error);
      });

      await expect(runner.connect()).rejects.toThrow('Connection failed');
      expect(console.error).toHaveBeenCalledWith('Error connecting to database:', error);
    });
  });

  describe('query', () => {
    test('should execute query successfully', async () => {
      const mockResults = [{ id: 1 }];
      mockConnection.query.mockImplementation((sql, params, callback) => {
        callback(null, mockResults);
      });

      const result = await runner.query('SELECT * FROM test', []);

      expect(result).toBe(mockResults);
      expect(mockConnection.query).toHaveBeenCalledWith('SELECT * FROM test', [], expect.any(Function));
    });

    test('should handle query errors', async () => {
      const error = new Error('Query failed');
      mockConnection.query.mockImplementation((sql, params, callback) => {
        callback(error);
      });

      await expect(runner.query('SELECT * FROM test')).rejects.toThrow('Query failed');
    });
  });

  describe('ensureMigrationsTable', () => {
    test('should create migrations table', async () => {
      mockConnection.query.mockImplementation((sql, params, callback) => {
        callback(null, {});
      });

      await runner.ensureMigrationsTable();

      expect(mockConnection.query).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE IF NOT EXISTS migrations'),
        [],
        expect.any(Function)
      );
      expect(console.log).toHaveBeenCalledWith('Migrations table ensured');
    });
  });

  describe('getExecutedMigrations', () => {
    test('should return list of executed migrations', async () => {
      const mockResults = [
        { filename: '001_create_orders_table.js' },
        { filename: '002_add_legacy_id_to_orders.js' }
      ];
      mockConnection.query.mockImplementation((sql, params, callback) => {
        callback(null, mockResults);
      });

      const result = await runner.getExecutedMigrations();

      expect(result).toEqual([
        '001_create_orders_table.js',
        '002_add_legacy_id_to_orders.js'
      ]);
    });

    test('should return empty array if migrations table does not exist', async () => {
      const error = new Error('Table does not exist');
      error.code = 'ER_NO_SUCH_TABLE';
      mockConnection.query.mockImplementation((sql, params, callback) => {
        callback(error);
      });

      const result = await runner.getExecutedMigrations();

      expect(result).toEqual([]);
    });

    test('should throw other database errors', async () => {
      const error = new Error('Database error');
      error.code = 'ER_ACCESS_DENIED';
      mockConnection.query.mockImplementation((sql, params, callback) => {
        callback(error);
      });

      await expect(runner.getExecutedMigrations()).rejects.toThrow('Database error');
    });
  });

  describe('executeMigration', () => {
    test('should execute migration and record it', async () => {
      const mockMigration = {
        up: jest.fn().mockResolvedValue()
      };
      
      // Mock require to return our mock migration
      const originalRequire = require;
      require = jest.fn((path) => {
        if (path.includes('001_test_migration.js')) {
          return mockMigration;
        }
        return originalRequire(path);
      });

      mockConnection.query.mockImplementation((sql, params, callback) => {
        callback(null, {});
      });

      await runner.executeMigration('001_test_migration.js');

      expect(mockMigration.up).toHaveBeenCalledWith(runner);
      expect(mockConnection.query).toHaveBeenCalledWith(
        'INSERT INTO migrations (filename) VALUES (?)',
        ['001_test_migration.js'],
        expect.any(Function)
      );
      expect(console.log).toHaveBeenCalledWith('Migration 001_test_migration.js executed successfully');

      // Restore require
      require = originalRequire;
    });

    test('should handle migration execution errors', async () => {
      const mockMigration = {
        up: jest.fn().mockRejectedValue(new Error('Migration failed'))
      };
      
      const originalRequire = require;
      require = jest.fn(() => mockMigration);

      await expect(runner.executeMigration('001_test_migration.js')).rejects.toThrow('Migration failed');
      expect(console.error).toHaveBeenCalledWith(
        'Error executing migration 001_test_migration.js:',
        expect.any(Error)
      );

      require = originalRequire;
    });
  });

  describe('rollbackMigration', () => {
    test('should rollback migration if down method exists', async () => {
      const mockMigration = {
        down: jest.fn().mockResolvedValue()
      };
      
      const originalRequire = require;
      require = jest.fn(() => mockMigration);

      mockConnection.query.mockImplementation((sql, params, callback) => {
        callback(null, {});
      });

      await runner.rollbackMigration('001_test_migration.js');

      expect(mockMigration.down).toHaveBeenCalledWith(runner);
      expect(mockConnection.query).toHaveBeenCalledWith(
        'DELETE FROM migrations WHERE filename = ?',
        ['001_test_migration.js'],
        expect.any(Function)
      );
      expect(console.log).toHaveBeenCalledWith('Migration 001_test_migration.js rolled back successfully');

      require = originalRequire;
    });

    test('should skip down method if not defined', async () => {
      const mockMigration = {}; // No down method
      
      const originalRequire = require;
      require = jest.fn(() => mockMigration);

      mockConnection.query.mockImplementation((sql, params, callback) => {
        callback(null, {});
      });

      await runner.rollbackMigration('001_test_migration.js');

      expect(mockConnection.query).toHaveBeenCalledWith(
        'DELETE FROM migrations WHERE filename = ?',
        ['001_test_migration.js'],
        expect.any(Function)
      );

      require = originalRequire;
    });
  });

  describe('runMigrations', () => {
    beforeEach(() => {
      runner.connect = jest.fn().mockResolvedValue();
      runner.ensureMigrationsTable = jest.fn().mockResolvedValue();
      runner.getExecutedMigrations = jest.fn().mockResolvedValue([]);
      runner.executeMigration = jest.fn().mockResolvedValue();
    });

    test('should run all pending migrations', async () => {
      fs.readdirSync.mockReturnValue([
        'migration-runner.js',
        '001_create_orders_table.js',
        '002_add_legacy_id_to_orders.js',
        'other_file.txt'
      ]);

      await runner.runMigrations();

      expect(runner.connect).toHaveBeenCalledTimes(1);
      expect(runner.ensureMigrationsTable).toHaveBeenCalledTimes(1);
      expect(runner.executeMigration).toHaveBeenCalledWith('001_create_orders_table.js');
      expect(runner.executeMigration).toHaveBeenCalledWith('002_add_legacy_id_to_orders.js');
      expect(runner.executeMigration).toHaveBeenCalledTimes(2);
      expect(mockConnection.end).toHaveBeenCalledTimes(1);
    });

    test('should skip already executed migrations', async () => {
      fs.readdirSync.mockReturnValue([
        '001_create_orders_table.js',
        '002_add_legacy_id_to_orders.js'
      ]);
      runner.getExecutedMigrations.mockResolvedValue(['001_create_orders_table.js']);

      await runner.runMigrations();

      expect(runner.executeMigration).toHaveBeenCalledWith('002_add_legacy_id_to_orders.js');
      expect(runner.executeMigration).toHaveBeenCalledTimes(1);
    });
  });
});