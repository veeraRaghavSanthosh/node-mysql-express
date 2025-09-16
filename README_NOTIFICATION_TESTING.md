# Notification API Testing Guide

This document provides instructions for running the notification API tests and using the comprehensive documentation.

## Prerequisites

Before running the tests, make sure you have:

1. **Node.js** (version 14 or higher)
2. **MySQL** server running
3. **Test database** configured

## Setup

### 1. Install Dependencies

```bash
# Install production dependencies
npm install

# Install development dependencies (for testing)
npm install --dev
```

### 2. Database Setup

Create a test database for running tests:

```sql
CREATE DATABASE testdb;
USE testdb;

-- The test suite will automatically create the notifications table
```

### 3. Environment Variables

Set up environment variables for testing (optional):

```bash
export TEST_DB_HOST=localhost
export TEST_DB_USER=root
export TEST_DB_PASSWORD=your_password
export TEST_DB_NAME=testdb
```

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with Coverage Report
```bash
npm run test:coverage
```

### Run Specific Test File
```bash
npx mocha test/notification.test.js
```

## Test Coverage

The test suite covers:

- ✅ **CRUD Operations**: Create, Read, Update, Delete notifications
- ✅ **Input Validation**: Required fields, data types, length limits
- ✅ **Error Handling**: 400, 404, 500 error responses
- ✅ **Edge Cases**: Boundary conditions, invalid inputs
- ✅ **Performance**: Concurrent request handling
- ✅ **Database Integration**: MySQL connection and queries

## API Documentation

Comprehensive API documentation is available in [`NOTIFICATION_API.md`](./NOTIFICATION_API.md), which includes:

- **Endpoint Specifications**: Complete API reference
- **Request/Response Schemas**: JSON schema definitions
- **Usage Examples**: JavaScript and cURL examples
- **Error Handling**: Standard error response formats
- **Database Schema**: MySQL table structure

## Test Structure

```
test/
├── notification.test.js     # Main test suite
├── test-config.js          # Test configuration and utilities
└── mocha.opts             # Mocha configuration
```

## Example Test Output

```
  Notification API
    POST /notifications
      ✓ should create a new notification with valid data
      ✓ should return 400 when title is missing
      ✓ should return 400 when message is missing
      ✓ should return 400 when user_id is missing
      ✓ should default type to "info" when not provided
      ✓ should return 400 for invalid notification type

    GET /notifications
      ✓ should retrieve all notifications

    GET /notifications/:id
      ✓ should retrieve a specific notification by id
      ✓ should return 404 for non-existent notification
      ✓ should return 400 for invalid notification id format

    PUT /notifications/:id
      ✓ should update a notification with valid data
      ✓ should update only is_read field
      ✓ should return 404 for non-existent notification
      ✓ should return 400 for invalid notification id format
      ✓ should return 400 for invalid notification type in update

    DELETE /notifications/:id
      ✓ should delete a specific notification by id
      ✓ should return 404 for non-existent notification
      ✓ should return 400 for invalid notification id format

    DELETE /notifications
      ✓ should delete all notifications

    Edge Cases
      ✓ should handle empty request body for POST
      ✓ should handle very long title (boundary test)
      ✓ should handle very long message (boundary test)
      ✓ should handle negative user_id
      ✓ should handle string user_id

    Performance Tests
      ✓ should handle multiple concurrent requests

  24 passing (2s)
```

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure MySQL server is running
   - Check database credentials in test configuration
   - Verify test database exists

2. **Test Timeout**
   - Increase timeout in `mocha.opts` if needed
   - Check database performance

3. **Module Not Found**
   - Run `npm install` to install dependencies
   - Check that all dev dependencies are installed

### Debug Mode

Run tests with debug output:

```bash
DEBUG=* npm test
```

## Continuous Integration

For CI/CD pipelines, use:

```bash
# In your CI configuration
npm ci                    # Install dependencies
npm run test:coverage    # Run tests with coverage
```

## Contributing

When adding new tests:

1. Follow existing test patterns
2. Include both positive and negative test cases
3. Add edge case testing
4. Update documentation as needed
5. Ensure all tests pass before submitting

## Next Steps

- Implement notification API endpoints based on the documentation
- Set up continuous integration with automated testing
- Add integration tests for end-to-end scenarios
- Consider adding performance benchmarks
