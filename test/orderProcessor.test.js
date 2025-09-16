const assert = require('assert');
const { OrderProcessor } = require('../app/services/orderProcessor');

describe('OrderProcessor Tests', function() {
    let orderProcessor;
    
    beforeEach(function() {
        // Reset state before each test to ensure deterministic behavior
        orderProcessor = new OrderProcessor();
    });
    
    afterEach(function() {
        // Clean up any resources
        if (orderProcessor && typeof orderProcessor.cleanup === 'function') {
            orderProcessor.cleanup();
        }
    });
    
    describe('Zero Items Handling', function() {
        it('orderProcessor_should_handle_zero_items', function(done) {
            // This test was previously flaky due to:
            // 1. Race conditions with async operations
            // 2. Non-deterministic timing
            // 3. Shared state between tests
            // 4. Missing proper cleanup
            
            const orderData = {
                orderId: 'test-order-001',
                items: [], // Zero items
                customerId: 'customer-123',
                timestamp: new Date('2025-01-01T00:00:00.000Z') // Fixed timestamp for determinism
            };
            
            // Use a promise-based approach with timeout for deterministic behavior
            const processPromise = orderProcessor.processOrder(orderData);
            
            // Set a deterministic timeout
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Test timeout')), 5000);
            });
            
            Promise.race([processPromise, timeoutPromise])
                .then(result => {
                    try {
                        // Verify the expected behavior for zero items
                        assert.strictEqual(result.status, 'completed');
                        assert.strictEqual(result.itemsProcessed, 0);
                        assert.strictEqual(result.totalAmount, 0);
                        assert.strictEqual(result.orderId, orderData.orderId);
                        assert.ok(result.processedAt instanceof Date);
                        
                        // Ensure no side effects occurred
                        assert.strictEqual(orderProcessor.getActiveOrdersCount(), 0);
                        
                        done();
                    } catch (error) {
                        done(error);
                    }
                })
                .catch(error => {
                    done(error);
                });
        });
        
        it('should_handle_zero_items_synchronously', function() {
            // Alternative synchronous test for immediate validation
            const orderData = {
                orderId: 'sync-test-001',
                items: [],
                customerId: 'customer-456',
                timestamp: new Date('2025-01-01T00:00:00.000Z')
            };
            
            const result = orderProcessor.validateOrder(orderData);
            
            assert.strictEqual(result.isValid, true);
            assert.strictEqual(result.itemCount, 0);
            assert.strictEqual(result.canProcess, true);
            assert.deepStrictEqual(result.validationErrors, []);
        });
        
        it('should_handle_zero_items_with_database_mock', function(done) {
            // Mock database operations to eliminate external dependencies
            const mockDb = {
                saveOrder: (order) => Promise.resolve({ id: order.orderId, saved: true }),
                updateOrderStatus: (orderId, status) => Promise.resolve({ orderId, status, updated: true })
            };
            
            orderProcessor.setDatabase(mockDb);
            
            const orderData = {
                orderId: 'db-test-001',
                items: [],
                customerId: 'customer-789',
                timestamp: new Date('2025-01-01T00:00:00.000Z')
            };
            
            orderProcessor.processOrderWithDatabase(orderData)
                .then(result => {
                    assert.strictEqual(result.status, 'completed');
                    assert.strictEqual(result.itemsProcessed, 0);
                    assert.ok(result.databaseSaved);
                    done();
                })
                .catch(done);
        });
    });
    
    describe('Edge Cases', function() {
        it('should_handle_null_items_array', function() {
            const orderData = {
                orderId: 'null-test-001',
                items: null,
                customerId: 'customer-null',
                timestamp: new Date('2025-01-01T00:00:00.000Z')
            };
            
            const result = orderProcessor.validateOrder(orderData);
            
            assert.strictEqual(result.isValid, false);
            assert.ok(result.validationErrors.includes('Items array cannot be null'));
        });
        
        it('should_handle_undefined_items_array', function() {
            const orderData = {
                orderId: 'undefined-test-001',
                customerId: 'customer-undefined',
                timestamp: new Date('2025-01-01T00:00:00.000Z')
                // items property is undefined
            };
            
            const result = orderProcessor.validateOrder(orderData);
            
            assert.strictEqual(result.isValid, false);
            assert.ok(result.validationErrors.includes('Items array is required'));
        });
    });
});