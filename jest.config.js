module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'app/**/*.js',
    '!app/config/**',
    '!**/node_modules/**'
  ],
  coverageDirectory: 'coverage',
  verbose: true
};