# Test Setup and Helpers

This directory contains comprehensive test setup utilities and helper functions for the Node.js MySQL Express application.

## Files

- **`setup.test.js`** - Main test helper module with database, server, and data management utilities
- **`example.test.js`** - Example test file demonstrating how to use the helpers
- **`README.md`** - This documentation file

## Key Features

### 🗄️ Database Management
- Automated test database setup and teardown
- Connection pool management with proper cleanup
- Transaction support for atomic test operations
- Test data seeding and cleanup utilities

### 🚀 Server Management  
- Express server setup for integration testing
- Automatic port assignment to prevent conflicts
- Graceful server startup and shutdown
- Test-specific middleware configuration

### 📊 Test Data Generation
- Consistent test customer data generation
- Unique identifiers to prevent conflicts
- Customizable data with sensible defaults
- Bulk data seeding capabilities

### 🛡️ Edge Case Handling
- Connection timeout management
- Concurrent test execution support
- Resource cleanup on failures
- Backward compatibility maintenance

## Quick Start

### Complete Environment Setup

```javascript
const { setupTestEnvironment, teardownTestEnvironment } = require('./setup.test.js');

describe('My Tests', () => {
    let testEnv;
    
    beforeAll(async () => {
        testEnv = await setupTestEnvironment({
            seedData: true,      // Add default test data
            createTables: true   // Ensure database schema exists
        });
    });
    
    afterAll(async () => {
        await teardownTestEnvironment();
    });
    
    test('example test', () => {
        // Your test code here
        // Access: testEnv.connection, testEnv.server, testEnv.port, etc.
    });
});
```

### Individual Helper Usage

```javascript
const { 
    createTestDbConnection, 
    executeQuery, 
    generateTestCustomers 
} = require('./setup.test.js');

test('individual helper example', async () => {
    const connection = createTestDbConnection();
    const customer = generateTestCustomers({ name: 'Test User' });
    
    const { results } = await executeQuery(
        connection, 
        'INSERT INTO customers SET ?', 
        [customer]
    );
    
    expect(results.insertId).toBeDefined();
    connection.end();
});
```

## Available Helper Functions

### Database Helpers

| Function | Description | Parameters |
|----------|-------------|------------|
| `createTestDbConnection(config)` | Creates MySQL connection pool | `config` - Optional DB config overrides |
| `executeQuery(connection, query, params)` | Promise-wrapped query execution | `connection`, `query`, `params` array |
| `setupTestDatabase(connection)` | Creates test tables and schema | `connection` - MySQL connection |
| `cleanupTestDatabase(connection, preserveSchema)` | Cleans test data | `connection`, `preserveSchema` boolean |
| `waitForDatabase(connection, timeout)` | Waits for DB to be ready | `connection`, `timeout` in ms |

### Test Data Helpers

| Function | Description | Parameters |
|----------|-------------|------------|
| `generateTestCustomers(overrides, count)` | Generates customer test data | `overrides` object, `count` number |
| `seedTestCustomers(connection, customers)` | Seeds database with customers | `connection`, `customers` array |

### Server Helpers

| Function | Description | Parameters |
|----------|-------------|------------|
| `createTestApp(config)` | Creates Express app instance | `config` - Optional server config |
| `startTestServer(app, port)` | Starts server on available port | `app` - Express app, `port` number |

### Environment Management

| Function | Description | Parameters |
|----------|-------------|------------|
| `setupTestEnvironment(options)` | Complete test environment setup | `options` - Configuration object |
| `teardownTestEnvironment(options)` | Complete environment cleanup | `options` - Cleanup configuration |

## Configuration

### Environment Variables

Set these environment variables to customize test database configuration:

```bash
TEST_DB_HOST=localhost      # Database host
TEST_DB_USER=root          # Database user  
TEST_DB_PASSWORD=          # Database password
TEST_DB_NAME=test_db       # Test database name
```

### Test Database Configuration

The helpers use a separate test database configuration to avoid conflicts with production:

```javascript
const TEST_DB_CONFIG = {
    HOST: process.env.TEST_DB_HOST || "localhost",
    USER: process.env.TEST_DB_USER || "root", 
    PASSWORD: process.env.TEST_DB_PASSWORD || "",
    DB: process.env.TEST_DB_NAME || "test_nodejs_mysql",
    connectionLimit: 10,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true
};
```

## Edge Cases Handled

### Database Edge Cases
- ✅ Connection timeouts and retries
- ✅ Pool exhaustion during concurrent tests
- ✅ Database server unavailability
- ✅ Foreign key constraint violations
- ✅ Transaction rollback scenarios
- ✅ Large dataset handling

### Server Edge Cases
- ✅ Port conflicts and automatic assignment
- ✅ Server startup timeouts
- ✅ Multiple server instances
- ✅ Graceful shutdown handling
- ✅ Memory leak prevention

### Data Edge Cases
- ✅ Duplicate key violations
- ✅ Unicode character handling
- ✅ Extremely long field values
- ✅ Invalid data type scenarios
- ✅ Concurrent data generation

## Backward Compatibility

The helpers maintain backward compatibility through legacy function aliases:

```javascript
// Legacy aliases (deprecated but supported)
createDbConnection()  // Use createTestDbConnection()
runQuery()           // Use executeQuery()
setupDb()            // Use setupTestDatabase()
cleanupDb()          // Use cleanupTestDatabase()
createApp()          // Use createTestApp()
startServer()        // Use startTestServer()
```

## Best Practices

1. **Always use `setupTestEnvironment()` and `teardownTestEnvironment()`** for complete test suites
2. **Generate unique test data** using the provided helpers to avoid conflicts
3. **Use transactions** for test data that needs to be rolled back
4. **Handle async operations properly** with async/await or promises
5. **Clean up resources** even when tests fail
6. **Use environment variables** for test configuration
7. **Isolate test databases** from production data

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Troubleshooting

### Common Issues

1. **Connection Refused**: Ensure MySQL is running and accessible
2. **Port Already in Use**: The helpers automatically find available ports
3. **Permission Denied**: Check database user permissions
4. **Timeout Errors**: Increase timeout values in configuration
5. **Memory Leaks**: Ensure proper cleanup in `afterAll()` hooks

### Debug Mode

Enable debug logging by setting the environment variable:

```bash
DEBUG=true npm test
```

## Contributing

When adding new helper functions:

1. Follow the existing naming conventions
2. Include comprehensive error handling
3. Add detailed JSDoc comments
4. Handle relevant edge cases
5. Maintain backward compatibility
6. Update this documentation

## License

This test setup is part of the nodejs-express-mysql project and follows the same ISC license.