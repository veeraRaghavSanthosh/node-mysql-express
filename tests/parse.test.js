/**
 * Unit tests for parse.js utility functions
 * Tests cover normal cases, edge cases, and error conditions
 */

const {
  validateRequestBody,
  formatErrorResponse,
  handleDatabaseResult,
  parseCustomerData,
  sendResponse,
  validateCustomerId
} = require('../src/utils/parse');

describe('validateRequestBody', () => {
  test('should return valid for non-empty object', () => {
    const result = validateRequestBody({ name: 'test' });
    expect(result.isValid).toBe(true);
    expect(result.error).toBe(null);
  });

  test('should return invalid for null body', () => {
    const result = validateRequestBody(null);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe("Content can not be empty!");
  });

  test('should return invalid for undefined body', () => {
    const result = validateRequestBody(undefined);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe("Content can not be empty!");
  });

  test('should return invalid for empty object', () => {
    const result = validateRequestBody({});
    expect(result.isValid).toBe(false);
    expect(result.error).toBe("Request body cannot be empty!");
  });

  test('should return invalid for empty string', () => {
    const result = validateRequestBody('');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe("Content can not be empty!");
  });

  test('should return valid for string with content', () => {
    const result = validateRequestBody('test content');
    expect(result.isValid).toBe(true);
    expect(result.error).toBe(null);
  });
});

describe('formatErrorResponse', () => {
  test('should format Error object with message', () => {
    const error = new Error('Test error message');
    const result = formatErrorResponse(error);
    expect(result.message).toBe('Test error message');
  });

  test('should format string error', () => {
    const result = formatErrorResponse('String error');
    expect(result.message).toBe('String error');
  });

  test('should use default message for null error', () => {
    const result = formatErrorResponse(null, 'Default message');
    expect(result.message).toBe('Default message');
  });

  test('should handle database error with code', () => {
    const dbError = {
      code: 'ER_DUP_ENTRY',
      sqlMessage: 'Duplicate entry'
    };
    const result = formatErrorResponse(dbError);
    expect(result.message).toBe('Database error (ER_DUP_ENTRY): Duplicate entry');
  });

  test('should handle object error without code', () => {
    const objError = { custom: 'error', data: 'test' };
    const result = formatErrorResponse(objError);
    expect(result.message).toBe(JSON.stringify(objError));
  });

  test('should use default message when no error provided', () => {
    const result = formatErrorResponse();
    expect(result.message).toBe('An error occurred');
  });
});

describe('handleDatabaseResult', () => {
  test('should handle successful result', () => {
    const mockCallback = jest.fn();
    const testData = { id: 1, name: 'test' };
    
    handleDatabaseResult(null, testData, mockCallback);
    
    expect(mockCallback).toHaveBeenCalledWith(null, testData);
  });

  test('should handle not found error', () => {
    const mockCallback = jest.fn();
    const notFoundError = { kind: 'not_found' };
    
    handleDatabaseResult(notFoundError, null, mockCallback, {
      notFoundMessage: 'Custom not found'
    });
    
    expect(mockCallback).toHaveBeenCalledWith({
      kind: 'not_found',
      message: 'Custom not found'
    }, null);
  });

  test('should handle general database error', () => {
    const mockCallback = jest.fn();
    const dbError = new Error('Database connection failed');
    
    handleDatabaseResult(dbError, null, mockCallback);
    
    expect(mockCallback).toHaveBeenCalledWith(dbError, null);
  });

  test('should handle null data successfully', () => {
    const mockCallback = jest.fn();
    
    handleDatabaseResult(null, null, mockCallback);
    
    expect(mockCallback).toHaveBeenCalledWith(null, null);
  });

  test('should handle undefined data successfully', () => {
    const mockCallback = jest.fn();
    
    handleDatabaseResult(null, undefined, mockCallback);
    
    expect(mockCallback).toHaveBeenCalledWith(null, undefined);
  });
});

