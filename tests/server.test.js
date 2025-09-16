const request = require('supertest');

// Mock the customer model before requiring the server
jest.mock('../app/models/customer.model.js');

// Import after mocking
const Customer = require('../app/models/customer.model.js');

// Mock the database connection
jest.mock('../app/models/db.js', () => ({
  query: jest.fn()
}));

describe('Server Integration Tests', () => {
  let server;
  let app;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Mock successful database connection
    const mockDb = require('../app/models/db.js');
    mockDb.query.mockImplementation((query, callback) => {
      callback(null, []);
    });

    // Require server after mocking
    delete require.cache[require.resolve('../server.js')];
    app = require('../server.js');
  });

  afterEach(() => {
    if (server) {
      server.close();
    }
  });

  describe('Middleware Routes', () => {
    it('should return users from middleware route', async () => {
      const response = await request(app)
        .get('/user')
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(Array.isArray(response.body.user)).toBe(true);
      expect(response.body.user).toHaveLength(2);
      expect(response.body.user[0]).toHaveProperty('id', 1);
      expect(response.body.user[0]).toHaveProperty('name', 'test3');
    });
  });

  describe('Customer API Routes', () => {
    it('should handle POST /api/customers', async () => {
      const mockCustomer = {
        email: 'test@example.com',
        name: 'Test User',
        active: true
      };

      Customer.create.mockImplementation((customer, callback) => {
        callback(null, { id: 1, ...customer });
      });

      const response = await request(app)
        .post('/api/customers')
        .send(mockCustomer)
        .expect(200);

      expect(response.body).toHaveProperty('id', 1);
      expect(response.body).toHaveProperty('email', mockCustomer.email);
    });

    it('should handle GET /api/customers', async () => {
      const mockCustomers = [
        { id: 1, email: 'test1@example.com', name: 'Test User 1', active: true },
        { id: 2, email: 'test2@example.com', name: 'Test User 2', active: false }
      ];

      Customer.getAll.mockImplementation((callback) => {
        callback(null, mockCustomers);
      });

      const response = await request(app)
        .get('/api/customers')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(2);
    });

    it('should handle GET /api/customers/:id', async () => {
      const mockCustomer = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        active: true
      };

      Customer.findById.mockImplementation((id, callback) => {
        callback(null, mockCustomer);
      });

      const response = await request(app)
        .get('/api/customers/1')
        .expect(200);

      expect(response.body).toEqual(mockCustomer);
    });

    it('should handle PUT /api/customers/:id', async () => {
      const updateData = {
        email: 'updated@example.com',
        name: 'Updated User',
        active: false
      };

      Customer.updateById.mockImplementation((id, customer, callback) => {
        callback(null, { id: parseInt(id), ...customer });
      });

      const response = await request(app)
        .put('/api/customers/1')
        .send(updateData)
        .expect(200);

      expect(response.body.id).toBe(1);
      expect(response.body.email).toBe(updateData.email);
    });

    it('should handle DELETE /api/customers/:id', async () => {
      Customer.remove.mockImplementation((id, callback) => {
        callback(null, { affectedRows: 1 });
      });

      const response = await request(app)
        .delete('/api/customers/1')
        .expect(200);

      expect(response.body.message).toBe('Customer was deleted successfully!');
    });
  });
});