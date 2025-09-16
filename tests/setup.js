// Test setup file
// This file runs before each test suite

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error'; // Reduce logging during tests

// Mock console methods to reduce noise during testing
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeEach(() => {
  // Mock console methods if needed
  // console.log = jest.fn();
  // console.error = jest.fn();
});

afterEach(() => {
  // Restore console methods
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
});

// Global test utilities can be added here
global.testUtils = {
  createMockBilling: (overrides = {}) => ({
    customer_id: 1,
    amount: 100.50,
    description: 'Test billing record',
    status: 'pending',
    ...overrides
  }),
  
  createMockDbResult: (overrides = {}) => ({
    insertId: 1,
    affectedRows: 1,
    ...overrides
  })
};