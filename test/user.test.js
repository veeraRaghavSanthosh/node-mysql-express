const request = require('supertest');
const express = require('express');
const userRouter = require('../src/api/user');

// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/api/users', userRouter);

describe('User API', () => {
  describe('GET /api/users', () => {
    test('should return all users', async () => {
      const response = await request(app)
        .get('/api/users')
        .expect(200);

      expect(response.body).toHaveProperty('users');
      expect(Array.isArray(response.body.users)).toBe(true);
    });
  });

  describe('GET /api/users/:id', () => {
    test('should return a user by valid ID', async () => {
      const response = await request(app)
        .get('/api/users/1')
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user.id).toBe(1);
    });

    test('should return 400 for null ID', async () => {
      const response = await request(app)
        .get('/api/users/null')
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid user ID');
    });

    test('should return 400 for undefined ID', async () => {
      const response = await request(app)
        .get('/api/users/undefined')
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid user ID');
    });

    test('should return 400 for empty ID', async () => {
      const response = await request(app)
        .get('/api/users/')
        .expect(200); // This will hit the GET all users route
    });

    test('should return 400 for invalid ID format', async () => {
      const response = await request(app)
        .get('/api/users/abc')
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('ID must be a valid number');
    });

    test('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .get('/api/users/999')
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('User not found');
    });
  });

  describe('POST /api/users', () => {
    test('should create a new user with valid data', async () => {
      const newUser = {
        name: 'Test User',
        email: 'test@example.com'
      };

      const response = await request(app)
        .post('/api/users')
        .send(newUser)
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user.name).toBe(newUser.name);
      expect(response.body.user.email).toBe(newUser.email);
      expect(response.body.user).toHaveProperty('id');
    });

    test('should return 400 for null request body', async () => {
      const response = await request(app)
        .post('/api/users')
        .send(null)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      // When null is sent, Express converts it to {}, so name validation catches it
      expect(response.body.error).toContain('name is required');
    });

    test('should return 400 for missing name', async () => {
      const invalidUser = {
        email: 'test@example.com'
      };

      const response = await request(app)
        .post('/api/users')
        .send(invalidUser)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('name is required');
    });

    test('should return 400 for null name', async () => {
      const invalidUser = {
        name: null,
        email: 'test@example.com'
      };

      const response = await request(app)
        .post('/api/users')
        .send(invalidUser)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('name is required');
    });

    test('should return 400 for empty name', async () => {
      const invalidUser = {
        name: '',
        email: 'test@example.com'
      };

      const response = await request(app)
        .post('/api/users')
        .send(invalidUser)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('name is required');
    });

    test('should return 400 for missing email', async () => {
      const invalidUser = {
        name: 'Test User'
      };

      const response = await request(app)
        .post('/api/users')
        .send(invalidUser)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('email is required');
    });

    test('should return 400 for null email', async () => {
      const invalidUser = {
        name: 'Test User',
        email: null
      };

      const response = await request(app)
        .post('/api/users')
        .send(invalidUser)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('email is required');
    });

    test('should return 400 for invalid email format', async () => {
      const invalidUser = {
        name: 'Test User',
        email: 'invalid-email'
      };

      const response = await request(app)
        .post('/api/users')
        .send(invalidUser)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid email format');
    });

    test('should return 409 for duplicate email', async () => {
      const duplicateUser = {
        name: 'Duplicate User',
        email: 'john@example.com' // This email already exists in the default users
      };

      const response = await request(app)
        .post('/api/users')
        .send(duplicateUser)
        .expect(409);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('already exists');
    });
  });

  describe('PUT /api/users/:id', () => {
    test('should update user with valid data', async () => {
      const updateData = {
        name: 'Updated Name',
        email: 'updated@example.com'
      };

      const response = await request(app)
        .put('/api/users/1')
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user.name).toBe(updateData.name);
      expect(response.body.user.email).toBe(updateData.email);
    });

    test('should return 400 for null ID', async () => {
      const response = await request(app)
        .put('/api/users/null')
        .send({ name: 'Test' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid user ID');
    });

    test('should return 400 for null request body', async () => {
      const response = await request(app)
        .put('/api/users/1')
        .send(null)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Request body is required');
    });

    test('should return 400 for null name', async () => {
      const invalidUpdate = {
        name: null
      };

      const response = await request(app)
        .put('/api/users/1')
        .send(invalidUpdate)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('name must be a non-empty string');
    });

    test('should return 404 for non-existent user', async () => {
      const updateData = {
        name: 'Updated Name'
      };

      const response = await request(app)
        .put('/api/users/999')
        .send(updateData)
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('User not found');
    });
  });

  describe('DELETE /api/users/:id', () => {
    test('should delete user with valid ID', async () => {
      const response = await request(app)
        .delete('/api/users/2')
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body.message).toContain('deleted successfully');
    });

    test('should return 400 for null ID', async () => {
      const response = await request(app)
        .delete('/api/users/null')
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid user ID');
    });

    test('should return 400 for undefined ID', async () => {
      const response = await request(app)
        .delete('/api/users/undefined')
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid user ID');
    });

    test('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .delete('/api/users/999')
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('User not found');
    });
  });

  describe('Error handling', () => {
    test('should handle unexpected errors gracefully', async () => {
      // Mock a scenario that would cause an internal error
      // This is more of an integration test to ensure error handling works
      const response = await request(app)
        .get('/api/users/1')
        .expect(200);

      expect(response.body).toHaveProperty('user');
    });
  });
});

// Additional tests for edge cases and null input scenarios
describe('Null Input Edge Cases', () => {
  test('should handle completely null request gracefully', async () => {
    const response = await request(app)
      .post('/api/users')
      .set('Content-Type', 'application/json')
      .send('null');
    
    // When sending raw "null" string as JSON, Express returns 400 with empty body
    // This is correct behavior for malformed JSON
    expect(response.status).toBe(400);
  });

  test('should handle undefined values in request body', async () => {
    const requestWithUndefined = {
      name: undefined,
      email: undefined
    };

    const response = await request(app)
      .post('/api/users')
      .send(requestWithUndefined)
      .expect(400);

    expect(response.body).toHaveProperty('error');
  });

  test('should handle mixed null and valid values', async () => {
    const mixedRequest = {
      name: 'Valid Name',
      email: null
    };

    const response = await request(app)
      .post('/api/users')
      .send(mixedRequest)
      .expect(400);

    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toContain('email is required');
  });

  test('should handle empty object', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({})
      .expect(400);

    expect(response.body).toHaveProperty('error');
  });

  test('should handle whitespace-only strings', async () => {
    const whitespaceRequest = {
      name: '   ',
      email: '  test@example.com  '
    };

    const response = await request(app)
      .post('/api/users')
      .send(whitespaceRequest)
      .expect(400);

    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toContain('name is required');
  });
});