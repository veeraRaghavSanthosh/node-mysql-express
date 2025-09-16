const express = require('express');
const request = require('supertest');
const userRouter = require('../user');

// Create test app
const createTestApp = () => {
    const app = express();
    app.use(express.json());
    app.use('/api/users', userRouter);
    return app;
};

describe('User API', () => {
    let app;

    beforeEach(() => {
        app = createTestApp();
        // Reset users array before each test by requiring fresh module
        jest.resetModules();
        const freshUserRouter = require('../user');
        app = express();
        app.use(express.json());
        app.use('/api/users', freshUserRouter);
    });

    describe('GET /api/users', () => {
        it('should return all users successfully', async () => {
            const response = await request(app)
                .get('/api/users')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data.length).toBeGreaterThan(0);
        });
    });

    describe('GET /api/users/:id', () => {
        it('should return a specific user by ID', async () => {
            const response = await request(app)
                .get('/api/users/1')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.id).toBe(1);
            expect(response.body.data.name).toBeDefined();
        });

        it('should return 404 for non-existent user', async () => {
            const response = await request(app)
                .get('/api/users/999')
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('User not found');
        });

        it('should return 400 for invalid user ID', async () => {
            const response = await request(app)
                .get('/api/users/invalid')
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Invalid user ID');
        });

        it('should return 400 for negative user ID', async () => {
            const response = await request(app)
                .get('/api/users/-1')
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Invalid user ID');
        });
    });

    describe('POST /api/users - NULL INPUT VALIDATION TESTS', () => {
        it('should handle null request body gracefully', async () => {
            const response = await request(app)
                .post('/api/users')
                .send(null)
                .expect(400);

            expect(response.body.success).toBe(false);
            // Express converts null to {}, so it gets caught by name validation
            expect(response.body.message).toBe('Name is required and must be a non-empty string');
        });

        it('should handle undefined request body gracefully', async () => {
            const response = await request(app)
                .post('/api/users')
                .expect(400);

            expect(response.body.success).toBe(false);
            // Express converts undefined to {}, so it gets caught by name validation
            expect(response.body.message).toBe('Name is required and must be a non-empty string');
        });

        it('should handle empty object request body', async () => {
            const response = await request(app)
                .post('/api/users')
                .send({})
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Name is required and must be a non-empty string');
        });

        it('should handle null name field', async () => {
            const response = await request(app)
                .post('/api/users')
                .send({ name: null, email: 'test@example.com' })
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Name is required and must be a non-empty string');
        });

        it('should handle undefined name field', async () => {
            const response = await request(app)
                .post('/api/users')
                .send({ name: undefined, email: 'test@example.com' })
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Name is required and must be a non-empty string');
        });

        it('should handle empty string name field', async () => {
            const response = await request(app)
                .post('/api/users')
                .send({ name: '', email: 'test@example.com' })
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Name is required and must be a non-empty string');
        });

        it('should handle whitespace-only name field', async () => {
            const response = await request(app)
                .post('/api/users')
                .send({ name: '   ', email: 'test@example.com' })
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Name cannot be empty or contain only whitespace');
        });

        it('should handle null email field', async () => {
            const response = await request(app)
                .post('/api/users')
                .send({ name: 'Test User', email: null })
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Email must be a valid email address');
        });

        it('should handle undefined email field', async () => {
            const response = await request(app)
                .post('/api/users')
                .send({ name: 'Test User', email: undefined })
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Email must be a valid email address');
        });

        it('should handle invalid email format', async () => {
            const response = await request(app)
                .post('/api/users')
                .send({ name: 'Test User', email: 'invalid-email' })
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Email must be a valid email address');
        });

        it('should handle non-string name field', async () => {
            const response = await request(app)
                .post('/api/users')
                .send({ name: 123, email: 'test@example.com' })
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Name is required and must be a non-empty string');
        });

        it('should handle non-string email field', async () => {
            const response = await request(app)
                .post('/api/users')
                .send({ name: 'Test User', email: 123 })
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Email must be a valid email address');
        });

        it('should create user successfully with valid data', async () => {
            const userData = {
                name: 'Test User',
                email: 'test@example.com',
                active: true
            };

            const response = await request(app)
                .post('/api/users')
                .send(userData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data.name).toBe(userData.name);
            expect(response.body.data.email).toBe(userData.email.toLowerCase());
            expect(response.body.data.active).toBe(userData.active);
            expect(response.body.data.id).toBeDefined();
        });

        it('should create user with default active=true when not provided', async () => {
            const userData = {
                name: 'Test User',
                email: 'test2@example.com'
            };

            const response = await request(app)
                .post('/api/users')
                .send(userData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data.active).toBe(true);
        });

        it('should handle null active field by setting to true', async () => {
            const userData = {
                name: 'Test User',
                email: 'test3@example.com',
                active: null
            };

            const response = await request(app)
                .post('/api/users')
                .send(userData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data.active).toBe(true);
        });

        it('should prevent duplicate email addresses', async () => {
            const userData = {
                name: 'Test User',
                email: 'john@example.com' // This email already exists in mock data
            };

            const response = await request(app)
                .post('/api/users')
                .send(userData)
                .expect(409);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('User with this email already exists');
        });
    });

    describe('PUT /api/users/:id - NULL INPUT VALIDATION TESTS', () => {
        it('should handle null request body gracefully', async () => {
            const response = await request(app)
                .put('/api/users/1')
                .send(null)
                .expect(400);

            expect(response.body.success).toBe(false);
            // Express converts null to {}, so it gets caught by empty body validation for PUT
            expect(response.body.message).toBe('Request body is required and must be a valid object');
        });

        it('should handle undefined request body gracefully', async () => {
            const response = await request(app)
                .put('/api/users/1')
                .expect(400);

            expect(response.body.success).toBe(false);
            // Express converts undefined to {}, so it gets caught by empty body validation for PUT
            expect(response.body.message).toBe('Request body is required and must be a valid object');
        });

        it('should handle null name field gracefully', async () => {
            const response = await request(app)
                .put('/api/users/1')
                .send({ name: null })
                .expect(200);

            expect(response.body.success).toBe(true);
            // Name should not be updated when null
        });

        it('should handle empty string name field', async () => {
            const response = await request(app)
                .put('/api/users/1')
                .send({ name: '' })
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Name cannot be empty or contain only whitespace');
        });

        it('should handle whitespace-only name field', async () => {
            const response = await request(app)
                .put('/api/users/1')
                .send({ name: '   ' })
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Name cannot be empty or contain only whitespace');
        });

        it('should handle null email field gracefully', async () => {
            const response = await request(app)
                .put('/api/users/1')
                .send({ email: null })
                .expect(200);

            expect(response.body.success).toBe(true);
            // Email should not be updated when null
        });

        it('should handle invalid email format', async () => {
            const response = await request(app)
                .put('/api/users/1')
                .send({ email: 'invalid-email' })
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Email must be a valid email address');
        });

        it('should update user successfully with valid data', async () => {
            const updateData = {
                name: 'Updated User',
                email: 'updated@example.com',
                active: false
            };

            const response = await request(app)
                .put('/api/users/1')
                .send(updateData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.name).toBe(updateData.name);
            expect(response.body.data.email).toBe(updateData.email.toLowerCase());
            expect(response.body.data.active).toBe(updateData.active);
        });

        it('should return 404 for non-existent user', async () => {
            const response = await request(app)
                .put('/api/users/999')
                .send({ name: 'Test' })
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('User not found');
        });

        it('should return 400 for invalid user ID', async () => {
            const response = await request(app)
                .put('/api/users/invalid')
                .send({ name: 'Test' })
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Invalid user ID');
        });
    });

    describe('GET /api/users/search/:query - NULL INPUT VALIDATION TESTS', () => {
        it('should handle empty query gracefully', async () => {
            const response = await request(app)
                .get('/api/users/search/%20') // URL encoded space
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Search query cannot be empty or contain only whitespace');
        });

        it('should search users successfully with valid query', async () => {
            const response = await request(app)
                .get('/api/users/search/john')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
        });

        it('should return empty array for non-matching query', async () => {
            const response = await request(app)
                .get('/api/users/search/nonexistent')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toEqual([]);
        });
    });

    describe('DELETE /api/users/:id', () => {
        it('should delete user successfully', async () => {
            const response = await request(app)
                .delete('/api/users/1')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.id).toBe(1);
        });

        it('should return 404 for non-existent user', async () => {
            const response = await request(app)
                .delete('/api/users/999')
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('User not found');
        });

        it('should return 400 for invalid user ID', async () => {
            const response = await request(app)
                .delete('/api/users/invalid')
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Invalid user ID');
        });
    });

    describe('Backward Compatibility Tests', () => {
        it('should maintain existing API response format', async () => {
            const response = await request(app)
                .get('/api/users')
                .expect(200);

            // Ensure response format matches expected structure
            expect(response.body).toHaveProperty('success');
            expect(response.body).toHaveProperty('data');
            expect(typeof response.body.success).toBe('boolean');
            expect(Array.isArray(response.body.data)).toBe(true);
        });

        it('should handle legacy requests with missing optional fields', async () => {
            const userData = {
                name: 'Legacy User',
                email: 'legacy@example.com'
                // No active field - should default to true
            };

            const response = await request(app)
                .post('/api/users')
                .send(userData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data.active).toBe(true);
        });

        it('should maintain error response format', async () => {
            const response = await request(app)
                .get('/api/users/999')
                .expect(404);

            expect(response.body).toHaveProperty('success');
            expect(response.body).toHaveProperty('message');
            expect(response.body.success).toBe(false);
            expect(typeof response.body.message).toBe('string');
        });
    });
});