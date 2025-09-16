const request = require('supertest');
const express = require('express');

// Mock the database connection
jest.mock('../app/models/db.js', () => ({
  query: jest.fn()
}));

// Import after mocking
const Customer = require('../app/models/customer.model.js');

describe('Customer Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Customer.create', () => {
    test('should create a new customer successfully', (done) => {
      const mockCustomer = {
        email: 'test@example.com',
        name: 'Test User',
        active: true
      };

      const mockResult = { insertId: 1 };
      
      // Mock the database query
      const sql = require('../app/models/db.js');
      sql.query.mockImplementation((query, data, callback) => {
        callback(null, mockResult);
      });

      Customer.create(mockCustomer, (err, data) => {
        expect(err).toBeNull();
        expect(data).toEqual({ id: 1, ...mockCustomer });
        expect(sql.query).toHaveBeenCalledWith(
          "INSERT INTO customers SET ?",
          mockCustomer,
          expect.any(Function)
        );
        done();
      });
    });

    test('should handle database error during creation', (done) => {
      const mockCustomer = {
        email: 'test@example.com',
        name: 'Test User',
        active: true
      };

      const mockError = new Error('Database connection failed');
      
      // Mock the database query to return error
      const sql = require('../app/models/db.js');
      sql.query.mockImplementation((query, data, callback) => {
        callback(mockError, null);
      });

      Customer.create(mockCustomer, (err, data) => {
        expect(err).toBe(mockError);
        expect(data).toBeNull();
        done();
      });
    });
  });

  describe('Customer.findById', () => {
    test('should find customer by ID successfully', (done) => {
      const customerId = 1;
      const mockCustomer = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        active: true
      };

      const sql = require('../app/models/db.js');
      sql.query.mockImplementation((query, callback) => {
        callback(null, [mockCustomer]);
      });

      Customer.findById(customerId, (err, data) => {
        expect(err).toBeNull();
        expect(data).toEqual(mockCustomer);
        expect(sql.query).toHaveBeenCalledWith(
          `SELECT * FROM customers WHERE id = ${customerId}`,
          expect.any(Function)
        );
        done();
      });
    });

    test('should return not found error when customer does not exist', (done) => {
      const customerId = 999;

      const sql = require('../app/models/db.js');
      sql.query.mockImplementation((query, callback) => {
        callback(null, []); // Empty result
      });

      Customer.findById(customerId, (err, data) => {
        expect(err).toEqual({ kind: "not_found" });
        expect(data).toBeNull();
        done();
      });
    });
  });

  describe('Customer.getAll', () => {
    test('should retrieve all customers successfully', (done) => {
      const mockCustomers = [
        { id: 1, email: 'test1@example.com', name: 'Test User 1', active: true },
        { id: 2, email: 'test2@example.com', name: 'Test User 2', active: false }
      ];

      const sql = require('../app/models/db.js');
      sql.query.mockImplementation((query, callback) => {
        callback(null, mockCustomers);
      });

      Customer.getAll((err, data) => {
        expect(err).toBeNull();
        expect(data).toEqual(mockCustomers);
        expect(sql.query).toHaveBeenCalledWith(
          "SELECT * FROM customers",
          expect.any(Function)
        );
        done();
      });
    });
  });

  describe('Customer.updateById', () => {
    test('should update customer successfully', (done) => {
      const customerId = 1;
      const updatedCustomer = {
        email: 'updated@example.com',
        name: 'Updated User',
        active: false
      };

      const mockResult = { affectedRows: 1 };

      const sql = require('../app/models/db.js');
      sql.query.mockImplementation((query, params, callback) => {
        callback(null, mockResult);
      });

      Customer.updateById(customerId, updatedCustomer, (err, data) => {
        expect(err).toBeNull();
        expect(data).toEqual({ id: customerId, ...updatedCustomer });
        expect(sql.query).toHaveBeenCalledWith(
          "UPDATE customers SET email = ?, name = ?, active = ? WHERE id = ?",
          [updatedCustomer.email, updatedCustomer.name, updatedCustomer.active, customerId],
          expect.any(Function)
        );
        done();
      });
    });

    test('should return not found error when customer does not exist', (done) => {
      const customerId = 999;
      const updatedCustomer = {
        email: 'updated@example.com',
        name: 'Updated User',
        active: false
      };

      const mockResult = { affectedRows: 0 };

      const sql = require('../app/models/db.js');
      sql.query.mockImplementation((query, params, callback) => {
        callback(null, mockResult);
      });

      Customer.updateById(customerId, updatedCustomer, (err, data) => {
        expect(err).toEqual({ kind: "not_found" });
        expect(data).toBeNull();
        done();
      });
    });
  });

  describe('Customer.remove', () => {
    test('should delete customer successfully', (done) => {
      const customerId = 1;
      const mockResult = { affectedRows: 1 };

      const sql = require('../app/models/db.js');
      sql.query.mockImplementation((query, id, callback) => {
        callback(null, mockResult);
      });

      Customer.remove(customerId, (err, data) => {
        expect(err).toBeNull();
        expect(data).toBe(mockResult);
        expect(sql.query).toHaveBeenCalledWith(
          "DELETE FROM customers WHERE id = ?",
          customerId,
          expect.any(Function)
        );
        done();
      });
    });

    test('should return not found error when customer does not exist', (done) => {
      const customerId = 999;
      const mockResult = { affectedRows: 0 };

      const sql = require('../app/models/db.js');
      sql.query.mockImplementation((query, id, callback) => {
        callback(null, mockResult);
      });

      Customer.remove(customerId, (err, data) => {
        expect(err).toEqual({ kind: "not_found" });
        expect(data).toBeNull();
        done();
      });
    });
  });

  describe('Customer.removeAll', () => {
    test('should delete all customers successfully', (done) => {
      const mockResult = { affectedRows: 5 };

      const sql = require('../app/models/db.js');
      sql.query.mockImplementation((query, callback) => {
        callback(null, mockResult);
      });

      Customer.removeAll((err, data) => {
        expect(err).toBeNull();
        expect(data).toBe(mockResult);
        expect(sql.query).toHaveBeenCalledWith(
          "DELETE FROM customers",
          expect.any(Function)
        );
        done();
      });
    });
  });
});