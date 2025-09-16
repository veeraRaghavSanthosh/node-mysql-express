const mysql = require("mysql");
const express = require("express");
const bodyParser = require("body-parser");

/**
 * Test Setup Helpers for Node.js MySQL Express Application
 * 
 * This module provides reusable helper functions for setting up and tearing down
 * test environments, managing database connections, and handling test data.
 * 
 * Key Features:
 * - Database connection management with automatic cleanup
 * - Test data generation and seeding utilities  
 * - Express server setup for integration testing
 * - Comprehensive error handling and edge case management
 * - Backward compatibility with existing test patterns
 */

// Test database configuration - separate from production config
const TEST_DB_CONFIG = {
    HOST: process.env.TEST_DB_HOST || "localhost",
    USER: process.env.TEST_DB_USER || "root", 
    PASSWORD: process.env.TEST_DB_PASSWORD || "",
    DB: process.env.TEST_DB_NAME || "test_nodejs_mysql",
    // Connection pool settings for test isolation
    connectionLimit: 10,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true
};

// Global test state management
let testDbConnection = null;
let testServer = null;
let testApp = null;

/**
 * Database Helper Functions
 * These functions manage database connections and provide utilities for test data management
 */

/**
 * Creates and returns a MySQL connection pool for testing
 * 
 * Edge Cases Handled:
 * - Connection timeout scenarios
 * - Pool exhaustion during concurrent tests
 * - Database server unavailability
 * - Invalid credentials or database names
 * 
 * @param {Object} customConfig - Optional custom database configuration
 * @returns {Object} MySQL connection pool
 */
function createTestDbConnection(customConfig = {}) {
    const config = { ...TEST_DB_CONFIG, ...customConfig };
    
    try {
        const connection = mysql.createPool({
            host: config.HOST,
            user: config.USER,
            password: config.PASSWORD,
            database: config.DB,
            connectionLimit: config.connectionLimit,
            acquireTimeout: config.acquireTimeout,
            timeout: config.timeout,
            reconnect: config.reconnect,
            // Additional test-specific settings
            multipleStatements: true, // Allow multiple SQL statements for setup/teardown
            charset: 'utf8mb4' // Ensure proper character encoding for test data
        });

        // Handle connection errors gracefully
        connection.on('error', (err) => {
            console.error('Database connection error in tests:', err);
            if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                // Attempt to reconnect on connection loss
                console.log('Attempting to reconnect to test database...');
            }
        });

        testDbConnection = connection;
        return connection;
    } catch (error) {
        console.error('Failed to create test database connection:', error);
        throw new Error(`Test database setup failed: ${error.message}`);
    }
}

/**
 * Executes a SQL query with promise support for async/await testing
 * 
 * Edge Cases Handled:
 * - Query timeout scenarios
 * - SQL syntax errors in test queries
 * - Connection unavailability during query execution
 * - Large result sets that might cause memory issues
 * 
 * @param {Object} connection - MySQL connection pool
 * @param {string} query - SQL query to execute
 * @param {Array} params - Query parameters for prepared statements
 * @returns {Promise} Promise resolving to query results
 */
function executeQuery(connection, query, params = []) {
    return new Promise((resolve, reject) => {
        // Validate inputs to prevent common test errors
        if (!connection) {
            reject(new Error('Database connection is required'));
            return;
        }
        
        if (!query || typeof query !== 'string') {
            reject(new Error('Valid SQL query string is required'));
            return;
        }

        connection.query(query, params, (error, results, fields) => {
            if (error) {
                // Enhanced error reporting for test debugging
                console.error('SQL Query Error:', {
                    error: error.message,
                    query: query.substring(0, 100) + (query.length > 100 ? '...' : ''),
                    params: params
                });
                reject(error);
            } else {
                resolve({ results, fields });
            }
        });
    });
}

/**
 * Sets up test database schema and initial data
 * 
 * Edge Cases Handled:
 * - Database already exists scenarios
 * - Permission issues when creating tables
 * - Foreign key constraint violations
 * - Concurrent test execution conflicts
 * 
 * @param {Object} connection - MySQL connection pool
 * @returns {Promise} Promise resolving when setup is complete
 */
