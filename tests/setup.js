// Jest setup file for authentication tests

// Global test configuration
jest.setTimeout(10000); // 10 seconds timeout for tests

// Mock console methods to reduce noise in test output
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeAll(() => {
  // Suppress console.log in tests unless explicitly needed
  console.log = jest.fn();
  
  // Keep console.error for debugging
  console.error = originalConsoleError;
});

afterAll(() => {
  // Restore original console methods
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
});

// Global test helpers
global.testHelpers = {
  // Helper to create authorization headers
  createAuthHeader: (token) => `Bearer ${token}`,
  
  // Helper to create test user object
  createTestUser: (overrides = {}) => ({
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    permissions: ['read', 'write'],
    ...overrides
  }),
  
  // Helper to create mock request object
  createMockRequest: (overrides = {}) => ({
    headers: {},
    body: {},
    params: {},
    query: {},
    ...overrides
  }),
  
  // Helper to create mock response object
  createMockResponse: () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    res.end = jest.fn().mockReturnValue(res);
    return res;
  },
  
  // Helper to create mock next function
  createMockNext: () => jest.fn()
};

// Custom Jest matchers for authentication testing
expect.extend({
  toBeAuthenticated(received) {
    const pass = received && received.user && received.user.id;
    if (pass) {
      return {
        message: () => `expected request not to be authenticated`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected request to be authenticated`,
        pass: false,
      };
    }
  },
  
  toHaveValidToken(received) {
    const authHeader = received.headers.authorization;
    const pass = authHeader && authHeader.startsWith('Bearer ') && authHeader.length > 7;
    if (pass) {
      return {
        message: () => `expected request not to have valid token format`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected request to have valid token format`,
        pass: false,
      };
    }
  }
});