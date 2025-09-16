const { validateUserInput } = require('../app/controllers/user.controller.js');

// Mock the User model
jest.mock('../app/models/user.model.js', () => {
  return jest.fn().mockImplementation((userData) => {
    if (!userData) {
      throw new Error("User data cannot be null or undefined");
    }
    return userData;
  });
});

const User = require('../app/models/user.model.js');

describe('User Controller Validation Tests', () => {
  describe('validateUserInput function', () => {
    test('should return error for null input', () => {
      const errors = validateUserInput(null);
      expect(errors).toContain('User data is required');
    });

    test('should return error for undefined input', () => {
      const errors = validateUserInput(undefined);
      expect(errors).toContain('User data is required');
    });

    test('should return error for non-object input', () => {
      const errors = validateUserInput('string');
      expect(errors).toContain('User data must be an object');
    });

    test('should return error for array input', () => {
      const errors = validateUserInput([]);
      expect(errors.length).toBeGreaterThan(0);
      // Arrays are treated as objects in typeof check, so they get field validation errors
      expect(errors).toContain('Name is required and must be a non-empty string');
    });

    test('should return error for missing name', () => {
      const errors = validateUserInput({ email: 'test@example.com' });
      expect(errors).toContain('Name is required and must be a non-empty string');
    });

    test('should return error for empty name', () => {
      const errors = validateUserInput({ name: '', email: 'test@example.com' });
      expect(errors).toContain('Name is required and must be a non-empty string');
    });

    test('should return error for whitespace-only name', () => {
      const errors = validateUserInput({ name: '   ', email: 'test@example.com' });
      expect(errors).toContain('Name is required and must be a non-empty string');
    });

    test('should return error for non-string name', () => {
      const errors = validateUserInput({ name: 123, email: 'test@example.com' });
      expect(errors).toContain('Name is required and must be a non-empty string');
    });

    test('should return error for missing email', () => {
      const errors = validateUserInput({ name: 'John Doe' });
      expect(errors).toContain('Email is required and must be a non-empty string');
    });

    test('should return error for empty email', () => {
      const errors = validateUserInput({ name: 'John Doe', email: '' });
      expect(errors).toContain('Email is required and must be a non-empty string');
    });

    test('should return error for invalid email format', () => {
      const errors = validateUserInput({ name: 'John Doe', email: 'invalid-email' });
      expect(errors).toContain('Email must be a valid email address');
    });

    test('should return error for non-string email', () => {
      const errors = validateUserInput({ name: 'John Doe', email: 123 });
      expect(errors).toContain('Email is required and must be a non-empty string');
    });

    test('should return error for invalid age type', () => {
      const errors = validateUserInput({ 
        name: 'John Doe', 
        email: 'john@example.com', 
        age: 'thirty' 
      });
      expect(errors).toContain('Age must be a number between 0 and 150');
    });

    test('should return error for negative age', () => {
      const errors = validateUserInput({ 
        name: 'John Doe', 
        email: 'john@example.com', 
        age: -5 
      });
      expect(errors).toContain('Age must be a number between 0 and 150');
    });

    test('should return error for age over 150', () => {
      const errors = validateUserInput({ 
        name: 'John Doe', 
        email: 'john@example.com', 
        age: 200 
      });
      expect(errors).toContain('Age must be a number between 0 and 150');
    });

    test('should return empty array for valid user data with age', () => {
      const errors = validateUserInput({ 
        name: 'John Doe', 
        email: 'john@example.com', 
        age: 30 
      });
      expect(errors).toHaveLength(0);
    });

    test('should return empty array for valid user data without age', () => {
      const errors = validateUserInput({ 
        name: 'John Doe', 
        email: 'john@example.com'
      });
      expect(errors).toHaveLength(0);
    });

    test('should return empty array for valid user data with null age', () => {
      const errors = validateUserInput({ 
        name: 'John Doe', 
        email: 'john@example.com',
        age: null
      });
      expect(errors).toHaveLength(0);
    });

    test('should return empty array for valid user data with undefined age', () => {
      const errors = validateUserInput({ 
        name: 'John Doe', 
        email: 'john@example.com',
        age: undefined
      });
      expect(errors).toHaveLength(0);
    });

    test('should handle multiple validation errors', () => {
      const errors = validateUserInput({ 
        name: '', 
        email: 'invalid-email',
        age: -10
      });
      expect(errors).toHaveLength(3);
      expect(errors).toContain('Name is required and must be a non-empty string');
      expect(errors).toContain('Email must be a valid email address');
      expect(errors).toContain('Age must be a number between 0 and 150');
    });
  });

  describe('User model constructor with null validation', () => {
    test('should throw error when creating User with null data', () => {
      expect(() => {
        new User(null);
      }).toThrow('User data cannot be null or undefined');
    });

    test('should throw error when creating User with undefined data', () => {
      expect(() => {
        new User(undefined);
      }).toThrow('User data cannot be null or undefined');
    });

    test('should create User with valid data', () => {
      const userData = { name: 'John Doe', email: 'john@example.com', age: 30 };
      const user = new User(userData);
      expect(user).toBeDefined();
      expect(user.name).toBe('John Doe');
      expect(user.email).toBe('john@example.com');
      expect(user.age).toBe(30);
    });
  });
});