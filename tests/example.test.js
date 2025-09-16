/**
 * Example Test File demonstrating usage of setup.test.js helpers
 * 
 * This file shows how to use the helper functions from setup.test.js
 * in actual test scenarios. It demonstrates both individual helper usage
 * and complete test environment setup.
 */

const {
    setupTestEnvironment,
    teardownTestEnvironment,
    generateTestCustomers,
    executeQuery,
    createTestDbConnection,
    seedTestCustomers
} = require('./setup.test.js');

// Example test suite using the helpers
describe('Customer API Tests', () => {
    let testEnv;
    
    // Setup complete test environment before all tests
    beforeAll(async () => {
        try {
            testEnv = await setupTestEnvironment({
                seedData: true, // Seed with default test data
                createTables: true // Ensure tables exist
            });
            console.log(`Test server running at ${testEnv.baseUrl}`);
        } catch (error) {
            console.error('Failed to setup test environment:', error);
            throw error;
        }
    });
    
    // Cleanup after all tests complete
    afterAll(async () => {
        await teardownTestEnvironment();
    });
    
    // Example test using database helpers
    describe('Database Operations', () => {
        test('should create and retrieve customer', async () => {
            // Generate test customer data
            const testCustomer = generateTestCustomers({
                name: 'Integration Test Customer',
                email: 'integration.test@example.com',
                active: true
            });
            
            // Insert customer using helper
            const insertQuery = 'INSERT INTO customers (email, name, active) VALUES (?, ?, ?)';
            const { results } = await executeQuery(
                testEnv.connection,
                insertQuery,
                [testCustomer.email, testCustomer.name, testCustomer.active]
            );
            
            expect(results.insertId).toBeDefined();
            
            // Retrieve and verify
            const selectQuery = 'SELECT * FROM customers WHERE id = ?';
            const { results: selectResults } = await executeQuery(
                testEnv.connection,
                selectQuery,
                [results.insertId]
            );
            
            expect(selectResults).toHaveLength(1);
            expect(selectResults[0].email).toBe(testCustomer.email);
            expect(selectResults[0].name).toBe(testCustomer.name);
        });
        
        test('should handle multiple customers', async () => {
            // Generate multiple test customers
            const customers = generateTestCustomers({}, 5);
            
            // Seed them using helper
            const insertedIds = await seedTestCustomers(testEnv.connection, customers);
            
            expect(insertedIds).toHaveLength(5);
            
            // Verify all were inserted
            const countQuery = 'SELECT COUNT(*) as count FROM customers WHERE id IN (?)';
            const { results } = await executeQuery(
                testEnv.connection,
                countQuery,
                [insertedIds]
            );
            
            expect(results[0].count).toBe(5);
        });
    });
    
    // Example test for individual helper usage
    describe('Helper Functions', () => {
        test('should generate unique test customers', () => {
            const customer1 = generateTestCustomers();
            const customer2 = generateTestCustomers();
            
            // Should be different due to timestamp and random suffix
            expect(customer1.email).not.toBe(customer2.email);
            expect(customer1.name).not.toBe(customer2.name);
        });
        
        test('should generate customers with overrides', () => {
            const customCustomer = generateTestCustomers({
                name: 'Custom Name',
                active: false
            });
            
            expect(customCustomer.name).toBe('Custom Name');
            expect(customCustomer.active).toBe(false);
            expect(customCustomer.email).toMatch(/test\.customer\./);
        });
        
        test('should generate multiple customers', () => {
            const customers = generateTestCustomers({}, 3);
            
            expect(Array.isArray(customers)).toBe(true);
            expect(customers).toHaveLength(3);
            
            // All should have unique emails
            const emails = customers.map(c => c.email);
            const uniqueEmails = new Set(emails);
            expect(uniqueEmails.size).toBe(3);
        });
    });
    
    // Example test for database connection management
    describe('Connection Management', () => {
        test('should create separate database connection', async () => {
            const separateConnection = createTestDbConnection({
                database: 'test_separate_db'
            });
            
            expect(separateConnection).toBeDefined();
            
            // Clean up separate connection
            separateConnection.end();
        });
    });
});

// Example of using helpers in individual test files
describe('Standalone Helper Usage', () => {
    let connection;
    
    beforeAll(async () => {
        connection = createTestDbConnection();
        // Wait for connection to be ready
        await new Promise((resolve, reject) => {
            connection.query('SELECT 1', (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    });
    
    afterAll(async () => {
        if (connection) {
            connection.end();
        }
    });
    
    test('should work with individual connection', async () => {
        const testQuery = 'SELECT NOW() as current_time';
        const { results } = await executeQuery(connection, testQuery);
        
        expect(results).toHaveLength(1);
        expect(results[0].current_time).toBeDefined();
    });
});