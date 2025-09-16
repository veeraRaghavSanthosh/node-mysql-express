// Test setup for Jest
// Mock database configuration for testing

const mockDbConfig = {
  HOST: 'localhost',
  USER: 'test_user',
  PASSWORD: 'test_password',
  DB: 'test_database'
};

// Mock the database config module
jest.mock('../app/config/db.config.js', () => mockDbConfig);

// Set test timeout
jest.setTimeout(30000);