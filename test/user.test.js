// Mock the database module
jest.mock('../app/models/db.js', () => ({
  query: jest.fn()
}));

// Mock the promisify utility
const mockQuery = jest.fn();
jest.mock('util', () => ({
  promisify: jest.fn(() => mockQuery)
}));

const userController = require('../src/api/user.js');

describe('User API', () => {
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('User Controller', () => {
    it('should create a new user successfully', async () => {
      const mockUser = { email: 'test@example.com', name: 'Test User', active: true };
      const mockResult = { insertId: 1 };
      
      const req = { body: mockUser };
      const res = {
        send: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      mockQuery.mockResolvedValue(mockResult);

      await userController.create(req, res);

      expect(res.send).toHaveBeenCalledWith({ id: 1, ...mockUser });
      expect(mockQuery).toHaveBeenCalledWith(
        'INSERT INTO users SET ?',
        expect.objectContaining(mockUser)
      );
    });

    it('should return 400 if request body is empty', async () => {
      const req = { body: null };
      const res = {
        send: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      await userController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({ message: 'Content can not be empty!' });
    });

    it('should handle database errors when creating user', async () => {
      const mockUser = { email: 'test@example.com', name: 'Test User', active: true };
      const mockError = new Error('Database error');
      
      const req = { body: mockUser };
      const res = {
        send: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      mockQuery.mockRejectedValue(mockError);

      await userController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ message: 'Database error' });
    });
  });

  describe('findAll', () => {
    it('should retrieve all users successfully', async () => {
      const mockUsers = [
        { id: 1, email: 'user1@example.com', name: 'User 1', active: true },
        { id: 2, email: 'user2@example.com', name: 'User 2', active: false }
      ];

      const req = {};
      const res = {
        send: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      mockQuery.mockResolvedValue(mockUsers);

      await userController.findAll(req, res);

      expect(res.send).toHaveBeenCalledWith(mockUsers);
      expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM users');
    });

    it('should handle database errors', async () => {
      const mockError = new Error('Database error');

      const req = {};
      const res = {
        send: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      mockQuery.mockRejectedValue(mockError);

      await userController.findAll(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ message: 'Database error' });
    });
  });

  describe('findOne', () => {
    it('should retrieve a user by id successfully', async () => {
      const mockUser = { id: 1, email: 'test@example.com', name: 'Test User', active: true };

      const req = { params: { userId: '1' } };
      const res = {
        send: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      mockQuery.mockResolvedValue([mockUser]);

      await userController.findOne(req, res);

      expect(res.send).toHaveBeenCalledWith(mockUser);
      expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM users WHERE id = ?', ['1']);
    });

    it('should return 404 if user not found', async () => {
      const req = { params: { userId: '999' } };
      const res = {
        send: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      mockQuery.mockResolvedValue([]);

      await userController.findOne(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith({ message: 'Not found User with id 999.' });
    });
  });
});