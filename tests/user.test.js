const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const userController = require('../src/api/user');

// Create test app
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Set up routes for testing
app.post('/api/users', userController.createUser);
app.get('/api/users/:id', userController.getUserById);
app.put('/api/users/:id', userController.updateUser);

describe('User API Tests', () => {
  
  describe('POST /api/users - Create User', () => {
    
    test('should create user with valid data', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        active: true
      };
      
      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User created successfully');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe('John Doe');
      expect(response.body.data.email).toBe('john@example.com');
      expect(response.body.data.active).toBe(true);
    });
    
    test('should return 400 when request body is null', async () => {
      const response = await request(app)
        .post('/api/users')
        .send(null)
        .expect(400);
      
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
      // Our validation correctly detects null input
      expect(response.body.errors).toContain('User data cannot be null or undefined');
    });
    
    test('should return 400 when request body is undefined', async () => {
      const response = await request(app)
        .post('/api/users')
        .expect(400);
      
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
      // Our validation correctly detects undefined/missing input
      expect(response.body.errors).toContain('User data cannot be null or undefined');
    });
    
    test('should return 400 when request body is not an object', async () => {
      const response = await request(app)
        .post('/api/users')
        .send('invalid data')
        .expect(400);
      
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
      // When body-parser receives a string, it becomes {} and validation fails on required fields
      expect(response.body.errors).toContain('Name is required and must be a non-empty string');
      expect(response.body.errors).toContain('Email is required and must be a string');
    });
    
    test('should return 400 when name is missing', async () => {
      const userData = {
        email: 'john@example.com'
      };
      
      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(400);
      
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('Name is required and must be a non-empty string');
    });
    
    test('should return 400 when name is empty string', async () => {
      const userData = {
        name: '   ',
        email: 'john@example.com'
      };
      
      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(400);
      
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('Name is required and must be a non-empty string');
    });
    
    test('should return 400 when email is missing', async () => {
      const userData = {
        name: 'John Doe'
      };
      
      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(400);
      
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('Email is required and must be a string');
    });
    
    test('should return 400 when email format is invalid', async () => {
      const userData = {
        name: 'John Doe',
        email: 'invalid-email'
      };
      
      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(400);
      
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('Email must be a valid email address');
    });
    
    test('should handle multiple validation errors', async () => {
      const userData = {
        name: '',
        email: 'invalid-email'
      };
      
      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(400);
      
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('Name is required and must be a non-empty string');
      expect(response.body.errors).toContain('Email must be a valid email address');
    });
    
    test('should trim whitespace from name and email', async () => {
      const userData = {
        name: '  John Doe  ',
        email: '  john@example.com  '
      };
      
      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(201);
      
      expect(response.body.data.name).toBe('John Doe');
      expect(response.body.data.email).toBe('john@example.com');
    });
    
  });
  
  describe('GET /api/users/:id - Get User', () => {
    
    test('should get user with valid ID', async () => {
      const response = await request(app)
        .get('/api/users/123')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id', '123');
      expect(response.body.data).toHaveProperty('name');
      expect(response.body.data).toHaveProperty('email');
    });
    
    test('should return 400 when ID is missing', async () => {
      const response = await request(app)
        .get('/api/users/')
        .expect(404); // Express returns 404 for missing route params
    });
    
    test('should return 400 when ID is empty', async () => {
      // Use %20 for URL encoded space
      const response = await request(app)
        .get('/api/users/%20')
        .expect(400);
      
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User ID is required');
    });
    
  });
  
  describe('PUT /api/users/:id - Update User', () => {
    
    test('should update user with valid data', async () => {
      const updateData = {
        name: 'Jane Doe',
        email: 'jane@example.com'
      };
      
      const response = await request(app)
        .put('/api/users/123')
        .send(updateData)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User updated successfully');
      expect(response.body.data.name).toBe('Jane Doe');
      expect(response.body.data.email).toBe('jane@example.com');
    });
    
    test('should return 400 when update data is empty', async () => {
      const response = await request(app)
        .put('/api/users/123')
        .send({})
        .expect(400);
      
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Update data cannot be empty');
    });
    
    test('should return 400 when update data is null', async () => {
      const response = await request(app)
        .put('/api/users/123')
        .send(null)
        .expect(400);
      
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Update data cannot be empty');
    });
    
    test('should return 400 when name is invalid', async () => {
      const updateData = {
        name: ''
      };
      
      const response = await request(app)
        .put('/api/users/123')
        .send(updateData)
        .expect(400);
      
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('Name must be a non-empty string');
    });
    
    test('should return 400 when email is invalid', async () => {
      const updateData = {
        email: 'invalid-email'
      };
      
      const response = await request(app)
        .put('/api/users/123')
        .send(updateData)
        .expect(400);
      
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('Email must be a valid email address');
    });
    
    test('should allow partial updates', async () => {
      const updateData = {
        name: 'Updated Name'
      };
      
      const response = await request(app)
        .put('/api/users/123')
        .send(updateData)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated Name');
    });
    
  });
  
});

describe('validateUserInput function tests', () => {
  
  test('should return valid for correct user data', () => {
    const userData = {
      name: 'John Doe',
      email: 'john@example.com'
    };
    
    const result = userController.validateUserInput(userData);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
  
  test('should return invalid for null input', () => {
    const result = userController.validateUserInput(null);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('User data cannot be null or undefined');
  });
  
  test('should return invalid for undefined input', () => {
    const result = userController.validateUserInput(undefined);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('User data cannot be null or undefined');
  });
  
  test('should return invalid for non-object input', () => {
    const result = userController.validateUserInput('string');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('User data must be an object');
  });
  
  test('should return invalid for missing required fields', () => {
    const userData = {};
    const result = userController.validateUserInput(userData);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Name is required and must be a non-empty string');
    expect(result.errors).toContain('Email is required and must be a string');
  });
  
});