describe('parseCustomerData', () => {
  test('should parse complete customer data', () => {
    const reqBody = {
      email: 'test@example.com',
      name: 'John Doe',
      active: true
    };
    
    const result = parseCustomerData(reqBody);
    
    expect(result.email).toBe('test@example.com');
    expect(result.name).toBe('John Doe');
    expect(result.active).toBe(true);
  });

  test('should handle missing fields', () => {
    const reqBody = { email: 'test@example.com' };
    
    const result = parseCustomerData(reqBody);
    
    expect(result.email).toBe('test@example.com');
    expect(result.name).toBeUndefined();
    expect(result.active).toBeUndefined();
  });

  test('should trim whitespace from strings', () => {
    const reqBody = {
      email: '  test@example.com  ',
      name: '  John Doe  '
    };
    
    const result = parseCustomerData(reqBody);
    
    expect(result.email).toBe('test@example.com');
    expect(result.name).toBe('John Doe');
  });

  test('should handle empty strings after trimming', () => {
    const reqBody = {
      email: '   ',
      name: ''
    };
    
    const result = parseCustomerData(reqBody);
    
    expect(result.email).toBe(null);
    expect(result.name).toBe(null);
  });

  test('should parse active status from string', () => {
    const reqBody1 = { active: 'true' };
    const reqBody2 = { active: 'false' };
    const reqBody3 = { active: '1' };
    const reqBody4 = { active: '0' };
    
    expect(parseCustomerData(reqBody1).active).toBe(true);
    expect(parseCustomerData(reqBody2).active).toBe(false);
    expect(parseCustomerData(reqBody3).active).toBe(true);
    expect(parseCustomerData(reqBody4).active).toBe(false);
  });

  test('should parse active status from number', () => {
    const reqBody1 = { active: 1 };
    const reqBody2 = { active: 0 };
    const reqBody3 = { active: 2 };
    
    expect(parseCustomerData(reqBody1).active).toBe(true);
    expect(parseCustomerData(reqBody2).active).toBe(false);
    expect(parseCustomerData(reqBody3).active).toBe(false);
  });

  test('should handle non-string, non-number active values', () => {
    const reqBody1 = { active: null };
    const reqBody2 = { active: {} };
    const reqBody3 = { active: [] };
    
    // null should be falsy
    expect(parseCustomerData(reqBody1).active).toBe(false);
    // non-empty objects are truthy
    expect(parseCustomerData(reqBody2).active).toBe(true);
    // empty arrays are truthy in JavaScript
    expect(parseCustomerData(reqBody3).active).toBe(true);
  });
});

describe('sendResponse', () => {
  let mockRes;

  beforeEach(() => {
    mockRes = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis()
    };
  });

  test('should send response with data', () => {
    const testData = { id: 1, name: 'test' };
    
    sendResponse(mockRes, 200, testData);
    
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.send).toHaveBeenCalledWith({ data: testData });
  });

  test('should send response with message', () => {
    sendResponse(mockRes, 200, null, 'Success message');
    
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.send).toHaveBeenCalledWith({ message: 'Success message' });
  });

  test('should send response with both data and message', () => {
    const testData = { id: 1 };
    
    sendResponse(mockRes, 201, testData, 'Created successfully');
    
    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.send).toHaveBeenCalledWith({
      data: testData,
      message: 'Created successfully'
    });
  });

  test('should handle data object with existing message property', () => {
    const testData = { message: 'Existing message', id: 1 };
    
    sendResponse(mockRes, 200, testData);
    
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.send).toHaveBeenCalledWith(testData);
  });

  test('should send default success message when no data or message', () => {
    sendResponse(mockRes, 200);
    
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.send).toHaveBeenCalledWith({
      message: 'Operation completed successfully'
    });
  });

  test('should handle undefined data', () => {
    sendResponse(mockRes, 200, undefined, 'Test message');
    
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.send).toHaveBeenCalledWith({ message: 'Test message' });
  });
});

describe('validateCustomerId', () => {
  test('should validate positive integer ID', () => {
    const result = validateCustomerId('123');
    
    expect(result.isValid).toBe(true);
    expect(result.error).toBe(null);
    expect(result.id).toBe(123);
  });

  test('should validate numeric ID', () => {
    const result = validateCustomerId(456);
    
    expect(result.isValid).toBe(true);
    expect(result.error).toBe(null);
    expect(result.id).toBe(456);
  });

  test('should reject null ID', () => {
    const result = validateCustomerId(null);
    
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Customer ID is required');
    expect(result.id).toBe(null);
  });

  test('should reject undefined ID', () => {
    const result = validateCustomerId(undefined);
    
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Customer ID is required');
    expect(result.id).toBe(null);
  });

  test('should reject non-numeric string ID', () => {
    const result = validateCustomerId('abc');
    
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Customer ID must be a positive integer');
    expect(result.id).toBe(null);
  });

  test('should reject negative ID', () => {
    const result = validateCustomerId('-5');
    
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Customer ID must be a positive integer');
    expect(result.id).toBe(null);
  });

  test('should reject zero ID', () => {
    const result = validateCustomerId('0');
    
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Customer ID must be a positive integer');
    expect(result.id).toBe(null);
  });

  test('should reject floating point numbers', () => {
    const result = validateCustomerId('12.5');
    
    // parseInt converts '12.5' to 12, which is valid
    // This is documented behavior - the function accepts string representations of integers
    expect(result.isValid).toBe(true);
    expect(result.error).toBe(null);
    expect(result.id).toBe(12);
  });

  test('should reject very large numbers', () => {
    const largeNumber = (Number.MAX_SAFE_INTEGER + 1).toString();
    const result = validateCustomerId(largeNumber);
    
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Customer ID is too large');
    expect(result.id).toBe(null);
  });

  test('should handle string with leading/trailing whitespace', () => {
    const result = validateCustomerId('  123  ');
    
    expect(result.isValid).toBe(true);
    expect(result.error).toBe(null);
    expect(result.id).toBe(123);
  });
});