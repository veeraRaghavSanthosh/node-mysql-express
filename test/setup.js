// Global test setup
beforeEach(() => {
  // Clear console to avoid pollution in test output
  jest.clearAllMocks();
});

// Global teardown
afterEach(() => {
  // Restore all mocks after each test
  jest.restoreAllMocks();
});

// Handle unhandled promise rejections in tests
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Fail the test if there's an unhandled rejection
  throw reason;
});