module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/*.test.js'],
  collectCoverageFrom: [
    '../../migrations/**/*.js',
    '!../../migrations/migration-runner.js'
  ],
  setupFilesAfterEnv: ['<rootDir>/test-setup.js'],
  testTimeout: 30000
};