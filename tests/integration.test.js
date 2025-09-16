const request = require('supertest')
const express = require('express')
const bodyParser = require('body-parser')

// Mock the database model to avoid actual database connections in tests
jest.mock('../app/models/customer.model.js', () => ({
  create: jest.fn(),
  getAll: jest.fn(),
  findById: jest.fn(),
  updateById: jest.fn(),
  remove: jest.fn(),
  removeAll: jest.fn()
}))

const Customer = require('../app/models/customer.model.js')

// Create test app with routes
const createTestApp = () => {
  const app = express()

  const authMiddleware = (req, res, next) => {
    next()
  }

  app.use(bodyParser.json())
  app.use('api/*', authMiddleware)

  // Add a simple welcome route
  app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Node.js Express MySQL application.' })
  })

  // Include customer routes
  require('../app/routes/customer.routes.js')(app)

  return app
}

describe('API Integration Tests', () => {
  let app

  beforeAll(() => {
    app = createTestApp()
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Customer API Endpoints', () => {
    test('POST /customers should create a new customer', async () => {
      const newCustomer = {
        email: 'test@example.com',
        name: 'Test Customer',
        active: true
      }

      const mockCreatedCustomer = { id: 1, ...newCustomer }

      Customer.create.mockImplementation((customer, callback) => {
        callback(null, mockCreatedCustomer)
      })

      const response = await request(app)
        .post('/customers')
        .send(newCustomer)
        .expect(200)

      expect(response.body).toEqual(mockCreatedCustomer)
      expect(Customer.create).toHaveBeenCalled()
    })

    test('GET /customers should return all customers', async () => {
      const mockCustomers = [
        { id: 1, email: 'test1@example.com', name: 'Customer 1', active: true },
        { id: 2, email: 'test2@example.com', name: 'Customer 2', active: false }
      ]

      Customer.getAll.mockImplementation((callback) => {
        callback(null, mockCustomers)
      })

      const response = await request(app)
        .get('/customers')
        .expect(200)

      expect(response.body).toEqual(mockCustomers)
      expect(Customer.getAll).toHaveBeenCalled()
    })

    test('GET /customers/:id should return a specific customer', async () => {
      const mockCustomer = { id: 1, email: 'test@example.com', name: 'Test Customer', active: true }

      Customer.findById.mockImplementation((id, callback) => {
        callback(null, mockCustomer)
      })

      const response = await request(app)
        .get('/customers/1')
        .expect(200)

      expect(response.body).toEqual(mockCustomer)
      expect(Customer.findById).toHaveBeenCalledWith('1', expect.any(Function))
    })

    test('PUT /customers/:id should update a customer', async () => {
      const updateData = { name: 'Updated Customer', email: 'updated@example.com' }
      const mockUpdatedCustomer = { id: 1, ...updateData, active: true }

      Customer.updateById.mockImplementation((id, customer, callback) => {
        callback(null, mockUpdatedCustomer)
      })

      const response = await request(app)
        .put('/customers/1')
        .send(updateData)
        .expect(200)

      expect(response.body).toEqual(mockUpdatedCustomer)
      expect(Customer.updateById).toHaveBeenCalled()
    })

    test('DELETE /customers/:id should delete a customer', async () => {
      Customer.remove.mockImplementation((id, callback) => {
        callback(null, { message: 'Customer was deleted successfully!' })
      })

      const response = await request(app)
        .delete('/customers/1')
        .expect(200)

      expect(response.body.message).toBe('Customer was deleted successfully!')
      expect(Customer.remove).toHaveBeenCalledWith('1', expect.any(Function))
    })

    test('DELETE /customers should delete all customers', async () => {
      Customer.removeAll.mockImplementation((callback) => {
        callback(null, { message: 'All Customers were deleted successfully!' })
      })

      const response = await request(app)
        .delete('/customers')
        .expect(200)

      expect(response.body.message).toBe('All Customers were deleted successfully!')
      expect(Customer.removeAll).toHaveBeenCalled()
    })
  })

  describe('Error Handling', () => {
    test('POST /customers with empty body should return 400', async () => {
      const response = await request(app)
        .post('/customers')
        .send()
        .expect(400)

      expect(response.body.message).toBe('Content can not be empty!')
    })

    test('GET /customers/:id with non-existent ID should return 404', async () => {
      Customer.findById.mockImplementation((id, callback) => {
        const error = new Error('Not found')
        error.kind = 'not_found'
        callback(error, null)
      })

      const response = await request(app)
        .get('/customers/999')
        .expect(404)

      expect(response.body.message).toContain('Not found Customer with id 999')
    })
  })
})