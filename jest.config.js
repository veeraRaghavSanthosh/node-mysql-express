module.exports = {
  testEnvironment: "node",
  collectCoverageFrom: [
    "**/*.js",
    "!node_modules/**",
    "!coverage/**",
    "!tests/**",
    "!jest.config.js"
  ],
  testMatch: [
    "**/tests/**/*.test.js",
    "**/test/**/*.test.js"
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  verbose: true
};