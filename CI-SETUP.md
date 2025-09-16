# CI/CD Setup for Node.js Express MySQL Project

This document explains the GitHub Actions CI/CD setup that has been added to your project.

## Overview

Two GitHub Actions workflows have been added to improve code quality and ensure reliability:

1. **`pr-tests.yml`** - Runs on pull requests only
2. **`ci.yml`** - Runs on both pushes to main/master and pull requests

## Features

### 🧪 Testing
- **Multi-Node Version Testing**: Tests against Node.js 16.x, 18.x, and 20.x
- **MySQL Service**: Automatically spins up MySQL 8.0 for database testing
- **Test Discovery**: Automatically finds and runs tests even without explicit npm scripts
- **Coverage Support**: Generates test coverage reports when tools are available

### 🔍 Code Quality
- **ESLint Integration**: Runs linting with fallback to direct ESLint execution
- **Code Formatting**: Checks code formatting with Prettier (if available)
- **TypeScript Support**: Runs type checking for TypeScript projects
- **Package Validation**: Validates package.json structure

### 🔒 Security
- **Dependency Audit**: Runs npm audit to check for vulnerabilities
- **Secret Detection**: Basic checks for hardcoded passwords and API keys
- **Outdated Dependencies**: Reports outdated packages

## Setup Requirements

### 1. Add Test Scripts to package.json

```json
{
  "scripts": {
    "test": "mocha test/**/*.js",
    "lint": "eslint . --ext .js",
    "format:check": "prettier --check .",
    "coverage": "nyc npm test"
  }
}
```

### 2. Install Development Dependencies

```bash
# Testing
npm install --save-dev mocha supertest

# Linting and Formatting
npm install --save-dev eslint prettier

# Coverage (optional)
npm install --save-dev nyc
```

### 3. Environment Variables for Testing

The workflows automatically provide these environment variables for tests:

- `NODE_ENV=test`
- `DB_HOST=127.0.0.1`
- `DB_PORT=3306`
- `DB_USER=testuser`
- `DB_PASSWORD=testpassword`
- `DB_NAME=testdb`

### 4. Database Configuration for Tests

Make sure your application can use different database configurations for testing. Example:

```javascript
// config/db.config.js
module.exports = {
  HOST: process.env.DB_HOST || "localhost",
  USER: process.env.DB_USER || "root",
  PASSWORD: process.env.DB_PASSWORD || "",
  DB: process.env.DB_NAME || "your_database",
  dialect: "mysql",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};
```

## Workflow Details

### Pull Request Workflow (`pr-tests.yml`)
- **Trigger**: Pull requests to master/main branches
- **Jobs**: 
  - `test-and-lint`: Runs tests and linting across multiple Node versions
  - `code-quality`: Performs additional quality checks

### Continuous Integration Workflow (`ci.yml`)
- **Trigger**: Pushes and pull requests to master/main branches
- **Jobs**:
  - `lint`: Code linting
  - `test`: Unit tests with database
  - `security`: Security audit and secret detection
  - `dependency-check`: Dependency analysis

## Backward Compatibility

The workflows are designed to be backward compatible:

- ✅ Works with existing projects without modification
- ✅ Gracefully handles missing test scripts
- ✅ Falls back to direct tool execution when npm scripts aren't defined
- ✅ Continues on non-critical failures (formatting, outdated deps)
- ✅ Provides helpful messages when tools aren't configured

## Getting Started

1. **Commit the workflow files** to your repository
2. **Create a pull request** to see the workflows in action
3. **Gradually add the recommended dependencies** and scripts
4. **Write tests** in the `test/` directory

## Example Test Structure

```
test/
├── customer.test.js          # Test customer controller
├── database.test.js          # Test database connections
├── routes.test.js           # Test API routes
└── integration.test.js      # Integration tests
```

## Customization

### Adding Custom Steps
You can extend the workflows by adding steps to the existing jobs or creating new jobs.

### Environment-Specific Configuration
Add environment-specific configurations using GitHub Secrets for production deployments.

### Custom Test Commands
Modify the test execution commands in the workflows to match your specific testing setup.

## Troubleshooting

### Tests Not Running?
- Ensure test files are in the `test/` directory or named `*.test.js`
- Add a `test` script to your `package.json`
- Check that test dependencies are installed

### Linting Errors?
- Install ESLint: `npm install --save-dev eslint`
- Use the provided `.eslintrc.js` configuration
- Add a `lint` script to your `package.json`

### Database Connection Issues?
- Verify your database configuration uses environment variables
- Check that your connection code handles the test environment
- Ensure proper connection cleanup in tests

## Benefits

- 🚀 **Faster Development**: Catch issues early in the development process
- 🛡️ **Better Security**: Automated security audits and secret detection
- 📈 **Code Quality**: Consistent coding standards across the team
- 🔄 **Continuous Integration**: Automated testing on every change
- 📊 **Visibility**: Clear feedback on code health and test results

---

*This CI setup ensures your Node.js Express MySQL application maintains high quality and reliability standards while remaining flexible and backward compatible.*