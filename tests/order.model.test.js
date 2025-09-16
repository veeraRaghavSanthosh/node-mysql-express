const Order = require('../app/models/order.model.js');
const sql = require('../app/models/db.js');

// Mock the database connection
jest.mock('../app/models/db.js');

describe('Order Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Order constructor', () => {
    it('should create an order with all properties', () => {
      const orderData = {
        customer_id: 123,
        product_name: 'Test Product',
        quantity: 2,
        unit_price: 29.99,
        total_amount: 59.98,
        status: 'confirmed',
        order_date: new Date('2023-01-01')
      };

      const order = new Order(orderData);

      expect(order.customer_id).toBe(123);
      expect(order.product_name).toBe('Test Product');
      expect(order.quantity).toBe(2);
      expect(order.unit_price).toBe(29.99);
      expect(order.total_amount).toBe(59.98);
      expect(order.status).toBe('confirmed');
      expect(order.order_date).toEqual(new Date('2023-01-01'));
    });

    it('should set default values for optional properties', () => {
      const orderData = {
        customer_id: 123,
        product_name: 'Test Product',
        quantity: 2,
        unit_price: 29.99,
        total_amount: 59.98
      };

      const order = new Order(orderData);

      expect(order.status).toBe('pending');
      expect(order.order_date).toBeInstanceOf(Date);
    });
  });

  describe('Order.create', () => {
    it('should create a new order successfully', () => {
      const orderData = {
        customer_id: 123,
        product_name: 'Test Product',
        quantity: 2,
        unit_price: 29.99,
        total_amount: 59.98,
        status: 'pending',
        order_date: new Date()
      };

      const mockResult = { insertId: 1 };
      sql.query.mockImplementation((query, data, callback) => {
        callback(null, mockResult);
      });

      const mockCallback = jest.fn();
      Order.create(orderData, mockCallback);

      expect(sql.query).toHaveBeenCalledWith(
        'INSERT INTO orders SET ?',
        orderData,
        expect.any(Function)
      );
      expect(mockCallback).toHaveBeenCalledWith(null, { id: 1, ...orderData });
    });

    it('should handle database errors during creation', () => {
      const orderData = {
        customer_id: 123,
        product_name: 'Test Product',
        quantity: 2,
        unit_price: 29.99,
        total_amount: 59.98
      };

      const mockError = new Error('Database error');
      sql.query.mockImplementation((query, data, callback) => {
        callback(mockError, null);
      });

      const mockCallback = jest.fn();
      Order.create(orderData, mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(mockError, null);
    });
  });

  describe('Order.findById', () => {
    it('should find an order by ID successfully', () => {
      const mockOrder = { id: 1, customer_id: 123, product_name: 'Test Product' };
      sql.query.mockImplementation((query, params, callback) => {
        callback(null, [mockOrder]);
      });

      const mockCallback = jest.fn();
      Order.findById(1, mockCallback);

      expect(sql.query).toHaveBeenCalledWith(
        'SELECT * FROM orders WHERE id = ?',
        [1],
        expect.any(Function)
      );
      expect(mockCallback).toHaveBeenCalledWith(null, mockOrder);
    });

    it('should return not_found when order does not exist', () => {
      sql.query.mockImplementation((query, params, callback) => {
        callback(null, []); // Empty result
      });

      const mockCallback = jest.fn();
      Order.findById(999, mockCallback);

      expect(mockCallback).toHaveBeenCalledWith({ kind: 'not_found' }, null);
    });

    it('should handle database errors during findById', () => {
      const mockError = new Error('Database error');
      sql.query.mockImplementation((query, params, callback) => {
        callback(mockError, null);
      });

      const mockCallback = jest.fn();
      Order.findById(1, mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(mockError, null);
    });
  });

  describe('Order.getAll', () => {
    it('should retrieve all orders successfully', () => {
      const mockOrders = [
        { id: 1, customer_id: 123, product_name: 'Product 1' },
        { id: 2, customer_id: 456, product_name: 'Product 2' }
      ];

      sql.query.mockImplementation((query, callback) => {
        callback(null, mockOrders);
      });

      const mockCallback = jest.fn();
      Order.getAll(mockCallback);

      expect(sql.query).toHaveBeenCalledWith(
        'SELECT * FROM orders',
        expect.any(Function)
      );
      expect(mockCallback).toHaveBeenCalledWith(null, mockOrders);
    });

    it('should handle database errors during getAll', () => {
      const mockError = new Error('Database error');
      sql.query.mockImplementation((query, callback) => {
        callback(mockError, null);
      });

      const mockCallback = jest.fn();
      Order.getAll(mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(null, mockError);
    });
  });

  describe('Order.updateById', () => {
    it('should update an order successfully', () => {
      const orderData = {
        customer_id: 123,
        product_name: 'Updated Product',
        quantity: 3,
        unit_price: 19.99,
        total_amount: 59.97,
        status: 'confirmed'
      };

      const mockResult = { affectedRows: 1 };
      sql.query.mockImplementation((query, params, callback) => {
        callback(null, mockResult);
      });

      const mockCallback = jest.fn();
      Order.updateById(1, orderData, mockCallback);

      expect(sql.query).toHaveBeenCalledWith(
        'UPDATE orders SET customer_id = ?, product_name = ?, quantity = ?, unit_price = ?, total_amount = ?, status = ? WHERE id = ?',
        [123, 'Updated Product', 3, 19.99, 59.97, 'confirmed', 1],
        expect.any(Function)
      );
      expect(mockCallback).toHaveBeenCalledWith(null, { id: 1, ...orderData });
    });

    it('should return not_found when order to update does not exist', () => {
      const orderData = { customer_id: 123, product_name: 'Updated Product' };
      const mockResult = { affectedRows: 0 };

      sql.query.mockImplementation((query, params, callback) => {
        callback(null, mockResult);
      });

      const mockCallback = jest.fn();
      Order.updateById(999, orderData, mockCallback);

      expect(mockCallback).toHaveBeenCalledWith({ kind: 'not_found' }, null);
    });
  });

  describe('Order.remove', () => {
    it('should delete an order successfully', () => {
      const mockResult = { affectedRows: 1 };
      sql.query.mockImplementation((query, params, callback) => {
        callback(null, mockResult);
      });

      const mockCallback = jest.fn();
      Order.remove(1, mockCallback);

      expect(sql.query).toHaveBeenCalledWith(
        'DELETE FROM orders WHERE id = ?',
        [1],
        expect.any(Function)
      );
      expect(mockCallback).toHaveBeenCalledWith(null, mockResult);
    });

    it('should return not_found when order to delete does not exist', () => {
      const mockResult = { affectedRows: 0 };
      sql.query.mockImplementation((query, params, callback) => {
        callback(null, mockResult);
      });

      const mockCallback = jest.fn();
      Order.remove(999, mockCallback);

      expect(mockCallback).toHaveBeenCalledWith({ kind: 'not_found' }, null);
    });
  });

  describe('Order.removeAll', () => {
    it('should delete all orders successfully', () => {
      const mockResult = { affectedRows: 5 };
      sql.query.mockImplementation((query, callback) => {
        callback(null, mockResult);
      });

      const mockCallback = jest.fn();
      Order.removeAll(mockCallback);

      expect(sql.query).toHaveBeenCalledWith(
        'DELETE FROM orders',
        expect.any(Function)
      );
      expect(mockCallback).toHaveBeenCalledWith(null, mockResult);
    });

    it('should handle database errors during removeAll', () => {
      const mockError = new Error('Database error');
      sql.query.mockImplementation((query, callback) => {
        callback(mockError, null);
      });

      const mockCallback = jest.fn();
      Order.removeAll(mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(null, mockError);
    });
  });
});