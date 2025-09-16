const Order = require('../app/models/order.model.js');
const sql = require('../app/models/db.js');

// Mock the database connection
jest.mock('../app/models/db.js');

describe('Order Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Order Constructor', () => {
    it('should create an order with all properties', () => {
      const orderData = {
        customer_id: 1,
        total_amount: 99.99,
        status: 'pending',
        order_date: new Date('2023-01-01'),
        items: [{ product_name: 'Test', quantity: 1, price: 99.99 }]
      };

      const order = new Order(orderData);

      expect(order.customer_id).toBe(1);
      expect(order.total_amount).toBe(99.99);
      expect(order.status).toBe('pending');
      expect(order.order_date).toEqual(new Date('2023-01-01'));
      expect(order.items).toEqual([{ product_name: 'Test', quantity: 1, price: 99.99 }]);
    });

    it('should set default values for status and order_date', () => {
      const orderData = {
        customer_id: 1,
        total_amount: 99.99
      };

      const order = new Order(orderData);

      expect(order.customer_id).toBe(1);
      expect(order.total_amount).toBe(99.99);
      expect(order.status).toBe('pending');
      expect(order.order_date).toBeInstanceOf(Date);
    });
  });

  describe('Order.create', () => {
    it('should create an order successfully without items', (done) => {
      const orderData = {
        customer_id: 1,
        total_amount: 99.99,
        status: 'pending',
        order_date: new Date()
      };

      const mockConnection = {
        beginTransaction: jest.fn((callback) => callback(null)),
        query: jest.fn((query, data, callback) => {
          if (query.includes('INSERT INTO orders')) {
            callback(null, { insertId: 1 });
          }
        }),
        commit: jest.fn((callback) => callback(null)),
        release: jest.fn(),
        rollback: jest.fn((callback) => {
          callback();
        })
      };

      sql.getConnection.mockImplementation((callback) => {
        callback(null, mockConnection);
      });

      const order = new Order(orderData);

      Order.create(order, (err, data) => {
        expect(err).toBeNull();
        expect(data).toEqual({
          id: 1,
          customer_id: 1,
          total_amount: 99.99,
          status: 'pending',
          order_date: orderData.order_date
        });
        expect(mockConnection.beginTransaction).toHaveBeenCalled();
        expect(mockConnection.query).toHaveBeenCalledWith(
          'INSERT INTO orders SET ?',
          expect.objectContaining({
            customer_id: 1,
            total_amount: 99.99,
            status: 'pending'
          }),
          expect.any(Function)
        );
        expect(mockConnection.commit).toHaveBeenCalled();
        expect(mockConnection.release).toHaveBeenCalled();
        done();
      });
    });

    it('should create an order successfully with items', (done) => {
      const orderData = {
        customer_id: 1,
        total_amount: 99.99,
        status: 'pending',
        order_date: new Date(),
        items: [
          { product_name: 'Test Product', quantity: 2, price: 49.99 }
        ]
      };

      const mockConnection = {
        beginTransaction: jest.fn((callback) => callback(null)),
        query: jest.fn()
          .mockImplementationOnce((query, data, callback) => {
            // First call - insert order
            if (query.includes('INSERT INTO orders')) {
              callback(null, { insertId: 1 });
            }
          })
          .mockImplementationOnce((query, data, callback) => {
            // Second call - insert order items
            if (query.includes('INSERT INTO order_items')) {
              callback(null, { insertId: 1 });
            }
          }),
        commit: jest.fn((callback) => callback(null)),
        release: jest.fn(),
        rollback: jest.fn((callback) => callback())
      };

      sql.getConnection.mockImplementation((callback) => {
        callback(null, mockConnection);
      });

      const order = new Order(orderData);

      Order.create(order, (err, data) => {
        expect(err).toBeNull();
        expect(data).toEqual({
          id: 1,
          customer_id: 1,
          total_amount: 99.99,
          status: 'pending',
          order_date: orderData.order_date,
          items: orderData.items
        });
        expect(mockConnection.query).toHaveBeenCalledTimes(2);
        expect(mockConnection.query).toHaveBeenNthCalledWith(
          2,
          'INSERT INTO order_items (order_id, product_name, quantity, price) VALUES ?',
          [[[1, 'Test Product', 2, 49.99]]],
          expect.any(Function)
        );
        done();
      });
    });

    it('should handle connection errors', (done) => {
      const orderData = {
        customer_id: 1,
        total_amount: 99.99
      };

      sql.getConnection.mockImplementation((callback) => {
        callback(new Error('Connection failed'), null);
      });

      const order = new Order(orderData);

      Order.create(order, (err, data) => {
        expect(err).toEqual(new Error('Connection failed'));
        expect(data).toBeNull();
        done();
      });
    });

    it('should handle transaction errors', (done) => {
      const orderData = {
        customer_id: 1,
        total_amount: 99.99
      };

      const mockConnection = {
        beginTransaction: jest.fn((callback) => callback(new Error('Transaction failed'))),
        release: jest.fn()
      };

      sql.getConnection.mockImplementation((callback) => {
        callback(null, mockConnection);
      });

      const order = new Order(orderData);

      Order.create(order, (err, data) => {
        expect(err).toEqual(new Error('Transaction failed'));
        expect(data).toBeNull();
        expect(mockConnection.release).toHaveBeenCalled();
        done();
      });
    });

    it('should rollback on order insertion error', (done) => {
      const orderData = {
        customer_id: 1,
        total_amount: 99.99
      };

      const mockConnection = {
        beginTransaction: jest.fn((callback) => callback(null)),
        query: jest.fn((query, data, callback) => {
          callback(new Error('Insert failed'), null);
        }),
        rollback: jest.fn((callback) => callback()),
        release: jest.fn()
      };

      sql.getConnection.mockImplementation((callback) => {
        callback(null, mockConnection);
      });

      const order = new Order(orderData);

      Order.create(order, (err, data) => {
        expect(err).toEqual(new Error('Insert failed'));
        expect(data).toBeNull();
        expect(mockConnection.rollback).toHaveBeenCalled();
        expect(mockConnection.release).toHaveBeenCalled();
        done();
      });
    });
  });

  describe('Order.findById', () => {
    it('should find an order by id successfully', (done) => {
      const mockOrder = {
        id: 1,
        customer_id: 1,
        total_amount: 99.99,
        status: 'pending',
        order_date: new Date(),
        items: '[{"id":1,"product_name":"Test","quantity":2,"price":49.99}]'
      };

      sql.query.mockImplementation((query, params, callback) => {
        callback(null, [mockOrder]);
      });

      Order.findById(1, (err, data) => {
        expect(err).toBeNull();
        expect(data.id).toBe(1);
        expect(data.items).toEqual([{"id":1,"product_name":"Test","quantity":2,"price":49.99}]);
        expect(sql.query).toHaveBeenCalledWith(
          expect.stringContaining('SELECT o.*'),
          [1],
          expect.any(Function)
        );
        done();
      });
    });

    it('should handle order not found', (done) => {
      sql.query.mockImplementation((query, params, callback) => {
        callback(null, []);
      });

      Order.findById(999, (err, data) => {
        expect(err).toEqual({ kind: 'not_found' });
        expect(data).toBeNull();
        done();
      });
    });

    it('should handle database errors', (done) => {
      sql.query.mockImplementation((query, params, callback) => {
        callback(new Error('Database error'), null);
      });

      Order.findById(1, (err, data) => {
        expect(err).toEqual(new Error('Database error'));
        expect(data).toBeNull();
        done();
      });
    });
  });
});