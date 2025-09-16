# User Service Unit Tests

This directory contains comprehensive unit tests for the user-service module covering success cases, failure scenarios, and boundary conditions.

## Test Structure

### Main Test Files

1. **`tests/user.service.test.js`** - Main comprehensive test suite
   - Success cases for all CRUD operations
   - Failure scenarios with database errors
   - Boundary cases with edge inputs
   - Authentication testing

2. **`tests/setup.js`** - Test configuration and global setup
   - Mock configurations
   - Test utilities
   - Environment setup

3. **`jest.config.js`** - Jest configuration
   - Coverage thresholds
   - Test environment setup
   - File patterns

## Test Coverage

### Success Cases
- ✅ User creation with valid data
- ✅ User retrieval by ID
- ✅ User updates (partial and full)
- ✅ User deletion
- ✅ User authentication
- ✅ Paginated user listing

### Failure Cases
- ✅ Database connection errors
- ✅ Duplicate email handling
- ✅ Invalid credentials
- ✅ User not found scenarios
- ✅ Password hashing failures
- ✅ JWT token generation errors

### Boundary Cases
- ✅ Empty/null inputs
- ✅ Invalid email formats
- ✅ Password length validation
- ✅ Maximum data length handling
- ✅ Invalid user IDs
- ✅ Large result sets
- ✅ Concurrent operations

## Running Tests

### Prerequisites
```bash
npm install
```

### Run All Tests
```bash
npm test
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Specific Test File
```bash
npx jest tests/user.service.test.js
```

## Test Configuration

The tests use the following mocking strategy:
- Database connections are mocked using Jest
- bcrypt operations are mocked for consistent testing
- JWT operations are mocked for token testing
- Environment variables are set in test setup

## Coverage Goals

The test suite aims for:
- 80%+ line coverage
- 80%+ branch coverage
- 80%+ function coverage
- 80%+ statement coverage

## Mock Data Utilities

Global test utilities are available via `global.testUtils`:
- `createMockUser()` - Creates mock user objects
- `createMockUserData()` - Creates mock user input data
- `expectDatabaseCall()` - Validates database calls
- `expectValidationError()` - Validates error scenarios

## Test Categories

### Unit Tests
- Isolated testing of service methods
- Mocked dependencies
- Fast execution
- High coverage

### Integration Tests
- Database integration testing
- End-to-end workflows
- Real database connections (test DB)
- Performance validation

### Edge Case Tests
- Boundary value testing
- Invalid input handling
- Error scenario coverage
- Security validation

## Error Scenarios Covered

1. **Database Errors**
   - Connection timeouts
   - Connection lost
   - Access denied
   - Table not found
   - Foreign key violations
   - Data too long

2. **Validation Errors**
   - Missing required fields
   - Invalid formats
   - Length violations
   - Type mismatches

3. **Authentication Errors**
   - Hashing failures
   - Comparison failures
   - Token generation failures
   - Invalid credentials

4. **System Errors**
   - Network failures
   - Memory issues
   - File system errors
   - Unexpected responses

## Best Practices

1. **Test Isolation**: Each test is independent and doesn't rely on others
2. **Mock Reset**: All mocks are reset between tests
3. **Clear Assertions**: Tests have specific, clear expectations
4. **Error Testing**: Both success and failure paths are tested
5. **Boundary Testing**: Edge cases and limits are validated

## Extending Tests

To add new tests:

1. Follow the existing naming conventions
2. Use the provided mock utilities
3. Include success, failure, and boundary cases
4. Update coverage expectations if needed
5. Document new test scenarios

## Troubleshooting

### Common Issues

1. **Mock not working**: Ensure mocks are properly reset in `beforeEach`
2. **Async issues**: Use `await` with async operations
3. **Coverage gaps**: Check for untested branches and add specific tests
4. **Database mocking**: Verify mock return values match expected format

### Debug Mode

Run tests with debug output:
```bash
DEBUG=* npm test
```

For specific test debugging:
```bash
npx jest --verbose tests/user.service.test.js
```