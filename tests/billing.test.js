const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const logger = require('../app/config/logger.config.js');
const Billing = require('../app/models/billing.model.js');

// Mock the database connection
jest.mock('../app/models/db.js', () => ({
  query: jest.fn()
}));

const sql = require('../app/models/db.js');

// Create test app
const app = express();
app.use(bodyParser.json());
require('../app/routes/billing.routes.js')(app);

describe('Billing API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set log level to error to reduce test output noise
    logger.level = 'error';
  });

  describe('POST /billing', () => {
    it('should create a new billing record successfully', async () => {
      const mockBilling = {
        customer_id: 1,
        amount: 100.50,
        description: 'Test billing',
        status: 'pending'
      };

      const mockResult = { insertId: 1 };
      sql.query.mockImplementation((query, data, callback) => {
        callback(null, mockResult);
      });

      const response = await request(app)
        .post('/billing')
        .send(mockBilling)
        .expect(200);

      expect(response.body).toEqual({
        id: 1,
        ...mockBilling,
        created_at: expect.any(String)
      });
    });

    it('should return 400 for missing required fields', async () => {
      await request(app)
        .post('/billing')
        .send({ description: 'Test' })
        .expect(400);
    });
  });
});