const customerController = require('../app/controllers/customer.controller')

// Mock the Customer model
jest.mock('../app/models/customer.model.js', () => ({
  create: jest.fn(),
  getAll: jest.fn(),
  findById: jest.fn(),
  updateById: jest.fn(),
  remove: jest.fn(),
  removeAll: jest.fn()
}))

const Customer = require('../app/models/customer.model.js')

describe('Customer Controller', () => {
  let mockReq, mockRes

  beforeEach(() => {
    mockReq = {
      body: {},
      params: {}
    }
    mockRes = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn()
    }
    jest.clearAllMocks()
  })

  describe('create', () => {
    test('should return 400 if request body is empty', () => {
      mockReq.body = null

      customerController.create(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(400)
      expect(mockRes.send).toHaveBeenCalledWith({
        message: 'Content can not be empty!'
      })
    })

    test('should create customer successfully', () => {
      mockReq.body = {
        email: 'test@example.com',
        name: 'Test User',
        active: true
      }

      const mockCustomerData = { id: 1, ...mockReq.body }
      Customer.create.mockImplementation((customer, callback) => {
        callback(null, mockCustomerData)
      })

      customerController.create(mockReq, mockRes)

      expect(Customer.create).toHaveBeenCalled()
      expect(mockRes.send).toHaveBeenCalledWith(mockCustomerData)
    })

    test('should handle database error', () => {
      mockReq.body = {
        email: 'test@example.com',
        name: 'Test User',
        active: true
      }

      Customer.create.mockImplementation((customer, callback) => {
        callback(new Error('Database error'), null)
      })

      customerController.create(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(500)
      expect(mockRes.send).toHaveBeenCalledWith({
        message: 'Database error'
      })
    })
  })

  describe('findAll', () => {
    test('should retrieve all customers successfully', () => {
      const mockCustomers = [
        { id: 1, email: 'test1@example.com', name: 'User 1', active: true },
        { id: 2, email: 'test2@example.com', name: 'User 2', active: false }
      ]

      Customer.getAll.mockImplementation((callback) => {
        callback(null, mockCustomers)
      })

      customerController.findAll(mockReq, mockRes)

      expect(Customer.getAll).toHaveBeenCalled()
      expect(mockRes.send).toHaveBeenCalledWith(mockCustomers)
    })

    test('should handle database error', () => {
      Customer.getAll.mockImplementation((callback) => {
        callback(new Error('Database error'), null)
      })

      customerController.findAll(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(500)
      expect(mockRes.send).toHaveBeenCalledWith({
        message: 'Database error'
      })
    })
  })

  describe('findOne', () => {
    test('should find customer by id successfully', () => {
      mockReq.params.customerId = '1'
      const mockCustomer = { id: 1, email: 'test@example.com', name: 'Test User', active: true }

      Customer.findById.mockImplementation((id, callback) => {
        callback(null, mockCustomer)
      })

      customerController.findOne(mockReq, mockRes)

      expect(Customer.findById).toHaveBeenCalledWith('1', expect.any(Function))
      expect(mockRes.send).toHaveBeenCalledWith(mockCustomer)
    })

    test('should return 404 if customer not found', () => {
      mockReq.params.customerId = '999'

      Customer.findById.mockImplementation((id, callback) => {
        const error = new Error('Not found')
        error.kind = 'not_found'
        callback(error, null)
      })

      customerController.findOne(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(404)
      expect(mockRes.send).toHaveBeenCalledWith({
        message: 'Not found Customer with id 999.'
      })
    })
  })

  describe('update', () => {
    test('should return 400 if request body is empty', () => {
      mockReq.body = null
      mockReq.params.customerId = '1'

      customerController.update(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(400)
      expect(mockRes.send).toHaveBeenCalledWith({
        message: 'Content can not be empty!'
      })
    })

    test('should update customer successfully', () => {
      mockReq.body = { name: 'Updated Name', email: 'updated@example.com' }
      mockReq.params.customerId = '1'
      const mockUpdatedCustomer = { id: 1, ...mockReq.body }

      Customer.updateById.mockImplementation((id, customer, callback) => {
        callback(null, mockUpdatedCustomer)
      })

      customerController.update(mockReq, mockRes)

      expect(Customer.updateById).toHaveBeenCalled()
      expect(mockRes.send).toHaveBeenCalledWith(mockUpdatedCustomer)
    })
  })

  describe('delete', () => {
    test('should delete customer successfully', () => {
      mockReq.params.customerId = '1'

      Customer.remove.mockImplementation((id, callback) => {
        callback(null, { message: 'Customer was deleted successfully!' })
      })

      customerController.delete(mockReq, mockRes)

      expect(Customer.remove).toHaveBeenCalledWith('1', expect.any(Function))
      expect(mockRes.send).toHaveBeenCalledWith({
        message: 'Customer was deleted successfully!'
      })
    })

    test('should return 404 if customer not found', () => {
      mockReq.params.customerId = '999'

      Customer.remove.mockImplementation((id, callback) => {
        const error = new Error('Not found')
        error.kind = 'not_found'
        callback(error, null)
      })

      customerController.delete(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(404)
      expect(mockRes.send).toHaveBeenCalledWith({
        message: 'Not found Customer with id 999.'
      })
    })
  })

  describe('deleteAll', () => {
    test('should delete all customers successfully', () => {
      Customer.removeAll.mockImplementation((callback) => {
        callback(null, { message: 'All Customers were deleted successfully!' })
      })

      customerController.deleteAll(mockReq, mockRes)

      expect(Customer.removeAll).toHaveBeenCalled()
      expect(mockRes.send).toHaveBeenCalledWith({
        message: 'All Customers were deleted successfully!'
      })
    })

    test('should handle database error', () => {
      Customer.removeAll.mockImplementation((callback) => {
        callback(new Error('Database error'), null)
      })

      customerController.deleteAll(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(500)
      expect(mockRes.send).toHaveBeenCalledWith({
        message: 'Database error'
      })
    })
  })
})