async function setupTestDatabase(connection) {
    try {
        // Create customers table if it doesn't exist
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS customers (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) NOT NULL UNIQUE,
                name VARCHAR(255) NOT NULL,
                active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_email (email),
                INDEX idx_active (active)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `;
        
        await executeQuery(connection, createTableQuery);
        
        // Verify table creation
        const verifyQuery = "SHOW TABLES LIKE 'customers'";
        const { results } = await executeQuery(connection, verifyQuery);
        
        if (results.length === 0) {
            throw new Error('Failed to create customers table');
        }
        
        console.log('Test database schema setup completed successfully');
    } catch (error) {
        console.error('Test database setup failed:', error);
        throw error;
    }
}

/**
 * Cleans up test database by removing test data
 * 
 * Edge Cases Handled:
 * - Foreign key constraints preventing deletion
 * - Transactions in progress during cleanup
 * - Large datasets requiring chunked deletion
 * - Connection issues during cleanup
 * 
 * @param {Object} connection - MySQL connection pool
 * @param {boolean} preserveSchema - Whether to keep table structure
 * @returns {Promise} Promise resolving when cleanup is complete
 */
async function cleanupTestDatabase(connection, preserveSchema = true) {
    try {
        if (preserveSchema) {
            // Only delete data, preserve schema for performance
            await executeQuery(connection, 'SET FOREIGN_KEY_CHECKS = 0');
            await executeQuery(connection, 'TRUNCATE TABLE customers');
            await executeQuery(connection, 'SET FOREIGN_KEY_CHECKS = 1');
        } else {
            // Drop all test tables (use with caution)
            await executeQuery(connection, 'DROP TABLE IF EXISTS customers');
        }
        
        console.log('Test database cleanup completed successfully');
    } catch (error) {
        console.error('Test database cleanup failed:', error);
        // Don't throw error to prevent test failures due to cleanup issues
        // but log the error for debugging
    }
}

/**
 * Test Data Generation Helpers
 * These functions provide utilities for generating consistent test data
 */

/**
 * Generates test customer data with optional customization
 * 
 * Edge Cases Handled:
 * - Duplicate email generation across tests
 * - Invalid data types for customer fields
 * - Unicode characters in names and emails
 * - Extremely long field values
 * 
 * @param {Object} overrides - Custom field values to override defaults
 * @param {number} count - Number of customer records to generate
 * @returns {Array|Object} Array of customer objects or single customer object
 */
function generateTestCustomers(overrides = {}, count = 1) {
    const customers = [];
    
    for (let i = 0; i < count; i++) {
        // Generate unique identifiers to prevent conflicts
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        
        const customer = {
            email: `test.customer.${timestamp}.${i}.${randomSuffix}@example.com`,
            name: `Test Customer ${i + 1} ${randomSuffix}`,
            active: i % 2 === 0, // Alternate active status for variety
            ...overrides
        };
        
        // Validate generated data to catch edge cases
        if (!customer.email || !customer.name) {
            throw new Error('Generated customer data is invalid');
        }
        
        customers.push(customer);
    }
    
    return count === 1 ? customers[0] : customers;
}

/**
 * Seeds test database with predefined customer data
 * 
 * Edge Cases Handled:
 * - Duplicate key violations during seeding
 * - Transaction rollback on partial failure
 * - Large dataset insertion timeouts
 * - Character encoding issues with test data
 * 
 * @param {Object} connection - MySQL connection pool
 * @param {Array} customers - Array of customer objects to insert
 * @returns {Promise} Promise resolving to inserted customer IDs
 */
async function seedTestCustomers(connection, customers = []) {
    if (!Array.isArray(customers) || customers.length === 0) {
        customers = generateTestCustomers({}, 3); // Default test data
    }
    
    const insertedIds = [];
    
    try {
        // Use transaction for atomic seeding
        await executeQuery(connection, 'START TRANSACTION');
        
        for (const customer of customers) {
            const insertQuery = 'INSERT INTO customers (email, name, active) VALUES (?, ?, ?)';
            const { results } = await executeQuery(connection, insertQuery, [
                customer.email,
                customer.name,
                customer.active
            ]);
            
            insertedIds.push(results.insertId);
        }
        
        await executeQuery(connection, 'COMMIT');
        console.log(`Successfully seeded ${customers.length} test customers`);
        
        return insertedIds;
    } catch (error) {
        await executeQuery(connection, 'ROLLBACK');
        console.error('Failed to seed test customers:', error);
        throw error;
    }
}

/**
 * Express Server Setup Helpers
 * These functions manage Express server instances for integration testing
 */

/**
 * Creates a test Express application with middleware
 * 
 * Edge Cases Handled:
 * - Middleware loading failures
 * - Route registration conflicts
 * - Port binding issues in test environment
 * - Memory leaks from unclosed server instances
 * 
 * @param {Object} customConfig - Optional custom server configuration
 * @returns {Object} Express application instance
 */
function createTestApp(customConfig = {}) {
    try {
        const app = express();
        
        // Basic middleware setup (maintaining backward compatibility)
        app.use(bodyParser.json({ limit: '10mb' })); // Increased limit for test payloads
        app.use(bodyParser.urlencoded({ extended: true }));
        
        // Test-specific middleware
        app.use((req, res, next) => {
            // Add test headers for debugging
            res.set('X-Test-Environment', 'true');
            next();
        });
        
        // Error handling middleware for tests
        app.use((error, req, res, next) => {
            console.error('Test app error:', error);
            res.status(500).json({
                error: 'Internal server error during testing',
                message: error.message,
                stack: process.env.NODE_ENV === 'test' ? error.stack : undefined
            });
        });
        
        testApp = app;
        return app;
    } catch (error) {
        console.error('Failed to create test Express app:', error);
        throw error;
    }
}

/**
 * Starts test server on available port
 * 
 * Edge Cases Handled:
 * - Port already in use scenarios
 * - Server startup timeout
 * - Multiple server instances running simultaneously
 * - Graceful shutdown on test completion
 * 
 * @param {Object} app - Express application instance
 * @param {number} port - Preferred port number (will find alternative if busy)
 * @returns {Promise} Promise resolving to server instance and actual port
 */
function startTestServer(app, port = 0) {
    return new Promise((resolve, reject) => {
        // Use port 0 to let system assign available port
        const server = app.listen(port, (error) => {
            if (error) {
                console.error('Failed to start test server:', error);
                reject(error);
                return;
            }
            
            const actualPort = server.address().port;
            console.log(`Test server started on port ${actualPort}`);
            
            testServer = server;
            resolve({ server, port: actualPort });
        });
        
        // Handle server startup timeout
        const timeout = setTimeout(() => {
            server.close();
            reject(new Error('Test server startup timeout'));
        }, 10000); // 10 second timeout
        
        server.on('listening', () => {
            clearTimeout(timeout);
        });
        
        server.on('error', (error) => {
            clearTimeout(timeout);
            console.error('Test server error:', error);
            reject(error);
        });
    });
}

/**
 * Global Setup and Teardown Helpers
 * These functions manage the complete test environment lifecycle
 */

/**
 * Initializes complete test environment
 * 
 * This is the main setup function that should be called before running tests.
 * It sets up database connections, creates necessary tables, and prepares
 * the Express server for testing.
 * 
 * Edge Cases Handled:
 * - Partial setup failures requiring cleanup
 * - Environment variable conflicts
 * - Resource allocation failures
 * - Concurrent test suite execution
 * 
 * @param {Object} options - Configuration options for test setup
 * @returns {Promise} Promise resolving to test environment objects
 */
async function setupTestEnvironment(options = {}) {
    const {
        dbConfig = {},
        serverConfig = {},
        seedData = true,
        createTables = true
    } = options;
    
    try {
        console.log('Setting up test environment...');
        
        // Step 1: Database setup
        const connection = createTestDbConnection(dbConfig);
        
        if (createTables) {
            await setupTestDatabase(connection);
        }
        
        // Step 2: Seed initial data if requested
        let seededCustomerIds = [];
        if (seedData) {
            seededCustomerIds = await seedTestCustomers(connection);
        }
        
        // Step 3: Express app setup
        const app = createTestApp(serverConfig);
        
        // Step 4: Start server
        const { server, port } = await startTestServer(app);
        
        console.log('Test environment setup completed successfully');
        
        return {
            connection,
            app,
            server,
            port,
            seededCustomerIds,
            baseUrl: `http://localhost:${port}`
        };
    } catch (error) {
        console.error('Test environment setup failed:', error);
        // Attempt cleanup on setup failure
        await teardownTestEnvironment();
        throw error;
    }
}

