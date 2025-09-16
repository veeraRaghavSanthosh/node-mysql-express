const Order = require('../app/models/order.model');
const sql = require('../app/models/db');

// Mock the database connection
jest.mock('../app/models/db');

describe('Order Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Order constructor', () => {
    it('should create an Order instance with all properties', () => {
      const orderData = {
        customer_id: 1,
        product_name: 'Test Product',
        quantity: 2,
        unit_price: 25.99,
        total_amount: 51.98,
        order_date: new Date(),
        status: 'pending'
      };

      const order = new Order(orderData);

      expect(order.customer_id).toBe(orderData.customer_id);
      expect(order.product_name).toBe(orderData.product_name);
      expect(order.quantity).toBe(orderData.quantity);
      expect(order.unit_price).toBe(orderData.unit_price);
      expect(order.total_amount).toBe(orderData.total_amount);
      expect(order.order_date).toBe(orderData.order_date);
      expect(order.status).toBe(orderData.status);
    });

    it('should set default status to "pending" when not provided', () => {
      const orderData = {
        customer_id: 1,
        product_name: 'Test Product',
        quantity: 2,
        unit_price: 25.99,
        total_amount: 51.98,
        order_date: new Date()
      };

      const order = new Order(orderData);

      expect(order.status).toBe('pending');
    });
  });

  describe('Order.create', () => {
    it('should create a new order successfully', () => {
      const newOrder = {
        customer_id: 1,
        product_name: 'Test Product',
        quantity: 2,
        unit_price: 25.99,
        total_amount: 51.98,
        status: 'pending'
      };

      const mockResult = { insertId: 1 };
      sql.query.mockImplementation((query, data, callback) => {
        callback(null, mockResult);
      });

      const resultCallback = jest.fn();
      Order.create(newOrder, resultCallback);

      expect(sql.query).toHaveBeenCalledWith(
        'INSERT INTO orders SET ?',
        newOrder,
        expect.any(Function)
      );
      expect(resultCallback).toHaveBeenCalledWith(null, { id: 1, ...newOrder });
    });

    it('should handle database error during creation', () => {
      const newOrder = {
        customer_id: 1,
        product_name: 'Test Product',
        quantity: 2,
        unit_price: 25.99,
        total_amount: 51.98,
        status: 'pending'
      };

      const mockError = new Error('Database connection failed');
      sql.query.mockImplementation((query, data, callback) => {
        callback(mockError, null);
      });

      const resultCallback = jest.fn();
      Order.create(newOrder, resultCallback);

      expect(resultCallback).toHaveBeenCalledWith(mockError, null);
    });
  });

  describe('Order.findById', () => {
    it('should find an order by id successfully', () => {
      const orderId = 1;
      const mockOrder = {
        id: 1,
        customer_id: 1,
        product_name: 'Test Product',
        quantity: 2,
        unit_price: 25.99,
        total_amount: 51.98,
        status: 'pending'
      };

      sql.query.mockImplementation((query, callback) => {
        callback(null, [mockOrder]);
      });

      const resultCallback = jest.fn();
      Order.findById(orderId, resultCallback);

      expect(sql.query).toHaveBeenCalledWith(
        `SELECT * FROM orders WHERE id = ${orderId}`,
        expect.any(Function)
      );
      expect(resultCallback).toHaveBeenCalledWith(null, mockOrder);
    });

    it('should return not_found error when order does not exist', () => {
      const orderId = 999;

      sql.query.mockImplementation((query, callback) => {
        callback(null, []); // Empty result
      });

      const resultCallback = jest.fn();
      Order.findById(orderId, resultCallback);

      expect(resultCallback).toHaveBeenCalledWith({ kind: 'not_found' }, null);
    });

    it('should handle database error during findById', () => {
      const orderId = 1;
      const mockError = new Error('Database error');

      sql.query.mockImplementation((query, callback) => {
        callback(mockError, null);
      });

      const resultCallback = jest.fn();
      Order.findById(orderId, resultCallback);

      expect(resultCallback).toHaveBeenCalledWith(mockError, null);
    });
  });

  describe('Order.getAll', () => {
    it('should retrieve all orders successfully', () => {
      const mockOrders = [
        { id: 1, customer_id: 1, product_name: 'Product 1', quantity: 1, unit_price: 10.00, total_amount: 10.00, status: 'pending' },
        { id: 2, customer_id: 2, product_name: 'Product 2', quantity: 2, unit_price: 15.00, total_amount: 30.00, status: 'processing' }
      ];

      sql.query.mockImplementation((query, callback) => {
        callback(null, mockOrders);
      });

      const resultCallback = jest.fn();
      Order.getAll(resultCallback);

      expect(sql.query).toHaveBeenCalledWith(
        'SELECT * FROM orders',
        expect.any(Function)
      );
      expect(resultCallback).toHaveBeenCalledWith(null, mockOrders);
    });

    it('should handle database error during getAll', () => {
      const mockError = new Error('Database error');

      sql.query.mockImplementation((query, callback) => {
        callback(mockError, null);
      });

      const resultCallback = jest.fn();
      Order.getAll(resultCallback);

      expect(resultCallback).toHaveBeenCalledWith(null, mockError);
    });
  });

  describe('Order.updateById', () => {
    it('should update an order successfully', () => {
      const orderId = 1;
      const orderData = {
        customer_id: 1,
        product_name: 'Updated Product',
        quantity: 3,
        unit_price: 30.99,
        total_amount: 92.97,
        status: 'processing'
      };

      const mockResult = { affectedRows: 1 };
      sql.query.mockImplementation((query, params, callback) => {
        callback(null, mockResult);
      });

      const resultCallback = jest.fn();
      Order.updateById(orderId, orderData, resultCallback);

      expect(sql.query).toHaveBeenCalledWith(
        'UPDATE orders SET customer_id = ?, product_name = ?, quantity = ?, unit_price = ?, total_amount = ?, status = ? WHERE id = ?',
        [orderData.customer_id, orderData.product_name, orderData.quantity, orderData.unit_price, orderData.total_amount, orderData.status, orderId],
        expect.any(Function)
      );
      expect(resultCallback).toHaveBeenCalledWith(null, { id: orderId, ...orderData });
    });

    it('should return not_found error when order does not exist', () => {
      const orderId = 999;
      const orderData = {
        customer_id: 1,
        product_name: 'Updated Product',
        quantity: 3,
        unit_price: 30.99,
        total_amount: 92.97,
        status: 'processing'
      };

      const mockResult = { affectedRows: 0 };
      sql.query.mockImplementation((query, params, callback) => {
        callback(null, mockResult);
      });

      const resultCallback = jest.fn();
      Order.updateById(orderId, orderData, resultCallback);

      expect(resultCallback).toHaveBeenCalledWith({ kind: 'not_found' }, null);
    });

    it('should handle database error during update', () => {
      const orderId = 1;
      const orderData = {
        customer_id: 1,
        product_name: 'Updated Product',
        quantity: 3,
        unit_price: 30.99,
        total_amount: 92.97,
        status: 'processing'
      };

      const mockError = new Error('Database error');
      sql.query.mockImplementation((query, params, callback) => {
        callback(mockError, null);
      });

      const resultCallback = jest.fn();
      Order.updateById(orderId, orderData, resultCallback);

      expect(resultCallback).toHaveBeenCalledWith(null, mockError);
    });
  });

  describe('Order.remove', () => {
    it('should delete an order successfully', () => {
      const orderId = 1;
      const mockResult = { affectedRows: 1 };

      sql.query.mockImplementation((query, id, callback) => {
        callback(null, mockResult);
      });

      const resultCallback = jest.fn();
      Order.remove(orderId, resultCallback);

      expect(sql.query).toHaveBeenCalledWith(
        'DELETE FROM orders WHERE id = ?',
        orderId,
        expect.any(Function)
      );
      expect(resultCallback).toHaveBeenCalledWith(null, mockResult);
    });

    it('should return not_found error when order does not exist', () => {
      const orderId = 999;
      const mockResult = { affectedRows: 0 };

      sql.query.mockImplementation((query, id, callback) => {
        callback(null, mockResult);
      });

      const resultCallback = jest.fn();
      Order.remove(orderId, resultCallback);

      expect(resultCallback).toHaveBeenCalledWith({ kind: 'not_found' }, null);
    });

    it('should handle database error during deletion', () => {
      const orderId = 1;
      const mockError = new Error('Database error');

      sql.query.mockImplementation((query, id, callback) => {
        callback(mockError, null);
      });

      const resultCallback = jest.fn();
      Order.remove(orderId, resultCallback);

      expect(resultCallback).toHaveBeenCalledWith(null, mockError);
    });
  });

  describe('Order.removeAll', () => {
    it('should delete all orders successfully', () => {
      const mockResult = { affectedRows: 5 };

      sql.query.mockImplementation((query, callback) => {
        callback(null, mockResult);
      });

      const resultCallback = jest.fn();
      Order.removeAll(resultCallback);

      expect(sql.query).toHaveBeenCalledWith(
        'DELETE FROM orders',
        expect.any(Function)
      );
      expect(resultCallback).toHaveBeenCalledWith(null, mockResult);
    });

    it('should handle database error during removeAll', () => {
      const mockError = new Error('Database error');

      sql.query.mockImplementation((query, callback) => {
        callback(mockError, null);
      });

      const resultCallback = jest.fn();
      Order.removeAll(resultCallback);

      expect(resultCallback).toHaveBeenCalledWith(null, mockError);
    });
  });
});