// Mock the Customer model first
jest.mock('../app/models/customer.model.js');

const customerController = require('../app/controllers/customer.controller.js');
const Customer = require('../app/models/customer.model.js');

describe('Customer Controller - Comprehensive Tests', () => {
  let req, res;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Mock request and response objects
    req = {
      body: {},
      params: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis()
    };

    // Suppress console.log for cleaner test output
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    console.log.mockRestore();
  });

  describe('create', () => {
    describe('Success Cases', () => {
      test('should create customer successfully with valid data', () => {
        // Arrange
        req.body = {
          email: 'test@example.com',
          name: 'Test Customer',
          active: true
        };
        const createdCustomer = { id: 1, ...req.body };
        Customer.create.mockImplementation((customer, callback) => {
          callback(null, createdCustomer);
        });

        // Act
        customerController.create(req, res);

        // Assert
        expect(Customer.create).toHaveBeenCalledWith(
          expect.objectContaining({
            email: req.body.email,
            name: req.body.name,
            active: req.body.active
          }),
          expect.any(Function)
        );
        expect(res.send).toHaveBeenCalledWith(createdCustomer);
        expect(res.status).not.toHaveBeenCalled();
      });

      test('should create customer with minimal required data', () => {
        // Arrange
        req.body = {
          email: 'minimal@example.com',
          name: 'Minimal Customer',
          active: false
        };
        const createdCustomer = { id: 2, ...req.body };
        Customer.create.mockImplementation((customer, callback) => {
          callback(null, createdCustomer);
        });

        // Act
        customerController.create(req, res);

        // Assert
        expect(Customer.create).toHaveBeenCalled();
        expect(res.send).toHaveBeenCalledWith(createdCustomer);
      });

      test('should handle undefined fields in request body', () => {
        // Arrange
        req.body = {
          email: 'test@example.com',
          name: undefined,
          active: undefined
        };
        const createdCustomer = { id: 3, email: req.body.email, name: undefined, active: undefined };
        Customer.create.mockImplementation((customer, callback) => {
          callback(null, createdCustomer);
        });

        // Act
        customerController.create(req, res);

        // Assert
        expect(Customer.create).toHaveBeenCalled();
        expect(res.send).toHaveBeenCalledWith(createdCustomer);
      });
    });

    describe('Failure Cases', () => {
      test('should return 400 when request body is null', () => {
        // Arrange
        req.body = null;

        // Act
        customerController.create(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith({
          message: 'Content can not be empty!'
        });
        expect(Customer.create).not.toHaveBeenCalled();
      });

      test('should return 400 when request body is undefined', () => {
        // Arrange
        req.body = undefined;

        // Act
        customerController.create(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith({
          message: 'Content can not be empty!'
        });
        expect(Customer.create).not.toHaveBeenCalled();
      });

      test('should return 500 when database error occurs', () => {
        // Arrange
        req.body = {
          email: 'test@example.com',
          name: 'Test Customer',
          active: true
        };
        const dbError = new Error('Database connection failed');
        Customer.create.mockImplementation((customer, callback) => {
          callback(dbError, null);
        });

        // Act
        customerController.create(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({
          message: 'Database connection failed'
        });
      });

      test('should return 500 with default message when error has no message', () => {
        // Arrange
        req.body = {
          email: 'test@example.com',
          name: 'Test Customer',
          active: true
        };
        const genericError = new Error();
        Customer.create.mockImplementation((customer, callback) => {
          callback(genericError, null);
        });

        // Act
        customerController.create(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({
          message: 'Some error occurred while creating the Customer.'
        });
      });

      test('should handle duplicate email error', () => {
        // Arrange
        req.body = {
          email: 'duplicate@example.com',
          name: 'Test Customer',
          active: true
        };
        const duplicateError = new Error('Duplicate entry for key email');
        duplicateError.code = 'ER_DUP_ENTRY';
        Customer.create.mockImplementation((customer, callback) => {
          callback(duplicateError, null);
        });

        // Act
        customerController.create(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({
          message: 'Duplicate entry for key email'
        });
      });
    });

    describe('Boundary Cases', () => {
      test('should handle empty object in request body', () => {
        // Arrange
        req.body = {};
        const createdCustomer = { id: 4, email: undefined, name: undefined, active: undefined };
        Customer.create.mockImplementation((customer, callback) => {
          callback(null, createdCustomer);
        });

        // Act
        customerController.create(req, res);

        // Assert
        expect(Customer.create).toHaveBeenCalled();
        expect(res.send).toHaveBeenCalledWith(createdCustomer);
      });

      test('should handle very long strings in request body', () => {
        // Arrange
        req.body = {
          email: 'a'.repeat(100) + '@example.com',
          name: 'B'.repeat(255),
          active: true
        };
        const createdCustomer = { id: 5, ...req.body };
        Customer.create.mockImplementation((customer, callback) => {
          callback(null, createdCustomer);
        });

        // Act
        customerController.create(req, res);

        // Assert
        expect(Customer.create).toHaveBeenCalled();
        expect(res.send).toHaveBeenCalledWith(createdCustomer);
      });

      test('should handle special characters in request body', () => {
        // Arrange
        req.body = {
          email: 'test+special@example.com',
          name: "O'Connor & Associates",
          active: 1
        };
        const createdCustomer = { id: 6, ...req.body };
        Customer.create.mockImplementation((customer, callback) => {
          callback(null, createdCustomer);
        });

        // Act
        customerController.create(req, res);

        // Assert
        expect(Customer.create).toHaveBeenCalled();
        expect(res.send).toHaveBeenCalledWith(createdCustomer);
      });
    });
  });

  describe('findAll', () => {
    describe('Success Cases', () => {
      test('should retrieve all customers successfully', () => {
        // Arrange
        const customersData = [
          { id: 1, email: 'test1@example.com', name: 'Customer 1', active: 1 },
          { id: 2, email: 'test2@example.com', name: 'Customer 2', active: 0 },
          { id: 3, email: 'test3@example.com', name: 'Customer 3', active: 1 }
        ];
        Customer.getAll.mockImplementation((callback) => {
          callback(null, customersData);
        });

        // Act
        customerController.findAll(req, res);

        // Assert
        expect(Customer.getAll).toHaveBeenCalledWith(expect.any(Function));
        expect(res.send).toHaveBeenCalledWith(customersData);
        expect(res.status).not.toHaveBeenCalled();
      });

      test('should handle empty customer list', () => {
        // Arrange
        const emptyCustomers = [];
        Customer.getAll.mockImplementation((callback) => {
          callback(null, emptyCustomers);
        });

        // Act
        customerController.findAll(req, res);

        // Assert
        expect(Customer.getAll).toHaveBeenCalled();
        expect(res.send).toHaveBeenCalledWith(emptyCustomers);
      });

      test('should handle single customer in results', () => {
        // Arrange
        const singleCustomer = [
          { id: 1, email: 'single@example.com', name: 'Single Customer', active: 1 }
        ];
        Customer.getAll.mockImplementation((callback) => {
          callback(null, singleCustomer);
        });

        // Act
        customerController.findAll(req, res);

        // Assert
        expect(Customer.getAll).toHaveBeenCalled();
        expect(res.send).toHaveBeenCalledWith(singleCustomer);
      });
    });

    describe('Failure Cases', () => {
      test('should return 500 when database error occurs', () => {
        // Arrange
        const dbError = new Error('Database connection failed');
        Customer.getAll.mockImplementation((callback) => {
          callback(dbError, null);
        });

        // Act
        customerController.findAll(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({
          message: 'Database connection failed'
        });
      });

      test('should return 500 with default message when error has no message', () => {
        // Arrange
        const genericError = new Error();
        Customer.getAll.mockImplementation((callback) => {
          callback(genericError, null);
        });

        // Act
        customerController.findAll(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({
          message: 'Some error occurred while retrieving customers.'
        });
      });

      test('should handle timeout errors', () => {
        // Arrange
        const timeoutError = new Error('Query timeout');
        timeoutError.code = 'ETIMEDOUT';
        Customer.getAll.mockImplementation((callback) => {
          callback(timeoutError, null);
        });

        // Act
        customerController.findAll(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({
          message: 'Query timeout'
        });
      });
    });

    describe('Boundary Cases', () => {
      test('should handle very large result sets', () => {
        // Arrange
        const largeCustomersData = Array.from({ length: 1000 }, (_, i) => ({
          id: i + 1,
          email: `customer${i}@example.com`,
          name: `Customer ${i}`,
          active: i % 2
        }));
        Customer.getAll.mockImplementation((callback) => {
          callback(null, largeCustomersData);
        });

        // Act
        customerController.findAll(req, res);

        // Assert
        expect(Customer.getAll).toHaveBeenCalled();
        expect(res.send).toHaveBeenCalledWith(largeCustomersData);
      });

      test('should handle customers with special characters', () => {
        // Arrange
        const specialCustomers = [
          { id: 1, email: 'josé@example.com', name: 'José García', active: 1 },
          { id: 2, email: 'müller@example.de', name: 'Hans Müller', active: 0 }
        ];
        Customer.getAll.mockImplementation((callback) => {
          callback(null, specialCustomers);
        });

        // Act
        customerController.findAll(req, res);

        // Assert
        expect(Customer.getAll).toHaveBeenCalled();
        expect(res.send).toHaveBeenCalledWith(specialCustomers);
      });
    });
  });

  describe('findOne', () => {
    describe('Success Cases', () => {
      test('should find customer by valid ID', () => {
        // Arrange
        req.params.customerId = '1';
        const customerData = {
          id: 1,
          email: 'test@example.com',
          name: 'Test Customer',
          active: 1
        };
        Customer.findById.mockImplementation((id, callback) => {
          callback(null, customerData);
        });

        // Act
        customerController.findOne(req, res);

        // Assert
        expect(Customer.findById).toHaveBeenCalledWith('1', expect.any(Function));
        expect(res.send).toHaveBeenCalledWith(customerData);
        expect(res.status).not.toHaveBeenCalled();
      });

      test('should find customer with complex data', () => {
        // Arrange
        req.params.customerId = '2';
        const complexCustomerData = {
          id: 2,
          email: 'complex@example.com',
          name: 'Complex Customer with Special Characters åäö',
          active: 0,
          created_at: '2023-01-01 10:00:00'
        };
        Customer.findById.mockImplementation((id, callback) => {
          callback(null, complexCustomerData);
        });

        // Act
        customerController.findOne(req, res);

        // Assert
        expect(Customer.findById).toHaveBeenCalledWith('2', expect.any(Function));
        expect(res.send).toHaveBeenCalledWith(complexCustomerData);
      });
    });

    describe('Failure Cases', () => {
      test('should return 404 when customer not found', () => {
        // Arrange
        req.params.customerId = '999';
        const notFoundError = { kind: 'not_found' };
        Customer.findById.mockImplementation((id, callback) => {
          callback(notFoundError, null);
        });

        // Act
        customerController.findOne(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith({
          message: 'Not found Customer with id 999.'
        });
      });

      test('should return 500 when database error occurs', () => {
        // Arrange
        req.params.customerId = '1';
        const dbError = new Error('Database connection failed');
        Customer.findById.mockImplementation((id, callback) => {
          callback(dbError, null);
        });

        // Act
        customerController.findOne(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({
          message: 'Error retrieving Customer with id 1'
        });
      });

      test('should handle generic database errors', () => {
        // Arrange
        req.params.customerId = '1';
        const genericError = { kind: 'database_error' };
        Customer.findById.mockImplementation((id, callback) => {
          callback(genericError, null);
        });

        // Act
        customerController.findOne(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({
          message: 'Error retrieving Customer with id 1'
        });
      });
    });

    describe('Boundary Cases', () => {
      test('should handle string customer ID', () => {
        // Arrange
        req.params.customerId = '123';
        const customerData = { id: 123, email: 'test@example.com', name: 'Test', active: 1 };
        Customer.findById.mockImplementation((id, callback) => {
          callback(null, customerData);
        });

        // Act
        customerController.findOne(req, res);

        // Assert
        expect(Customer.findById).toHaveBeenCalledWith('123', expect.any(Function));
        expect(res.send).toHaveBeenCalledWith(customerData);
      });

      test('should handle negative customer ID', () => {
        // Arrange
        req.params.customerId = '-1';
        const notFoundError = { kind: 'not_found' };
        Customer.findById.mockImplementation((id, callback) => {
          callback(notFoundError, null);
        });

        // Act
        customerController.findOne(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith({
          message: 'Not found Customer with id -1.'
        });
      });

      test('should handle non-numeric customer ID', () => {
        // Arrange
        req.params.customerId = 'invalid';
        const notFoundError = { kind: 'not_found' };
        Customer.findById.mockImplementation((id, callback) => {
          callback(notFoundError, null);
        });

        // Act
        customerController.findOne(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith({
          message: 'Not found Customer with id invalid.'
        });
      });

      test('should handle very large customer ID', () => {
        // Arrange
        req.params.customerId = String(Number.MAX_SAFE_INTEGER);
        const notFoundError = { kind: 'not_found' };
        Customer.findById.mockImplementation((id, callback) => {
          callback(notFoundError, null);
        });

        // Act
        customerController.findOne(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith({
          message: `Not found Customer with id ${Number.MAX_SAFE_INTEGER}.`
        });
      });
    });
  });

  describe('update', () => {
    describe('Success Cases', () => {
      test('should update customer successfully', () => {
        // Arrange
        req.params.customerId = '1';
        req.body = {
          email: 'updated@example.com',
          name: 'Updated Customer',
          active: false
        };
        const updatedCustomer = { id: 1, ...req.body };
        Customer.updateById.mockImplementation((id, customer, callback) => {
          callback(null, updatedCustomer);
        });

        // Act
        customerController.update(req, res);

        // Assert
        expect(Customer.updateById).toHaveBeenCalledWith(
          '1',
          expect.any(Object),
          expect.any(Function)
        );
        expect(res.send).toHaveBeenCalledWith(updatedCustomer);
        expect(res.status).not.toHaveBeenCalled();
      });

      test('should update customer with partial data', () => {
        // Arrange
        req.params.customerId = '2';
        req.body = {
          name: 'Partially Updated Customer'
        };
        const updatedCustomer = { id: 2, name: 'Partially Updated Customer' };
        Customer.updateById.mockImplementation((id, customer, callback) => {
          callback(null, updatedCustomer);
        });

        // Act
        customerController.update(req, res);

        // Assert
        expect(Customer.updateById).toHaveBeenCalled();
        expect(res.send).toHaveBeenCalledWith(updatedCustomer);
      });
    });

    describe('Failure Cases', () => {
      test('should return 400 when request body is null', () => {
        // Arrange
        req.params.customerId = '1';
        req.body = null;

        // Act
        customerController.update(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith({
          message: 'Content can not be empty!'
        });
        expect(Customer.updateById).not.toHaveBeenCalled();
      });

      test('should return 400 when request body is undefined', () => {
        // Arrange
        req.params.customerId = '1';
        req.body = undefined;

        // Act
        customerController.update(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith({
          message: 'Content can not be empty!'
        });
        expect(Customer.updateById).not.toHaveBeenCalled();
      });

      test('should return 404 when customer not found', () => {
        // Arrange
        req.params.customerId = '999';
        req.body = { email: 'test@example.com' };
        const notFoundError = { kind: 'not_found' };
        Customer.updateById.mockImplementation((id, customer, callback) => {
          callback(notFoundError, null);
        });

        // Act
        customerController.update(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith({
          message: 'Not found Customer with id 999.'
        });
      });

      test('should return 500 when database error occurs', () => {
        // Arrange
        req.params.customerId = '1';
        req.body = { email: 'test@example.com' };
        const dbError = new Error('Database connection failed');
        Customer.updateById.mockImplementation((id, customer, callback) => {
          callback(dbError, null);
        });

        // Act
        customerController.update(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({
          message: 'Error updating Customer with id 1'
        });
      });
    });

    describe('Boundary Cases', () => {
      test('should handle empty object in request body', () => {
        // Arrange
        req.params.customerId = '1';
        req.body = {};
        const updatedCustomer = { id: 1 };
        Customer.updateById.mockImplementation((id, customer, callback) => {
          callback(null, updatedCustomer);
        });

        // Act
        customerController.update(req, res);

        // Assert
        expect(Customer.updateById).toHaveBeenCalled();
        expect(res.send).toHaveBeenCalledWith(updatedCustomer);
      });

      test('should handle very long strings in update data', () => {
        // Arrange
        req.params.customerId = '1';
        req.body = {
          email: 'a'.repeat(100) + '@example.com',
          name: 'B'.repeat(255),
          active: true
        };
        const updatedCustomer = { id: 1, ...req.body };
        Customer.updateById.mockImplementation((id, customer, callback) => {
          callback(null, updatedCustomer);
        });

        // Act
        customerController.update(req, res);

        // Assert
        expect(Customer.updateById).toHaveBeenCalled();
        expect(res.send).toHaveBeenCalledWith(updatedCustomer);
      });
    });
  });

  describe('delete', () => {
    describe('Success Cases', () => {
      test('should delete customer successfully', () => {
        // Arrange
        req.params.customerId = '1';
        const deleteResult = { affectedRows: 1 };
        Customer.remove.mockImplementation((id, callback) => {
          callback(null, deleteResult);
        });

        // Act
        customerController.delete(req, res);

        // Assert
        expect(Customer.remove).toHaveBeenCalledWith('1', expect.any(Function));
        expect(res.send).toHaveBeenCalledWith({
          message: 'Customer was deleted successfully!'
        });
        expect(res.status).not.toHaveBeenCalled();
      });
    });

    describe('Failure Cases', () => {
      test('should return 404 when customer not found', () => {
        // Arrange
        req.params.customerId = '999';
        const notFoundError = { kind: 'not_found' };
        Customer.remove.mockImplementation((id, callback) => {
          callback(notFoundError, null);
        });

        // Act
        customerController.delete(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith({
          message: 'Not found Customer with id 999.'
        });
      });

      test('should return 500 when database error occurs', () => {
        // Arrange
        req.params.customerId = '1';
        const dbError = new Error('Database connection failed');
        Customer.remove.mockImplementation((id, callback) => {
          callback(dbError, null);
        });

        // Act
        customerController.delete(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({
          message: 'Could not delete Customer with id 1'
        });
      });
    });
  });

  describe('deleteAll', () => {
    describe('Success Cases', () => {
      test('should delete all customers successfully', () => {
        // Arrange
        const deleteResult = { affectedRows: 5 };
        Customer.removeAll.mockImplementation((callback) => {
          callback(null, deleteResult);
        });

        // Act
        customerController.deleteAll(req, res);

        // Assert
        expect(Customer.removeAll).toHaveBeenCalledWith(expect.any(Function));
        expect(res.send).toHaveBeenCalledWith({
          message: 'All Customers were deleted successfully!'
        });
        expect(res.status).not.toHaveBeenCalled();
      });

      test('should handle empty table deletion', () => {
        // Arrange
        const deleteResult = { affectedRows: 0 };
        Customer.removeAll.mockImplementation((callback) => {
          callback(null, deleteResult);
        });

        // Act
        customerController.deleteAll(req, res);

        // Assert
        expect(Customer.removeAll).toHaveBeenCalled();
        expect(res.send).toHaveBeenCalledWith({
          message: 'All Customers were deleted successfully!'
        });
      });
    });

    describe('Failure Cases', () => {
      test('should return 500 when database error occurs', () => {
        // Arrange
        const dbError = new Error('Database connection failed');
        Customer.removeAll.mockImplementation((callback) => {
          callback(dbError, null);
        });

        // Act
        customerController.deleteAll(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({
          message: 'Database connection failed'
        });
      });

      test('should return 500 with default message when error has no message', () => {
        // Arrange
        const genericError = new Error();
        Customer.removeAll.mockImplementation((callback) => {
          callback(genericError, null);
        });

        // Act
        customerController.deleteAll(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({
          message: 'Some error occurred while removing all customers.'
        });
      });
    });
  });
});