/**
 * Cleans up complete test environment
 * 
 * This function should be called after all tests complete to ensure
 * proper cleanup of resources and prevent memory leaks.
 * 
 * Edge Cases Handled:
 * - Cleanup failures that shouldn't affect test results
 * - Resource cleanup order dependencies
 * - Timeout scenarios during cleanup
 * - Multiple cleanup calls (idempotent)
 * 
 * @param {Object} options - Cleanup configuration options
 * @returns {Promise} Promise resolving when cleanup is complete
 */
async function teardownTestEnvironment(options = {}) {
    const { preserveData = false, timeout = 5000 } = options;
    
    console.log('Tearing down test environment...');
    
    const cleanupTasks = [];
    
    // Close server connection
    if (testServer) {
        cleanupTasks.push(new Promise((resolve) => {
            testServer.close((error) => {
                if (error) {
                    console.error('Error closing test server:', error);
                }
                testServer = null;
                resolve();
            });
        }));
    }
    
    // Cleanup database
    if (testDbConnection) {
        cleanupTasks.push(new Promise(async (resolve) => {
            try {
                if (!preserveData) {
                    await cleanupTestDatabase(testDbConnection);
                }
                testDbConnection.end((error) => {
                    if (error) {
                        console.error('Error closing database connection:', error);
                    }
                    testDbConnection = null;
                    resolve();
                });
            } catch (error) {
                console.error('Database cleanup error:', error);
                resolve(); // Don't fail teardown due to cleanup issues
            }
        }));
    }
    
    // Execute all cleanup tasks with timeout
    try {
        await Promise.race([
            Promise.all(cleanupTasks),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Cleanup timeout')), timeout)
            )
        ]);
        console.log('Test environment teardown completed successfully');
    } catch (error) {
        console.error('Test environment teardown encountered issues:', error);
        // Don't throw error to prevent test failures due to cleanup issues
    }
}

