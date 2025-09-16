// Test setup file
process.env.JWT_SECRET = 'test-secret-key-for-testing';

// Global test timeout
jest.setTimeout(10000);

// Mock console.log to reduce noise during tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};