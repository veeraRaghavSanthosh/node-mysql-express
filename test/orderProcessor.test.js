const { expect } = require('chai');
const sinon = require('sinon');
const OrderProcessor = require('../app/models/orderProcessor');

describe('OrderProcessor', () => {
  let sandbox;

  beforeEach(() => {
    // Create a sandbox for each test to ensure clean state
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    // Restore all mocks after each test
    sandbox.restore();
  });

  describe('orderProcessor_should_handle_zero_items', () => {
    it('should handle zero items deterministically', (done) => {
      // Arrange
      const orderId = 'test-order-123';
      const items = []; // Zero items case
      
      // Act
      OrderProcessor.processOrder(orderId, items, (err, result) => {
        // Assert
        try {
          expect(err).to.be.null;
          expect(result).to.be.an('object');
          expect(result.orderId).to.equal(orderId);
          expect(result.status).to.equal('completed');
          expect(result.itemCount).to.equal(0);
          expect(result.totalAmount).to.equal(0);
          expect(result.processedAt).to.be.a('string');
          
          // Verify processedAt is a valid ISO date string
          const processedDate = new Date(result.processedAt);
          expect(processedDate).to.be.instanceOf(Date);
          expect(processedDate.toString()).to.not.equal('Invalid Date');
          
          done();
        } catch (assertionError) {
          done(assertionError);
        }
      });
    });

    it('should handle null items deterministically', (done) => {
      // Arrange
      const orderId = 'test-order-456';
      const items = null; // Null items case
      
      // Act
      OrderProcessor.processOrder(orderId, items, (err, result) => {
        // Assert
        try {
          expect(err).to.be.null;
          expect(result).to.be.an('object');
          expect(result.orderId).to.equal(orderId);
          expect(result.status).to.equal('completed');
          expect(result.itemCount).to.equal(0);
          expect(result.totalAmount).to.equal(0);
          expect(result.processedAt).to.be.a('string');
          
          done();
        } catch (assertionError) {
          done(assertionError);
        }
      });
    });

    it('should handle undefined items deterministically', (done) => {
      // Arrange
      const orderId = 'test-order-789';
      const items = undefined; // Undefined items case
      
      // Act
      OrderProcessor.processOrder(orderId, items, (err, result) => {
        // Assert
        try {
          expect(err).to.be.null;
          expect(result).to.be.an('object');
          expect(result.orderId).to.equal(orderId);
          expect(result.status).to.equal('completed');
          expect(result.itemCount).to.equal(0);
          expect(result.totalAmount).to.equal(0);
          expect(result.processedAt).to.be.a('string');
          
          done();
        } catch (assertionError) {
          done(assertionError);
        }
      });
    });

    it('should complete within reasonable time for zero items', (done) => {
      // Arrange
      const orderId = 'test-order-timing';
      const items = [];
      const startTime = Date.now();
      
      // Act
      OrderProcessor.processOrder(orderId, items, (err, result) => {
        // Assert
        try {
          const endTime = Date.now();
          const duration = endTime - startTime;
          
          expect(err).to.be.null;
          expect(result).to.be.an('object');
          expect(duration).to.be.lessThan(100); // Should complete in less than 100ms
          
          done();
        } catch (assertionError) {
          done(assertionError);
        }
      });
    });

    it('should be consistent across multiple calls', (done) => {
      // Arrange
      const orderId = 'test-order-consistency';
      const items = [];
      const results = [];
      let completedCalls = 0;
      const totalCalls = 5;
      
      // Act - make multiple calls
      for (let i = 0; i < totalCalls; i++) {
        OrderProcessor.processOrder(`${orderId}-${i}`, items, (err, result) => {
          try {
            expect(err).to.be.null;
            results.push(result);
            completedCalls++;
            
            if (completedCalls === totalCalls) {
              // Assert - all results should have same structure
              results.forEach((result, index) => {
                expect(result.orderId).to.equal(`${orderId}-${index}`);
                expect(result.status).to.equal('completed');
                expect(result.itemCount).to.equal(0);
                expect(result.totalAmount).to.equal(0);
                expect(result.processedAt).to.be.a('string');
              });
              
              done();
            }
          } catch (assertionError) {
            done(assertionError);
          }
        });
      }
    });
  });

  describe('orderProcessor with items', () => {
    it('should process orders with items correctly', (done) => {
      // Mock the database query to avoid actual DB calls in tests
      const mockSql = require('../app/models/db');
      const queryStub = sandbox.stub(mockSql, 'query');
      queryStub.callsArgWith(2, null, { insertId: 123 });

      // Arrange
      const orderId = 'test-order-with-items';
      const items = [
        { price: 10.50, quantity: 2 },
        { price: 5.25, quantity: 1 }
      ];
      
      // Act
      OrderProcessor.processOrder(orderId, items, (err, result) => {
        // Assert
        try {
          expect(err).to.be.null;
          expect(result).to.be.an('object');
          expect(result.orderId).to.equal(123);
          expect(result.status).to.equal('completed');
          expect(result.itemCount).to.equal(2);
          expect(result.totalAmount).to.equal(26.25); // (10.50 * 2) + (5.25 * 1)
          
          done();
        } catch (assertionError) {
          done(assertionError);
        }
      });
    });
  });
});