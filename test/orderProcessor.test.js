const orderProcessor = require("../app/services/orderProcessor");
const assert = require("assert");

describe("OrderProcessor", () => {
  
  describe("orderProcessor_should_handle_zero_items", () => {
    it("should handle zero items deterministically", (done) => {
      const orderData = {
        customerId: 1,
        items: []
      };

      orderProcessor.processOrder(orderData, (err, result) => {
        // Assertions to ensure deterministic behavior
        assert.strictEqual(err, null, "Should not return an error");
        assert.strictEqual(result.success, true, "Should indicate success");
        assert.strictEqual(result.order.status, 'empty', "Should have empty status");
        assert.strictEqual(result.order.totalAmount, 0, "Should have zero total amount");
        assert.strictEqual(result.order.items.length, 0, "Should have zero items");
        assert.strictEqual(result.order.customerId, 1, "Should preserve customer ID");
        assert.strictEqual(result.message, "Order processed with zero items", "Should have correct message");
        
        // Ensure createdAt is a valid ISO string
        assert.ok(result.order.createdAt, "Should have createdAt timestamp");
        assert.ok(new Date(result.order.createdAt).toISOString(), "Should be valid ISO date");
        
        done();
      });
    });

    it("should handle null items array", (done) => {
      const orderData = {
        customerId: 2,
        items: null
      };

      orderProcessor.processOrder(orderData, (err, result) => {
        assert.strictEqual(err, null, "Should not return an error");
        assert.strictEqual(result.success, true, "Should indicate success");
        assert.strictEqual(result.order.status, 'empty', "Should have empty status");
        assert.strictEqual(result.order.totalAmount, 0, "Should have zero total amount");
        assert.deepStrictEqual(result.order.items, [], "Should convert null to empty array");
        
        done();
      });
    });

    it("should handle undefined items array", (done) => {
      const orderData = {
        customerId: 3
        // items is undefined
      };

      orderProcessor.processOrder(orderData, (err, result) => {
        assert.strictEqual(err, null, "Should not return an error");
        assert.strictEqual(result.success, true, "Should indicate success");
        assert.strictEqual(result.order.status, 'empty', "Should have empty status");
        assert.strictEqual(result.order.totalAmount, 0, "Should have zero total amount");
        assert.deepStrictEqual(result.order.items, [], "Should default to empty array");
        
        done();
      });
    });

    it("should be deterministic across multiple calls", (done) => {
      const orderData = {
        customerId: 4,
        items: []
      };

      let results = [];
      let completedCalls = 0;
      const totalCalls = 5;

      // Make multiple calls to ensure deterministic behavior
      for (let i = 0; i < totalCalls; i++) {
        orderProcessor.processOrder(orderData, (err, result) => {
          results.push(result);
          completedCalls++;
          
          if (completedCalls === totalCalls) {
            // All results should be identical (except for timestamps)
            for (let j = 1; j < results.length; j++) {
              assert.strictEqual(results[j].success, results[0].success);
              assert.strictEqual(results[j].order.status, results[0].order.status);
              assert.strictEqual(results[j].order.totalAmount, results[0].order.totalAmount);
              assert.strictEqual(results[j].order.items.length, results[0].order.items.length);
              assert.strictEqual(results[j].message, results[0].message);
            }
            done();
          }
        });
      }
    });
  });

  describe("Input Validation", () => {
    it("should handle missing order data", (done) => {
      orderProcessor.processOrder(null, (err, result) => {
        assert.ok(err, "Should return an error");
        assert.strictEqual(err.message, "Order data is required");
        assert.strictEqual(result, null, "Result should be null");
        done();
      });
    });

    it("should handle missing customer ID", (done) => {
      const orderData = {
        items: []
      };

      orderProcessor.processOrder(orderData, (err, result) => {
        assert.ok(err, "Should return an error");
        assert.strictEqual(err.message, "Customer ID is required");
        assert.strictEqual(result, null, "Result should be null");
        done();
      });
    });
  });

  describe("Items Validation", () => {
    it("should validate empty items array", () => {
      const validation = orderProcessor.validateItems([]);
      assert.strictEqual(validation.valid, true);
      assert.strictEqual(validation.message, "Empty items array is valid");
    });

    it("should validate null items", () => {
      const validation = orderProcessor.validateItems(null);
      assert.strictEqual(validation.valid, false);
      assert.strictEqual(validation.message, "Items array is required");
    });

    it("should validate non-array items", () => {
      const validation = orderProcessor.validateItems("not an array");
      assert.strictEqual(validation.valid, false);
      assert.strictEqual(validation.message, "Items must be an array");
    });

    it("should validate items with missing properties", () => {
      const items = [{ price: 10 }]; // missing quantity
      const validation = orderProcessor.validateItems(items);
      assert.strictEqual(validation.valid, false);
      assert.strictEqual(validation.message, "Item at index 0 missing price or quantity");
    });

    it("should validate items with negative values", () => {
      const items = [{ price: -10, quantity: 1 }];
      const validation = orderProcessor.validateItems(items);
      assert.strictEqual(validation.valid, false);
      assert.strictEqual(validation.message, "Item at index 0 has negative price or quantity");
    });
  });

  describe("Batch Processing", () => {
    it("should handle empty batch", (done) => {
      orderProcessor.processBatch([], (err, result) => {
        assert.strictEqual(err, null, "Should not return an error");
        assert.strictEqual(result.success, true, "Should indicate success");
        assert.strictEqual(result.processed, 0, "Should process 0 orders");
        assert.deepStrictEqual(result.results, [], "Should return empty results");
        assert.strictEqual(result.message, "No orders to process");
        done();
      });
    });

    it("should handle batch with zero-item orders", (done) => {
      const orders = [
        { customerId: 1, items: [] },
        { customerId: 2, items: [] }
      ];

      orderProcessor.processBatch(orders, (err, result) => {
        assert.strictEqual(err, null, "Should not return an error");
        assert.strictEqual(result.success, true, "Should indicate success");
        assert.strictEqual(result.processed, 2, "Should process 2 orders");
        assert.strictEqual(result.results.length, 2, "Should return 2 results");
        
        // Check each result
        result.results.forEach(orderResult => {
          assert.strictEqual(orderResult.success, true);
          assert.strictEqual(orderResult.order.status, 'empty');
          assert.strictEqual(orderResult.order.totalAmount, 0);
          assert.strictEqual(orderResult.order.items.length, 0);
        });
        
        done();
      });
    });
  });
});