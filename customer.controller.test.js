const customerController = require('./app/controllers/customer.controller');
const Customer = require('./app/models/customer.model');

// Mock the Customer model
jest.mock('./app/models/customer.model');

describe('Customer Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      params: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis()
    };
    jest.clearAllMocks();
  });

  describe('create', () => {
    describe('Success Cases', () => {
      it('should create a customer successfully with valid data', () => {
        req.body = {
          email: 'test@example.com',
          name: 'Test User',
          active: true
        };

        const mockCustomerData = { id: 1, ...req.body };
        Customer.create.mockImplementation((customer, callback) => {
          callback(null, mockCustomerData);
        });

        customerController.create(req, res);

        expect(Customer.create).toHaveBeenCalledWith(
          expect.objectContaining({
            email: 'test@example.com',
            name: 'Test User',
            active: true
          }),
          expect.any(Function)
        );
        expect(res.send).toHaveBeenCalledWith(mockCustomerData);
        expect(res.status).not.toHaveBeenCalled();
      });

      it('should create a customer with minimal required data', () => {
        req.body = {
          email: 'minimal@example.com',
          name: 'Minimal User'
        };

        const mockCustomerData = { id: 2, ...req.body };
        Customer.create.mockImplementation((customer, callback) => {
          callback(null, mockCustomerData);
        });

        customerController.create(req, res);

        expect(Customer.create).toHaveBeenCalled();
        expect(res.send).toHaveBeenCalledWith(mockCustomerData);
      });
    });

    describe('Failure Cases', () => {
      it('should return 400 when request body is empty', () => {
        req.body = null;

        customerController.create(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith({
          message: "Content can not be empty!"
        });
        expect(Customer.create).not.toHaveBeenCalled();
      });

      it('should return 500 when database error occurs', () => {
        req.body = {
          email: 'error@example.com',
          name: 'Error User',
          active: true
        };

        const mockError = new Error('Database connection failed');
        Customer.create.mockImplementation((customer, callback) => {
          callback(mockError, null);
        });

        customerController.create(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({
          message: 'Database connection failed'
        });
      });

      it('should return 500 with default error message when error has no message', () => {
        req.body = {
          email: 'error@example.com',
          name: 'Error User'
        };

        Customer.create.mockImplementation((customer, callback) => {
          callback({}, null);
        });

        customerController.create(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({
          message: 'Some error occurred while creating the Customer.'
        });
      });
    });

    describe('Boundary Cases', () => {
      it('should handle empty string values in request body', () => {
        req.body = {
          email: '',
          name: '',
          active: false
        };

        const mockCustomerData = { id: 3, ...req.body };
        Customer.create.mockImplementation((customer, callback) => {
          callback(null, mockCustomerData);
        });

        customerController.create(req, res);

        expect(Customer.create).toHaveBeenCalledWith(
          expect.objectContaining({
            email: '',
            name: '',
            active: false
          }),
          expect.any(Function)
        );
        expect(res.send).toHaveBeenCalledWith(mockCustomerData);
      });

      it('should handle undefined values in request body', () => {
        req.body = {
          email: undefined,
          name: undefined,
          active: undefined
        };

        const mockCustomerData = { id: 4, ...req.body };
        Customer.create.mockImplementation((customer, callback) => {
          callback(null, mockCustomerData);
        });

        customerController.create(req, res);

        expect(Customer.create).toHaveBeenCalled();
        expect(res.send).toHaveBeenCalledWith(mockCustomerData);
      });
    });
  });

  describe('findAll', () => {
    describe('Success Cases', () => {
      it('should retrieve all customers successfully', () => {
        const mockCustomers = [
          { id: 1, email: 'user1@example.com', name: 'User 1', active: true },
          { id: 2, email: 'user2@example.com', name: 'User 2', active: false }
        ];

        Customer.getAll.mockImplementation((callback) => {
          callback(null, mockCustomers);
        });

        customerController.findAll(req, res);

        expect(Customer.getAll).toHaveBeenCalledWith(expect.any(Function));
        expect(res.send).toHaveBeenCalledWith(mockCustomers);
        expect(res.status).not.toHaveBeenCalled();
      });

      it('should handle empty customer list', () => {
        Customer.getAll.mockImplementation((callback) => {
          callback(null, []);
        });

        customerController.findAll(req, res);

        expect(res.send).toHaveBeenCalledWith([]);
      });
    });

    describe('Failure Cases', () => {
      it('should return 500 when database error occurs', () => {
        const mockError = new Error('Database query failed');
        Customer.getAll.mockImplementation((callback) => {
          callback(mockError, null);
        });

        customerController.findAll(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({
          message: 'Database query failed'
        });
      });

      it('should return 500 with default error message when error has no message', () => {
        Customer.getAll.mockImplementation((callback) => {
          callback({}, null);
        });

        customerController.findAll(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({
          message: 'Some error occurred while retrieving customers.'
        });
      });
    });
  });

  describe('findOne', () => {
    describe('Success Cases', () => {
      it('should find a customer by ID successfully', () => {
        req.params.customerId = '1';
        const mockCustomer = { id: 1, email: 'user1@example.com', name: 'User 1', active: true };

        Customer.findById.mockImplementation((id, callback) => {
          callback(null, mockCustomer);
        });

        customerController.findOne(req, res);

        expect(Customer.findById).toHaveBeenCalledWith('1', expect.any(Function));
        expect(res.send).toHaveBeenCalledWith(mockCustomer);
        expect(res.status).not.toHaveBeenCalled();
      });
    });

    describe('Failure Cases', () => {
      it('should return 404 when customer is not found', () => {
        req.params.customerId = '999';
        const notFoundError = { kind: 'not_found' };

        Customer.findById.mockImplementation((id, callback) => {
          callback(notFoundError, null);
        });

        customerController.findOne(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith({
          message: 'Not found Customer with id 999.'
        });
      });

      it('should return 500 when database error occurs', () => {
        req.params.customerId = '1';
        const mockError = new Error('Database connection failed');

        Customer.findById.mockImplementation((id, callback) => {
          callback(mockError, null);
        });

        customerController.findOne(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({
          message: 'Error retrieving Customer with id 1'
        });
      });
    });

    describe('Boundary Cases', () => {
      it('should handle string ID parameter', () => {
        req.params.customerId = 'abc';
        const mockCustomer = { id: 'abc', email: 'user@example.com', name: 'User', active: true };

        Customer.findById.mockImplementation((id, callback) => {
          callback(null, mockCustomer);
        });

        customerController.findOne(req, res);

        expect(Customer.findById).toHaveBeenCalledWith('abc', expect.any(Function));
        expect(res.send).toHaveBeenCalledWith(mockCustomer);
      });

      it('should handle undefined ID parameter', () => {
        req.params.customerId = undefined;

        Customer.findById.mockImplementation((id, callback) => {
          callback({ kind: 'not_found' }, null);
        });

        customerController.findOne(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
      });
    });
  });

  describe('update', () => {
    describe('Success Cases', () => {
      it('should update a customer successfully', () => {
        req.params.customerId = '1';
        req.body = {
          email: 'updated@example.com',
          name: 'Updated User',
          active: false
        };

        const mockUpdatedCustomer = { id: 1, ...req.body };
        Customer.updateById.mockImplementation((id, customer, callback) => {
          callback(null, mockUpdatedCustomer);
        });

        customerController.update(req, res);

        expect(Customer.updateById).toHaveBeenCalledWith(
          '1',
          expect.any(Object),
          expect.any(Function)
        );
        expect(res.send).toHaveBeenCalledWith(mockUpdatedCustomer);
      });

      it('should update customer with partial data', () => {
        req.params.customerId = '1';
        req.body = { name: 'Partially Updated' };

        const mockUpdatedCustomer = { id: 1, name: 'Partially Updated' };
        Customer.updateById.mockImplementation((id, customer, callback) => {
          callback(null, mockUpdatedCustomer);
        });

        customerController.update(req, res);

        expect(Customer.updateById).toHaveBeenCalled();
        expect(res.send).toHaveBeenCalledWith(mockUpdatedCustomer);
      });
    });

    describe('Failure Cases', () => {
      it('should return 400 when request body is empty', () => {
        req.params.customerId = '1';
        req.body = null;

        customerController.update(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith({
          message: "Content can not be empty!"
        });
        expect(Customer.updateById).not.toHaveBeenCalled();
      });

      it('should return 404 when customer is not found', () => {
        req.params.customerId = '999';
        req.body = { name: 'Updated Name' };

        const notFoundError = { kind: 'not_found' };
        Customer.updateById.mockImplementation((id, customer, callback) => {
          callback(notFoundError, null);
        });

        customerController.update(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith({
          message: 'Not found Customer with id 999.'
        });
      });

      it('should return 500 when database error occurs', () => {
        req.params.customerId = '1';
        req.body = { name: 'Updated Name' };

        const mockError = new Error('Update failed');
        Customer.updateById.mockImplementation((id, customer, callback) => {
          callback(mockError, null);
        });

        customerController.update(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({
          message: 'Error updating Customer with id 1'
        });
      });
    });

    describe('Boundary Cases', () => {
      it('should handle empty object as request body', () => {
        req.params.customerId = '1';
        req.body = {};

        const mockUpdatedCustomer = { id: 1 };
        Customer.updateById.mockImplementation((id, customer, callback) => {
          callback(null, mockUpdatedCustomer);
        });

        customerController.update(req, res);

        expect(Customer.updateById).toHaveBeenCalled();
        expect(res.send).toHaveBeenCalledWith(mockUpdatedCustomer);
      });
    });
  });

  describe('delete', () => {
    describe('Success Cases', () => {
      it('should delete a customer successfully', () => {
        req.params.customerId = '1';

        Customer.remove.mockImplementation((id, callback) => {
          callback(null, { affectedRows: 1 });
        });

        customerController.delete(req, res);

        expect(Customer.remove).toHaveBeenCalledWith('1', expect.any(Function));
        expect(res.send).toHaveBeenCalledWith({
          message: 'Customer was deleted successfully!'
        });
        expect(res.status).not.toHaveBeenCalled();
      });
    });

    describe('Failure Cases', () => {
      it('should return 404 when customer is not found', () => {
        req.params.customerId = '999';

        const notFoundError = { kind: 'not_found' };
        Customer.remove.mockImplementation((id, callback) => {
          callback(notFoundError, null);
        });

        customerController.delete(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith({
          message: 'Not found Customer with id 999.'
        });
      });

      it('should return 500 when database error occurs', () => {
        req.params.customerId = '1';

        const mockError = new Error('Delete operation failed');
        Customer.remove.mockImplementation((id, callback) => {
          callback(mockError, null);
        });

        customerController.delete(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({
          message: 'Could not delete Customer with id 1'
        });
      });
    });

    describe('Boundary Cases', () => {
      it('should handle non-numeric ID', () => {
        req.params.customerId = 'non-numeric-id';

        Customer.remove.mockImplementation((id, callback) => {
          callback(null, { affectedRows: 1 });
        });

        customerController.delete(req, res);

        expect(Customer.remove).toHaveBeenCalledWith('non-numeric-id', expect.any(Function));
        expect(res.send).toHaveBeenCalledWith({
          message: 'Customer was deleted successfully!'
        });
      });
    });
  });

  describe('deleteAll', () => {
    describe('Success Cases', () => {
      it('should delete all customers successfully', () => {
        Customer.removeAll.mockImplementation((callback) => {
          callback(null, { affectedRows: 5 });
        });

        customerController.deleteAll(req, res);

        expect(Customer.removeAll).toHaveBeenCalledWith(expect.any(Function));
        expect(res.send).toHaveBeenCalledWith({
          message: 'All Customers were deleted successfully!'
        });
        expect(res.status).not.toHaveBeenCalled();
      });

      it('should handle case when no customers exist to delete', () => {
        Customer.removeAll.mockImplementation((callback) => {
          callback(null, { affectedRows: 0 });
        });

        customerController.deleteAll(req, res);

        expect(res.send).toHaveBeenCalledWith({
          message: 'All Customers were deleted successfully!'
        });
      });
    });

    describe('Failure Cases', () => {
      it('should return 500 when database error occurs', () => {
        const mockError = new Error('Mass delete operation failed');
        Customer.removeAll.mockImplementation((callback) => {
          callback(mockError, null);
        });

        customerController.deleteAll(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({
          message: 'Mass delete operation failed'
        });
      });

      it('should return 500 with default error message when error has no message', () => {
        Customer.removeAll.mockImplementation((callback) => {
          callback({}, null);
        });

        customerController.deleteAll(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({
          message: 'Some error occurred while removing all customers.'
        });
      });
    });
  });
});