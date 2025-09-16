const assert = require('assert');
const sinon = require('sinon');

// Mock mysql module
const mockMysql = {
  createPool: sinon.stub().returns({
    query: sinon.stub()
  })
};

// Mock the mysql module before requiring user.js
require.cache[require.resolve('mysql')] = {
  exports: mockMysql
};

const userModule = require('../src/api/user');

describe('User API Module', function() {
  let mockPool;
  
  beforeEach(function() {
    mockPool = {
      query: sinon.stub()
    };
    mockMysql.createPool.returns(mockPool);
  });

  afterEach(function() {
    sinon.restore();
  });

  describe('validateInput', function() {
    it('should reject null input', function() {
      const result = userModule.validateInput(null, 'create');
      assert.strictEqual(result.isValid, false);
      assert(result.errors.includes('Input cannot be null or undefined for create operation'));
    });

    it('should reject undefined input', function() {
      const result = userModule.validateInput(undefined, 'create');
      assert.strictEqual(result.isValid, false);
      assert(result.errors.includes('Input cannot be null or undefined for create operation'));
    });

    it('should reject non-object input', function() {
      const result = userModule.validateInput('string', 'create');
      assert.strictEqual(result.isValid, false);
      assert(result.errors.includes('Input must be a valid object for create operation'));
    });

    it('should reject array input', function() {
      const result = userModule.validateInput([], 'create');
      assert.strictEqual(result.isValid, false);
      assert(result.errors.includes('Input must be a valid object for create operation'));
    });

    it('should validate create operation with valid input', function() {
      const result = userModule.validateInput({ name: 'John Doe', email: 'john@example.com' }, 'create');
      assert.strictEqual(result.isValid, true);
      assert.strictEqual(result.errors.length, 0);
    });

    it('should reject create operation without name', function() {
      const result = userModule.validateInput({ email: 'john@example.com' }, 'create');
      assert.strictEqual(result.isValid, false);
      assert(result.errors.includes('Name is required and must be a non-empty string'));
    });

    it('should reject create operation with empty name', function() {
      const result = userModule.validateInput({ name: '   ', email: 'john@example.com' }, 'create');
      assert.strictEqual(result.isValid, false);
      assert(result.errors.includes('Name is required and must be a non-empty string'));
    });

    it('should reject invalid email format', function() {
      const result = userModule.validateInput({ name: 'John Doe', email: 'invalid-email' }, 'create');
      assert.strictEqual(result.isValid, false);
      assert(result.errors.includes('Email must be a valid email address'));
    });

    it('should validate findById operation with valid input', function() {
      const result = userModule.validateInput({ id: 1 }, 'findById');
      assert.strictEqual(result.isValid, true);
      assert.strictEqual(result.errors.length, 0);
    });

    it('should reject findById operation without id', function() {
      const result = userModule.validateInput({}, 'findById');
      assert.strictEqual(result.isValid, false);
      assert(result.errors.includes('ID is required and must be a number or string'));
    });
  });

  describe('isValidEmail', function() {
    it('should validate correct email format', function() {
      assert.strictEqual(userModule.isValidEmail('test@example.com'), true);
      assert.strictEqual(userModule.isValidEmail('user.name@domain.co.uk'), true);
    });

    it('should reject invalid email format', function() {
      assert.strictEqual(userModule.isValidEmail('invalid-email'), false);
      assert.strictEqual(userModule.isValidEmail('test@'), false);
      assert.strictEqual(userModule.isValidEmail('@example.com'), false);
      assert.strictEqual(userModule.isValidEmail('test.example.com'), false);
    });
  });

  describe('createUser', function() {
    it('should throw error for null input', async function() {
      try {
        await userModule.createUser(null);
        assert.fail('Should have thrown an error');
      } catch (error) {
        assert(error.message.includes('Input cannot be null or undefined'));
      }
    });

    it('should throw error for undefined input', async function() {
      try {
        await userModule.createUser(undefined);
        assert.fail('Should have thrown an error');
      } catch (error) {
        assert(error.message.includes('Input cannot be null or undefined'));
      }
    });

    it('should throw error for invalid input type', async function() {
      try {
        await userModule.createUser('invalid');
        assert.fail('Should have thrown an error');
      } catch (error) {
        assert(error.message.includes('Input must be a valid object'));
      }
    });

    it('should create user with valid data', async function() {
      const userData = { name: 'John Doe', email: 'john@example.com' };
      const mockResult = { insertId: 1 };
      
      mockPool.query.callsArgWith(2, null, mockResult);

      const result = await userModule.createUser(userData);
      
      assert.strictEqual(result.id, 1);
      assert.strictEqual(result.name, 'John Doe');
      assert.strictEqual(result.email, 'john@example.com');
      assert.strictEqual(result.message, 'User created successfully');
    });
  });

  describe('getUserById', function() {
    it('should throw error for null input', async function() {
      try {
        await userModule.getUserById(null);
        assert.fail('Should have thrown an error');
      } catch (error) {
        assert(error.message.includes('Invalid input'));
      }
    });

    it('should throw error for undefined input', async function() {
      try {
        await userModule.getUserById(undefined);
        assert.fail('Should have thrown an error');
      } catch (error) {
        assert(error.message.includes('Invalid input'));
      }
    });

    it('should handle backward compatibility with direct ID parameter', async function() {
      const mockUser = { id: 1, name: 'John Doe' };
      mockPool.query.callsArgWith(2, null, [mockUser]);

      const result = await userModule.getUserById(1);
      assert.deepStrictEqual(result, mockUser);
    });

    it('should handle object parameter with ID', async function() {
      const mockUser = { id: 1, name: 'John Doe' };
      mockPool.query.callsArgWith(2, null, [mockUser]);

      const result = await userModule.getUserById({ id: 1 });
      assert.deepStrictEqual(result, mockUser);
    });

    it('should throw error when user not found', async function() {
      mockPool.query.callsArgWith(2, null, []);

      try {
        await userModule.getUserById(999);
        assert.fail('Should have thrown an error');
      } catch (error) {
        assert(error.message.includes('User with ID 999 not found'));
      }
    });
  });

  describe('updateUser', function() {
    it('should throw error for null input', async function() {
      try {
        await userModule.updateUser(null);
        assert.fail('Should have thrown an error');
      } catch (error) {
        assert(error.message.includes('Input cannot be null or undefined'));
      }
    });

    it('should throw error when ID is missing', async function() {
      try {
        await userModule.updateUser({ name: 'John Doe' });
        assert.fail('Should have thrown an error');
      } catch (error) {
        assert(error.message.includes('User ID is required for update operation'));
      }
    });
  });

  describe('deleteUser', function() {
    it('should throw error for null input', async function() {
      try {
        await userModule.deleteUser(null);
        assert.fail('Should have thrown an error');
      } catch (error) {
        assert(error.message.includes('Invalid input'));
      }
    });

    it('should handle backward compatibility with direct ID parameter', async function() {
      const mockUser = { id: 1, name: 'John Doe' };
      mockPool.query.onFirstCall().callsArgWith(2, null, [mockUser]);
      mockPool.query.onSecondCall().callsArgWith(2, null, { affectedRows: 1 });

      const result = await userModule.deleteUser(1);
      assert(result.message.includes('User with ID 1 deleted successfully'));
    });
  });

  describe('getAllUsers', function() {
    it('should handle null options', async function() {
      const mockUsers = [{ id: 1, name: 'John' }];
      mockPool.query.callsArgWith(2, null, mockUsers);

      const result = await userModule.getAllUsers(null);
      assert.deepStrictEqual(result, mockUsers);
    });

    it('should handle undefined options', async function() {
      const mockUsers = [{ id: 1, name: 'John' }];
      mockPool.query.callsArgWith(2, null, mockUsers);

      const result = await userModule.getAllUsers(undefined);
      assert.deepStrictEqual(result, mockUsers);
    });

    it('should throw error for invalid options type', async function() {
      try {
        await userModule.getAllUsers('invalid');
        assert.fail('Should have thrown an error');
      } catch (error) {
        assert(error.message.includes('Options must be a valid object'));
      }
    });

    it('should handle limit option', async function() {
      const mockUsers = [{ id: 1, name: 'John' }];
      mockPool.query.callsArgWith(2, null, mockUsers);

      const result = await userModule.getAllUsers({ limit: 10 });
      assert.deepStrictEqual(result, mockUsers);
    });
  });
});
