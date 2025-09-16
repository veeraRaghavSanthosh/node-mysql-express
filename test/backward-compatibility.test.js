const assert = require('assert');
const { OrderProcessor } = require('../app/services/orderProcessor');

describe('Backward Compatibility Tests', function() {
    let orderProcessor;
    
    beforeEach(function() {
        orderProcessor = new OrderProcessor();
    });
    
    describe('API Compatibility', function() {
        it('should maintain existing method signatures', function() {
            // Verify all expected methods exist
            assert.ok(typeof orderProcessor.processOrder === 'function');
            assert.ok(typeof orderProcessor.validateOrder === 'function');
            assert.ok(typeof orderProcessor.processItems === 'function');
            assert.ok(typeof orderProcessor.calculateTotal === 'function');
        });
        
        it('should return expected result structure', async function() {
            const orderData = {
                orderId: 'compat-test-001',
                items: [],
                customerId: 'customer-compat',
                timestamp: new Date('2025-01-01T00:00:00.000Z')
            };
            
            const result = await orderProcessor.processOrder(orderData);
            
            // Verify result structure matches expectations
            assert.ok(result.hasOwnProperty('status'));
            assert.ok(result.hasOwnProperty('orderId'));
            assert.ok(result.hasOwnProperty('itemsProcessed'));
            assert.ok(result.hasOwnProperty('totalAmount'));
            assert.ok(result.hasOwnProperty('processedAt'));
            assert.ok(result.hasOwnProperty('processingTimeMs'));
        });
        
        it('should handle legacy order data format', async function() {
            // Test with minimal required fields (legacy format)
            const legacyOrderData = {
                orderId: 'legacy-001',
                items: [],
                customerId: 'legacy-customer'
                // Note: no timestamp field (might be optional in legacy)
            };
            
            const result = await orderProcessor.processOrder(legacyOrderData);
            
            assert.strictEqual(result.status, 'completed');
            assert.strictEqual(result.itemsProcessed, 0);
            assert.strictEqual(result.totalAmount, 0);
        });
    });
    
    describe('Error Handling Compatibility', function() {
        it('should throw appropriate errors for invalid input', async function() {
            try {
                await orderProcessor.processOrder(null);
                assert.fail('Should have thrown an error');
            } catch (error) {
                assert.ok(error instanceof Error);
                assert.ok(error.message.includes('Order validation failed'));
            }
        });
        
        it('should handle missing required fields gracefully', function() {
            const invalidOrder = {
                items: []
                // Missing orderId and customerId
            };
            
            const validation = orderProcessor.validateOrder(invalidOrder);
            
            assert.strictEqual(validation.isValid, false);
            assert.ok(Array.isArray(validation.validationErrors));
            assert.ok(validation.validationErrors.length > 0);
        });
    });
    
    describe('Performance Compatibility', function() {
        it('should process orders within reasonable time', async function() {
            const orderData = {
                orderId: 'perf-test-001',
                items: [],
                customerId: 'perf-customer',
                timestamp: new Date()
            };
            
            const startTime = Date.now();
            const result = await orderProcessor.processOrder(orderData);
            const endTime = Date.now();
            
            const processingTime = endTime - startTime;
            
            // Should complete within reasonable time (less than 1 second)
            assert.ok(processingTime < 1000, `Processing took ${processingTime}ms, expected < 1000ms`);
            
            // Verify processing time is recorded
            assert.ok(typeof result.processingTimeMs === 'number');
            assert.ok(result.processingTimeMs >= 0);
        });
    });
    
    describe('State Management Compatibility', function() {
        it('should not interfere with concurrent processing', async function() {
            const orderData1 = {
                orderId: 'concurrent-001',
                items: [],
                customerId: 'customer-1',
                timestamp: new Date()
            };
            
            const orderData2 = {
                orderId: 'concurrent-002',
                items: [],
                customerId: 'customer-2',
                timestamp: new Date()
            };
            
            // Process orders concurrently
            const [result1, result2] = await Promise.all([
                orderProcessor.processOrder(orderData1),
                orderProcessor.processOrder(orderData2)
            ]);
            
            // Both should succeed with correct order IDs
            assert.strictEqual(result1.orderId, 'concurrent-001');
            assert.strictEqual(result2.orderId, 'concurrent-002');
            assert.strictEqual(result1.status, 'completed');
            assert.strictEqual(result2.status, 'completed');
        });
    });
});