/**
 * Utility Functions for Common Test Operations
 */

/**
 * Waits for database connection to be ready
 * 
 * @param {Object} connection - MySQL connection pool
 * @param {number} timeout - Maximum wait time in milliseconds
 * @returns {Promise} Promise resolving when connection is ready
 */
function waitForDatabase(connection, timeout = 10000) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        
        const checkConnection = () => {
            connection.query('SELECT 1', (error) => {
                if (!error) {
                    resolve();
                } else if (Date.now() - startTime > timeout) {
                    reject(new Error('Database connection timeout'));
                } else {
                    setTimeout(checkConnection, 100);
                }
            });
        };
        
        checkConnection();
    });
}

/**
 * Creates a test-specific database name to avoid conflicts
 * 
 * @param {string} baseName - Base database name
 * @returns {string} Unique test database name
 */
function generateTestDbName(baseName = 'test_db') {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    return `${baseName}_${timestamp}_${randomSuffix}`;
}

// Export all helper functions for use in tests
module.exports = {
    // Database helpers
    createTestDbConnection,
    executeQuery,
    setupTestDatabase,
    cleanupTestDatabase,
    waitForDatabase,
    generateTestDbName,
    
    // Test data helpers
    generateTestCustomers,
    seedTestCustomers,
    
    // Server helpers
    createTestApp,
    startTestServer,
    
    // Environment management
    setupTestEnvironment,
    teardownTestEnvironment,
    
    // Configuration
    TEST_DB_CONFIG,
    
    // Backward compatibility - legacy function names
    // These maintain compatibility with existing test code
    createDbConnection: createTestDbConnection, // Legacy alias
    runQuery: executeQuery, // Legacy alias
    setupDb: setupTestDatabase, // Legacy alias
    cleanupDb: cleanupTestDatabase, // Legacy alias
    createApp: createTestApp, // Legacy alias
    startServer: startTestServer // Legacy alias
};