// Mock the database module first
jest.mock('../app/models/db.js', () => ({
  query: jest.fn()
}));

const Customer = require('../app/models/customer.model.js');

// Get reference to the mocked database
const mockDb = require('../app/models/db.js');

describe('Customer Model - Comprehensive Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDb.query.mockReset();
    // Suppress console.log for cleaner test output
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    console.log.mockRestore();
  });

  describe('Customer.create', () => {
    const validCustomerData = {
      email: 'test@example.com',
      name: 'Test Customer',
      active: true
    };

    describe('Success Cases', () => {
      test('should create customer successfully with valid data', (done) => {
        // Arrange
        const insertResult = { insertId: 1, affectedRows: 1 };
        mockDb.query.mockImplementation((query, data, callback) => {
          expect(query).toBe('INSERT INTO customers SET ?');
          expect(data).toEqual(validCustomerData);
          callback(null, insertResult);
        });

        // Act
        Customer.create(validCustomerData, (err, result) => {
          // Assert
          expect(err).toBeNull();
          expect(result).toEqual({
            id: 1,
            ...validCustomerData
          });
          expect(mockDb.query).toHaveBeenCalledTimes(1);
          done();
        });
      });

      test('should create customer with minimal data', (done) => {
        // Arrange
        const minimalData = {
          email: 'minimal@example.com',
          name: 'Minimal Customer',
          active: false
        };
        const insertResult = { insertId: 2, affectedRows: 1 };
        mockDb.query.mockImplementation((query, data, callback) => {
          callback(null, insertResult);
        });

        // Act
        Customer.create(minimalData, (err, result) => {
          // Assert
          expect(err).toBeNull();
          expect(result).toEqual({
            id: 2,
            ...minimalData
          });
          done();
        });
      });

      test('should handle empty customer data', (done) => {
        // Arrange
        const emptyData = {};
        const insertResult = { insertId: 3, affectedRows: 1 };
        mockDb.query.mockImplementation((query, data, callback) => {
          callback(null, insertResult);
        });

        // Act
        Customer.create(emptyData, (err, result) => {
          // Assert
          expect(err).toBeNull();
          expect(result).toEqual({
            id: 3,
            ...emptyData
          });
          done();
        });
      });
    });

    describe('Failure Cases', () => {
      test('should handle database connection error', (done) => {
        // Arrange
        const dbError = new Error('Connection failed');
        mockDb.query.mockImplementation((query, data, callback) => {
          callback(dbError, null);
        });

        // Act
        Customer.create(validCustomerData, (err, result) => {
          // Assert
          expect(err).toBe(dbError);
          expect(result).toBeNull();
          done();
        });
      });

      test('should handle duplicate email error', (done) => {
        // Arrange
        const duplicateError = new Error('Duplicate entry');
        duplicateError.code = 'ER_DUP_ENTRY';
        mockDb.query.mockImplementation((query, data, callback) => {
          callback(duplicateError, null);
        });

        // Act
        Customer.create(validCustomerData, (err, result) => {
          // Assert
          expect(err).toBe(duplicateError);
          expect(result).toBeNull();
          done();
        });
      });

      test('should handle constraint violation errors', (done) => {
        // Arrange
        const constraintError = new Error('Check constraint violation');
        constraintError.code = 'ER_CHECK_CONSTRAINT_VIOLATED';
        mockDb.query.mockImplementation((query, data, callback) => {
          callback(constraintError, null);
        });

        // Act
        Customer.create(validCustomerData, (err, result) => {
          // Assert
          expect(err).toBe(constraintError);
          expect(result).toBeNull();
          done();
        });
      });
    });

    describe('Boundary Cases', () => {
      test('should handle null values in customer data', (done) => {
        // Arrange
        const nullData = {
          email: null,
          name: null,
          active: null
        };
        const insertResult = { insertId: 4, affectedRows: 1 };
        mockDb.query.mockImplementation((query, data, callback) => {
          callback(null, insertResult);
        });

        // Act
        Customer.create(nullData, (err, result) => {
          // Assert
          expect(err).toBeNull();
          expect(result).toEqual({
            id: 4,
            ...nullData
          });
          done();
        });
      });

      test('should handle very long strings', (done) => {
        // Arrange
        const longData = {
          email: 'a'.repeat(100) + '@example.com',
          name: 'B'.repeat(255),
          active: true
        };
        const insertResult = { insertId: 5, affectedRows: 1 };
        mockDb.query.mockImplementation((query, data, callback) => {
          callback(null, insertResult);
        });

        // Act
        Customer.create(longData, (err, result) => {
          // Assert
          expect(err).toBeNull();
          expect(result).toEqual({
            id: 5,
            ...longData
          });
          done();
        });
      });

      test('should handle special characters in data', (done) => {
        // Arrange
        const specialData = {
          email: 'test+special@example.com',
          name: "O'Connor & Associates",
          active: 1
        };
        const insertResult = { insertId: 6, affectedRows: 1 };
        mockDb.query.mockImplementation((query, data, callback) => {
          callback(null, insertResult);
        });

        // Act
        Customer.create(specialData, (err, result) => {
          // Assert
          expect(err).toBeNull();
          expect(result).toEqual({
            id: 6,
            ...specialData
          });
          done();
        });
      });
    });
  });

  describe('Customer.findById', () => {
    describe('Success Cases', () => {
      test('should find customer by valid ID', (done) => {
        // Arrange
        const customerId = 1;
        const customerData = {
          id: 1,
          email: 'test@example.com',
          name: 'Test Customer',
          active: 1
        };
        mockDb.query.mockImplementation((query, callback) => {
          expect(query).toBe('SELECT * FROM customers WHERE id = 1');
          callback(null, [customerData]);
        });

        // Act
        Customer.findById(customerId, (err, result) => {
          // Assert
          expect(err).toBeNull();
          expect(result).toEqual(customerData);
          expect(mockDb.query).toHaveBeenCalledTimes(1);
          done();
        });
      });

      test('should find customer with complex data', (done) => {
        // Arrange
        const customerId = 2;
        const complexCustomerData = {
          id: 2,
          email: 'complex@example.com',
          name: 'Complex Customer with Special Characters åäö',
          active: 0,
          created_at: '2023-01-01 10:00:00',
          updated_at: '2023-01-02 15:30:00'
        };
        mockDb.query.mockImplementation((query, callback) => {
          callback(null, [complexCustomerData]);
        });

        // Act
        Customer.findById(customerId, (err, result) => {
          // Assert
          expect(err).toBeNull();
          expect(result).toEqual(complexCustomerData);
          done();
        });
      });
    });

    describe('Failure Cases', () => {
      test('should return not_found error when customer does not exist', (done) => {
        // Arrange
        const customerId = 999;
        mockDb.query.mockImplementation((query, callback) => {
          callback(null, []); // Empty result
        });

        // Act
        Customer.findById(customerId, (err, result) => {
          // Assert
          expect(err).toEqual({ kind: 'not_found' });
          expect(result).toBeNull();
          done();
        });
      });

      test('should handle database connection error', (done) => {
        // Arrange
        const customerId = 1;
        const dbError = new Error('Database connection failed');
        mockDb.query.mockImplementation((query, callback) => {
          callback(dbError, null);
        });

        // Act
        Customer.findById(customerId, (err, result) => {
          // Assert
          expect(err).toBe(dbError);
          expect(result).toBeNull();
          done();
        });
      });

      test('should handle malformed query results', (done) => {
        // Arrange
        const customerId = 1;
        mockDb.query.mockImplementation((query, callback) => {
          callback(null, null); // Malformed result
        });

        // Act
        Customer.findById(customerId, (err, result) => {
          // Assert
          expect(err).toEqual({ kind: 'not_found' });
          expect(result).toBeNull();
          done();
        });
      });
    });

    describe('Boundary Cases', () => {
      test('should handle string ID that converts to number', (done) => {
        // Arrange
        const customerId = '123';
        const customerData = { id: 123, email: 'test@example.com', name: 'Test', active: 1 };
        mockDb.query.mockImplementation((query, callback) => {
          expect(query).toBe('SELECT * FROM customers WHERE id = 123');
          callback(null, [customerData]);
        });

        // Act
        Customer.findById(customerId, (err, result) => {
          // Assert
          expect(err).toBeNull();
          expect(result).toEqual(customerData);
          done();
        });
      });

      test('should handle negative ID', (done) => {
        // Arrange
        const customerId = -1;
        mockDb.query.mockImplementation((query, callback) => {
          callback(null, []);
        });

        // Act
        Customer.findById(customerId, (err, result) => {
          // Assert
          expect(err).toEqual({ kind: 'not_found' });
          expect(result).toBeNull();
          done();
        });
      });

      test('should handle very large ID', (done) => {
        // Arrange
        const customerId = Number.MAX_SAFE_INTEGER;
        mockDb.query.mockImplementation((query, callback) => {
          callback(null, []);
        });

        // Act
        Customer.findById(customerId, (err, result) => {
          // Assert
          expect(err).toEqual({ kind: 'not_found' });
          expect(result).toBeNull();
          done();
        });
      });

      test('should handle zero ID', (done) => {
        // Arrange
        const customerId = 0;
        mockDb.query.mockImplementation((query, callback) => {
          callback(null, []);
        });

        // Act
        Customer.findById(customerId, (err, result) => {
          // Assert
          expect(err).toEqual({ kind: 'not_found' });
          expect(result).toBeNull();
          done();
        });
      });
    });
  });

  describe('Customer.getAll', () => {
    describe('Success Cases', () => {
      test('should retrieve all customers successfully', (done) => {
        // Arrange
        const customersData = [
          { id: 1, email: 'test1@example.com', name: 'Customer 1', active: 1 },
          { id: 2, email: 'test2@example.com', name: 'Customer 2', active: 0 },
          { id: 3, email: 'test3@example.com', name: 'Customer 3', active: 1 }
        ];
        mockDb.query.mockImplementation((query, callback) => {
          expect(query).toBe('SELECT * FROM customers');
          callback(null, customersData);
        });

        // Act
        Customer.getAll((err, result) => {
          // Assert
          expect(err).toBeNull();
          expect(result).toEqual(customersData);
          expect(result).toHaveLength(3);
          expect(mockDb.query).toHaveBeenCalledTimes(1);
          done();
        });
      });

      test('should handle empty customer list', (done) => {
        // Arrange
        mockDb.query.mockImplementation((query, callback) => {
          callback(null, []);
        });

        // Act
        Customer.getAll((err, result) => {
          // Assert
          expect(err).toBeNull();
          expect(result).toEqual([]);
          expect(result).toHaveLength(0);
          done();
        });
      });

      test('should handle single customer in results', (done) => {
        // Arrange
        const singleCustomer = [
          { id: 1, email: 'single@example.com', name: 'Single Customer', active: 1 }
        ];
        mockDb.query.mockImplementation((query, callback) => {
          callback(null, singleCustomer);
        });

        // Act
        Customer.getAll((err, result) => {
          // Assert
          expect(err).toBeNull();
          expect(result).toEqual(singleCustomer);
          expect(result).toHaveLength(1);
          done();
        });
      });
    });

    describe('Failure Cases', () => {
      test('should handle database connection error', (done) => {
        // Arrange
        const dbError = new Error('Database connection failed');
        mockDb.query.mockImplementation((query, callback) => {
          callback(dbError, null);
        });

        // Act
        Customer.getAll((err, result) => {
          // Assert
          expect(err).toBe(dbError);
          expect(result).toBeNull();
          done();
        });
      });

      test('should handle timeout errors', (done) => {
        // Arrange
        const timeoutError = new Error('Query timeout');
        timeoutError.code = 'ETIMEDOUT';
        mockDb.query.mockImplementation((query, callback) => {
          callback(timeoutError, null);
        });

        // Act
        Customer.getAll((err, result) => {
          // Assert
          expect(err).toBe(timeoutError);
          expect(result).toBeNull();
          done();
        });
      });
    });

    describe('Boundary Cases', () => {
      test('should handle very large result sets', (done) => {
        // Arrange
        const largeCustomersData = Array.from({ length: 1000 }, (_, i) => ({
          id: i + 1,
          email: `customer${i}@example.com`,
          name: `Customer ${i}`,
          active: i % 2
        }));
        mockDb.query.mockImplementation((query, callback) => {
          callback(null, largeCustomersData);
        });

        // Act
        Customer.getAll((err, result) => {
          // Assert
          expect(err).toBeNull();
          expect(result).toHaveLength(1000);
          expect(result[0]).toEqual(largeCustomersData[0]);
          expect(result[999]).toEqual(largeCustomersData[999]);
          done();
        });
      });

      test('should handle customers with special characters', (done) => {
        // Arrange
        const specialCustomers = [
          { id: 1, email: 'josé@example.com', name: 'José García', active: 1 },
          { id: 2, email: 'müller@example.de', name: 'Hans Müller', active: 0 },
          { id: 3, email: 'tanaka@example.jp', name: '田中太郎', active: 1 }
        ];
        mockDb.query.mockImplementation((query, callback) => {
          callback(null, specialCustomers);
        });

        // Act
        Customer.getAll((err, result) => {
          // Assert
          expect(err).toBeNull();
          expect(result).toEqual(specialCustomers);
          done();
        });
      });
    });
  });

  describe('Customer.updateById', () => {
    const updateData = {
      email: 'updated@example.com',
      name: 'Updated Customer',
      active: false
    };

    describe('Success Cases', () => {
      test('should update customer successfully', (done) => {
        // Arrange
        const customerId = 1;
        const updateResult = { affectedRows: 1, changedRows: 1 };
        mockDb.query.mockImplementation((query, params, callback) => {
          expect(query).toBe('UPDATE customers SET email = ?, name = ?, active = ? WHERE id = ?');
          expect(params).toEqual([updateData.email, updateData.name, updateData.active, customerId]);
          callback(null, updateResult);
        });

        // Act
        Customer.updateById(customerId, updateData, (err, result) => {
          // Assert
          expect(err).toBeNull();
          expect(result).toEqual({
            id: customerId,
            ...updateData
          });
          expect(mockDb.query).toHaveBeenCalledTimes(1);
          done();
        });
      });

      test('should update customer with partial data', (done) => {
        // Arrange
        const customerId = 2;
        const partialUpdateData = {
          email: 'partial@example.com',
          name: undefined,
          active: null
        };
        const updateResult = { affectedRows: 1, changedRows: 1 };
        mockDb.query.mockImplementation((query, params, callback) => {
          callback(null, updateResult);
        });

        // Act
        Customer.updateById(customerId, partialUpdateData, (err, result) => {
          // Assert
          expect(err).toBeNull();
          expect(result).toEqual({
            id: customerId,
            ...partialUpdateData
          });
          done();
        });
      });
    });

    describe('Failure Cases', () => {
      test('should return not_found error when customer does not exist', (done) => {
        // Arrange
        const customerId = 999;
        const updateResult = { affectedRows: 0, changedRows: 0 };
        mockDb.query.mockImplementation((query, params, callback) => {
          callback(null, updateResult);
        });

        // Act
        Customer.updateById(customerId, updateData, (err, result) => {
          // Assert
          expect(err).toEqual({ kind: 'not_found' });
          expect(result).toBeNull();
          done();
        });
      });

      test('should handle database connection error', (done) => {
        // Arrange
        const customerId = 1;
        const dbError = new Error('Database connection failed');
        mockDb.query.mockImplementation((query, params, callback) => {
          callback(dbError, null);
        });

        // Act
        Customer.updateById(customerId, updateData, (err, result) => {
          // Assert
          expect(err).toBe(dbError);
          expect(result).toBeNull();
          done();
        });
      });

      test('should handle constraint violation errors', (done) => {
        // Arrange
        const customerId = 1;
        const constraintError = new Error('Duplicate entry for key email');
        constraintError.code = 'ER_DUP_ENTRY';
        mockDb.query.mockImplementation((query, params, callback) => {
          callback(constraintError, null);
        });

        // Act
        Customer.updateById(customerId, updateData, (err, result) => {
          // Assert
          expect(err).toBe(constraintError);
          expect(result).toBeNull();
          done();
        });
      });
    });

    describe('Boundary Cases', () => {
      test('should handle string customer ID', (done) => {
        // Arrange
        const customerId = '123';
        const updateResult = { affectedRows: 1, changedRows: 1 };
        mockDb.query.mockImplementation((query, params, callback) => {
          expect(params[3]).toBe('123'); // ID should be passed as string
          callback(null, updateResult);
        });

        // Act
        Customer.updateById(customerId, updateData, (err, result) => {
          // Assert
          expect(err).toBeNull();
          expect(result.id).toBe(customerId);
          done();
        });
      });

      test('should handle negative customer ID', (done) => {
        // Arrange
        const customerId = -1;
        const updateResult = { affectedRows: 0, changedRows: 0 };
        mockDb.query.mockImplementation((query, params, callback) => {
          callback(null, updateResult);
        });

        // Act
        Customer.updateById(customerId, updateData, (err, result) => {
          // Assert
          expect(err).toEqual({ kind: 'not_found' });
          expect(result).toBeNull();
          done();
        });
      });

      test('should handle empty update data', (done) => {
        // Arrange
        const customerId = 1;
        const emptyUpdateData = {};
        const updateResult = { affectedRows: 1, changedRows: 0 };
        mockDb.query.mockImplementation((query, params, callback) => {
          callback(null, updateResult);
        });

        // Act
        Customer.updateById(customerId, emptyUpdateData, (err, result) => {
          // Assert
          expect(err).toBeNull();
          expect(result).toEqual({
            id: customerId,
            ...emptyUpdateData
          });
          done();
        });
      });
    });
  });

  describe('Customer.remove', () => {
    describe('Success Cases', () => {
      test('should delete customer successfully', (done) => {
        // Arrange
        const customerId = 1;
        const deleteResult = { affectedRows: 1 };
        mockDb.query.mockImplementation((query, params, callback) => {
          expect(query).toBe('DELETE FROM customers WHERE id = ?');
          expect(params).toBe(customerId);
          callback(null, deleteResult);
        });

        // Act
        Customer.remove(customerId, (err, result) => {
          // Assert
          expect(err).toBeNull();
          expect(result).toEqual(deleteResult);
          expect(mockDb.query).toHaveBeenCalledTimes(1);
          done();
        });
      });
    });

    describe('Failure Cases', () => {
      test('should return not_found error when customer does not exist', (done) => {
        // Arrange
        const customerId = 999;
        const deleteResult = { affectedRows: 0 };
        mockDb.query.mockImplementation((query, params, callback) => {
          callback(null, deleteResult);
        });

        // Act
        Customer.remove(customerId, (err, result) => {
          // Assert
          expect(err).toEqual({ kind: 'not_found' });
          expect(result).toBeNull();
          done();
        });
      });

      test('should handle database connection error', (done) => {
        // Arrange
        const customerId = 1;
        const dbError = new Error('Database connection failed');
        mockDb.query.mockImplementation((query, params, callback) => {
          callback(dbError, null);
        });

        // Act
        Customer.remove(customerId, (err, result) => {
          // Assert
          expect(err).toBe(dbError);
          expect(result).toBeNull();
          done();
        });
      });

      test('should handle foreign key constraint errors', (done) => {
        // Arrange
        const customerId = 1;
        const fkError = new Error('Cannot delete: foreign key constraint fails');
        fkError.code = 'ER_ROW_IS_REFERENCED_2';
        mockDb.query.mockImplementation((query, params, callback) => {
          callback(fkError, null);
        });

        // Act
        Customer.remove(customerId, (err, result) => {
          // Assert
          expect(err).toBe(fkError);
          expect(result).toBeNull();
          done();
        });
      });
    });

    describe('Boundary Cases', () => {
      test('should handle string customer ID', (done) => {
        // Arrange
        const customerId = '123';
        const deleteResult = { affectedRows: 1 };
        mockDb.query.mockImplementation((query, params, callback) => {
          expect(params).toBe('123');
          callback(null, deleteResult);
        });

        // Act
        Customer.remove(customerId, (err, result) => {
          // Assert
          expect(err).toBeNull();
          expect(result).toEqual(deleteResult);
          done();
        });
      });

      test('should handle negative customer ID', (done) => {
        // Arrange
        const customerId = -1;
        const deleteResult = { affectedRows: 0 };
        mockDb.query.mockImplementation((query, params, callback) => {
          callback(null, deleteResult);
        });

        // Act
        Customer.remove(customerId, (err, result) => {
          // Assert
          expect(err).toEqual({ kind: 'not_found' });
          expect(result).toBeNull();
          done();
        });
      });
    });
  });

  describe('Customer.removeAll', () => {
    describe('Success Cases', () => {
      test('should delete all customers successfully', (done) => {
        // Arrange
        const deleteResult = { affectedRows: 5 };
        mockDb.query.mockImplementation((query, callback) => {
          expect(query).toBe('DELETE FROM customers');
          callback(null, deleteResult);
        });

        // Act
        Customer.removeAll((err, result) => {
          // Assert
          expect(err).toBeNull();
          expect(result).toEqual(deleteResult);
          expect(mockDb.query).toHaveBeenCalledTimes(1);
          done();
        });
      });

      test('should handle empty table deletion', (done) => {
        // Arrange
        const deleteResult = { affectedRows: 0 };
        mockDb.query.mockImplementation((query, callback) => {
          callback(null, deleteResult);
        });

        // Act
        Customer.removeAll((err, result) => {
          // Assert
          expect(err).toBeNull();
          expect(result).toEqual(deleteResult);
          done();
        });
      });

      test('should handle large table deletion', (done) => {
        // Arrange
        const deleteResult = { affectedRows: 10000 };
        mockDb.query.mockImplementation((query, callback) => {
          callback(null, deleteResult);
        });

        // Act
        Customer.removeAll((err, result) => {
          // Assert
          expect(err).toBeNull();
          expect(result).toEqual(deleteResult);
          done();
        });
      });
    });

    describe('Failure Cases', () => {
      test('should handle database connection error', (done) => {
        // Arrange
        const dbError = new Error('Database connection failed');
        mockDb.query.mockImplementation((query, callback) => {
          callback(dbError, null);
        });

        // Act
        Customer.removeAll((err, result) => {
          // Assert
          expect(err).toBe(dbError);
          expect(result).toBeNull();
          done();
        });
      });

      test('should handle permission denied errors', (done) => {
        // Arrange
        const permissionError = new Error('Access denied for user');
        permissionError.code = 'ER_ACCESS_DENIED_ERROR';
        mockDb.query.mockImplementation((query, callback) => {
          callback(permissionError, null);
        });

        // Act
        Customer.removeAll((err, result) => {
          // Assert
          expect(err).toBe(permissionError);
          expect(result).toBeNull();
          done();
        });
      });

      test('should handle table lock errors', (done) => {
        // Arrange
        const lockError = new Error('Table is locked');
        lockError.code = 'ER_TABLE_NOT_LOCKED';
        mockDb.query.mockImplementation((query, callback) => {
          callback(lockError, null);
        });

        // Act
        Customer.removeAll((err, result) => {
          // Assert
          expect(err).toBe(lockError);
          expect(result).toBeNull();
          done();
        });
      });
    });
  });
});