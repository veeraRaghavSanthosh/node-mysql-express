// Jest setup file for global test configuration

// Set up global test timeout
jest.setTimeout(5000);

// Mock console methods to reduce noise during testing
global.console = {
  ...console,
  // Uncomment to suppress console.log during tests
  // log: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};

// Global test utilities
global.testUtils = {
  // Helper to create mock timestamps
  createMockTimestamp: (dateString = '2023-01-01T00:00:00.000Z') => {
    const originalToISOString = Date.prototype.toISOString;
    Date.prototype.toISOString = jest.fn(() => dateString);
    return () => {
      Date.prototype.toISOString = originalToISOString;
    };
  },

  // Helper to wait for a specific amount of time
  wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  // Helper to create deterministic delays
  createDeterministicDelay: (ms = 10) => {
    return () => new Promise(resolve => setTimeout(resolve, ms));
  }
};

// Clean up after each test
afterEach(() => {
  // Restore all mocks
  jest.restoreAllMocks();
  
  // Clear all timers
  jest.clearAllTimers();
});

// Global error handler for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});