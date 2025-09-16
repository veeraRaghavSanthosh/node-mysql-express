const request = require('supertest')
const express = require('express')
const bodyParser = require('body-parser')

// Create a test app similar to the main app but without database dependency
const createTestApp = () => {
  const app = express()
  
  const authMiddleware = (req, res, next) => {
    next()
  }

  app.use(bodyParser.json())
  app.use('api/*', authMiddleware)

  // Simple route
  app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Node.js Express MySQL application.' })
  })

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() })
  })

  return app
}

describe('Express App', () => {
  let app

  beforeAll(() => {
    app = createTestApp()
  })

  test('GET / should return welcome message', async () => {
    const response = await request(app)
      .get('/')
      .expect(200)

    expect(response.body.message).toBe('Welcome to Node.js Express MySQL application.')
  })

  test('GET /health should return health status', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200)

    expect(response.body.status).toBe('OK')
    expect(response.body.timestamp).toBeDefined()
  })

  test('POST request with JSON body should be parsed correctly', async () => {
    app.post('/test', (req, res) => {
      res.json({ received: req.body })
    })

    const testData = { name: 'test', value: 123 }
    const response = await request(app)
      .post('/test')
      .send(testData)
      .expect(200)

    expect(response.body.received).toEqual(testData)
  })
})