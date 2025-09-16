// Global test setup

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.DB_HOST = 'localhost';
process.env.DB_USER = 'test_user';
process.env.DB_PASSWORD = 'test_password';
process.env.DB_NAME = 'test_database';

// Global mocks will be defined in individual test files

// Console suppression for cleaner test output
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning') &&
      !args[0].includes('Error')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };

  console.warn = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('deprecated')
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

// Global test utilities
global.testUtils = {
  createMockUser: (overrides = {}) => ({
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    phone: '+1234567890',
    created_at: new Date('2023-01-01'),
    updated_at: new Date('2023-01-01'),
    ...overrides
  }),

  createMockUserData: (overrides = {}) => ({
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User',
    phone: '+1234567890',
    ...overrides
  }),

  expectDatabaseCall: (mockFn, query, params) => {
    expect(mockFn).toHaveBeenCalledWith(query, params);
  },

  expectValidationError: async (promise, message) => {
    await expect(promise).rejects.toThrow(message);
  }
};