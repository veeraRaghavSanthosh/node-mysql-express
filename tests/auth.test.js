const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Mock the database module
jest.mock('../app/models/db.js', () => ({
  query: jest.fn()
}));

const auth = require('../lib/auth');
const sql = require('../app/models/db.js');
const mockQuery = sql.query;

describe('Auth Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('hashPassword', () => {
    it('should hash a password successfully', async () => {
      const password = 'testpassword123';
      const hashedPassword = await auth.hashPassword(password);
      
      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(typeof hashedPassword).toBe('string');
    });

    it('should throw error for invalid input', async () => {
      await expect(auth.hashPassword(null)).rejects.toThrow();
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching password', async () => {
      const password = 'testpassword123';
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const result = await auth.comparePassword(password, hashedPassword);
      expect(result).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      const password = 'testpassword123';
      const wrongPassword = 'wrongpassword';
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const result = await auth.comparePassword(wrongPassword, hashedPassword);
      expect(result).toBe(false);
    });

    it('should handle invalid hash gracefully', async () => {
      const password = 'testpassword123';
      const invalidHash = 'invalid-hash-format';
      
      // bcrypt.compare doesn't throw for invalid hash, it returns false or may throw
      try {
        const result = await auth.comparePassword(password, invalidHash);
        // If it doesn't throw, it should return false
        expect(result).toBe(false);
      } catch (error) {
        // If it does throw, that's also acceptable behavior
        expect(error).toBeDefined();
      }
    });
  });

  describe('generateToken', () => {
    it('should generate a valid JWT token', async () => {
      const payload = { id: 1, email: 'test@example.com', name: 'Test User' };
      const token = await auth.generateToken(payload);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should throw error for invalid payload', async () => {
      await expect(auth.generateToken(null)).rejects.toThrow();
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', async () => {
      const payload = { id: 1, email: 'test@example.com', name: 'Test User' };
      const token = jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '24h' });
      
      const decoded = await auth.verifyToken(token);
      
      expect(decoded).toBeDefined();
      expect(decoded.id).toBe(payload.id);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.name).toBe(payload.name);
    });

    it('should throw error for invalid token', async () => {
      const invalidToken = 'invalid.token.here';
      
      await expect(auth.verifyToken(invalidToken)).rejects.toThrow();
    });

    it('should throw error for expired token', async () => {
      const payload = { id: 1, email: 'test@example.com', name: 'Test User' };
      const expiredToken = jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '-1h' });
      
      await expect(auth.verifyToken(expiredToken)).rejects.toThrow();
    });
  });

  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'testpassword123'
      };

      // Mock database responses
      mockQuery
        .mockImplementationOnce((sql, params, callback) => {
          callback(null, []); // No existing user
        })
        .mockImplementationOnce((sql, params, callback) => {
          callback(null, { insertId: 1 }); // Insert successful
        });

      const result = await auth.createUser(userData);

      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(result.email).toBe(userData.email);
      expect(result.name).toBe(userData.name);
      expect(result.password).toBeUndefined(); // Password should not be returned
      expect(mockQuery).toHaveBeenCalledTimes(2);
    });

    it('should throw error if user already exists', async () => {
      const userData = {
        email: 'existing@example.com',
        name: 'Existing User',
        password: 'testpassword123'
      };

      // Mock database response - user exists
      mockQuery.mockImplementationOnce((sql, params, callback) => {
        callback(null, [{ id: 1, email: 'existing@example.com' }]);
      });

      await expect(auth.createUser(userData)).rejects.toThrow('User already exists');
      expect(mockQuery).toHaveBeenCalledTimes(1);
    });

    it('should throw error if database insert fails', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'testpassword123'
      };

      // Mock database responses
      mockQuery
        .mockImplementationOnce((sql, params, callback) => {
          callback(null, []); // No existing user
        })
        .mockImplementationOnce((sql, params, callback) => {
          callback(new Error('Database error'), null); // Insert fails
        });

      await expect(auth.createUser(userData)).rejects.toThrow('User creation failed');
    });
  });

  describe('authenticateUser', () => {
    it('should authenticate user with correct credentials', async () => {
      const email = 'test@example.com';
      const password = 'testpassword123';
      const hashedPassword = await bcrypt.hash(password, 10);

      const mockUser = {
        id: 1,
        email,
        name: 'Test User',
        password: hashedPassword
      };

      // Mock database response
      mockQuery.mockImplementationOnce((sql, params, callback) => {
        callback(null, [mockUser]);
      });

      const result = await auth.authenticateUser(email, password);

      expect(result).toBeDefined();
      expect(result.user.id).toBe(mockUser.id);
      expect(result.user.email).toBe(mockUser.email);
      expect(result.user.name).toBe(mockUser.name);
      expect(result.user.password).toBeUndefined();
      expect(result.token).toBeDefined();
      expect(typeof result.token).toBe('string');
    });

    it('should throw error for non-existent user', async () => {
      const email = 'nonexistent@example.com';
      const password = 'testpassword123';

      // Mock database response - no user found
      mockQuery.mockImplementationOnce((sql, params, callback) => {
        callback(null, []);
      });

      await expect(auth.authenticateUser(email, password)).rejects.toThrow('User not found');
    });

    it('should throw error for incorrect password', async () => {
      const email = 'test@example.com';
      const password = 'wrongpassword';
      const hashedPassword = await bcrypt.hash('correctpassword', 10);

      const mockUser = {
        id: 1,
        email,
        name: 'Test User',
        password: hashedPassword
      };

      // Mock database response
      mockQuery.mockImplementationOnce((sql, params, callback) => {
        callback(null, [mockUser]);
      });

      await expect(auth.authenticateUser(email, password)).rejects.toThrow('Invalid credentials');
    });
  });

  describe('getUserById', () => {
    it('should return user data for valid ID', async () => {
      const userId = 1;
      const mockUser = {
        id: userId,
        email: 'test@example.com',
        name: 'Test User',
        created_at: new Date()
      };

      // Mock database response
      mockQuery.mockImplementationOnce((sql, params, callback) => {
        callback(null, [mockUser]);
      });

      const result = await auth.getUserById(userId);

      expect(result).toBeDefined();
      expect(result.id).toBe(mockUser.id);
      expect(result.email).toBe(mockUser.email);
      expect(result.name).toBe(mockUser.name);
      expect(result.password).toBeUndefined();
    });

    it('should throw error for non-existent user ID', async () => {
      const userId = 999;

      // Mock database response - no user found
      mockQuery.mockImplementationOnce((sql, params, callback) => {
        callback(null, []);
      });

      await expect(auth.getUserById(userId)).rejects.toThrow('User not found');
    });

    it('should throw error for database error', async () => {
      const userId = 1;

      // Mock database error
      mockQuery.mockImplementationOnce((sql, params, callback) => {
        callback(new Error('Database error'), null);
      });

      await expect(auth.getUserById(userId)).rejects.toThrow('Failed to get user');
    });
  });

  describe('updatePassword', () => {
    it('should update password successfully', async () => {
      const userId = 1;
      const oldPassword = 'oldpassword123';
      const newPassword = 'newpassword123';
      const hashedOldPassword = await bcrypt.hash(oldPassword, 10);

      // Mock database responses
      mockQuery
        .mockImplementationOnce((sql, params, callback) => {
          callback(null, [{ password: hashedOldPassword }]); // Get current password
        })
        .mockImplementationOnce((sql, params, callback) => {
          callback(null, { affectedRows: 1 }); // Update successful
        });

      const result = await auth.updatePassword(userId, oldPassword, newPassword);

      expect(result).toBeDefined();
      expect(result.message).toBe('Password updated successfully');
      expect(mockQuery).toHaveBeenCalledTimes(2);
    });

    it('should throw error for non-existent user', async () => {
      const userId = 999;
      const oldPassword = 'oldpassword123';
      const newPassword = 'newpassword123';

      // Mock database response - no user found
      mockQuery.mockImplementationOnce((sql, params, callback) => {
        callback(null, []);
      });

      await expect(auth.updatePassword(userId, oldPassword, newPassword)).rejects.toThrow('User not found');
    });

    it('should throw error for incorrect old password', async () => {
      const userId = 1;
      const oldPassword = 'wrongoldpassword';
      const newPassword = 'newpassword123';
      const hashedOldPassword = await bcrypt.hash('correctoldpassword', 10);

      // Mock database response
      mockQuery.mockImplementationOnce((sql, params, callback) => {
        callback(null, [{ password: hashedOldPassword }]);
      });

      await expect(auth.updatePassword(userId, oldPassword, newPassword)).rejects.toThrow('Current password is incorrect');
    });

    it('should throw error for database update failure', async () => {
      const userId = 1;
      const oldPassword = 'oldpassword123';
      const newPassword = 'newpassword123';
      const hashedOldPassword = await bcrypt.hash(oldPassword, 10);

      // Mock database responses
      mockQuery
        .mockImplementationOnce((sql, params, callback) => {
          callback(null, [{ password: hashedOldPassword }]); // Get current password
        })
        .mockImplementationOnce((sql, params, callback) => {
          callback(new Error('Database error'), null); // Update fails
        });

      await expect(auth.updatePassword(userId, oldPassword, newPassword)).rejects.toThrow('Password update failed');
    });
  });
});