const mysql = require('mysql');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'testdb'
};

const pool = mysql.createPool({
  ...dbConfig,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
});

function validateInput(input, operation = 'general') {
  const result = { isValid: true, errors: [] };
  
  if (input === null || input === undefined) {
    result.isValid = false;
    result.errors.push('Input cannot be null or undefined for ' + operation + ' operation');
    return result;
  }
  
  if (typeof input !== 'object' || Array.isArray(input)) {
    result.isValid = false;
    result.errors.push('Input must be a valid object for ' + operation + ' operation');
    return result;
  }
  
  switch (operation) {
    case 'create':
    case 'update':
      if (!input.name || typeof input.name !== 'string' || input.name.trim() === '') {
        result.isValid = false;
        result.errors.push('Name is required and must be a non-empty string');
      }
      if (input.email && (typeof input.email !== 'string' || !isValidEmail(input.email))) {
        result.isValid = false;
        result.errors.push('Email must be a valid email address');
      }
      break;
    case 'findById':
      if (!input.id || (typeof input.id !== 'number' && typeof input.id !== 'string')) {
        result.isValid = false;
        result.errors.push('ID is required and must be a number or string');
      }
      break;
  }
  
  return result;
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function executeQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    pool.query(query, params, (error, results) => {
      if (error) {
        console.error('Database query error:', error);
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}

async function createUser(userData) {
  try {
    const validation = validateInput(userData, 'create');
    if (!validation.isValid) {
      throw new Error('Validation failed: ' + validation.errors.join(', '));
    }

    const { name, email, phone, address } = userData;
    const query = 'INSERT INTO users (name, email, phone, address, created_at) VALUES (?, ?, ?, ?, NOW())';
    const params = [name, email || null, phone || null, address || null];

    const result = await executeQuery(query, params);
    
    return {
      id: result.insertId,
      name,
      email,
      phone,
      address,
      message: 'User created successfully'
    };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

async function getUserById(params) {
  try {
    let id;
    if (typeof params === 'object' && params !== null) {
      const validation = validateInput(params, 'findById');
      if (!validation.isValid) {
        throw new Error('Validation failed: ' + validation.errors.join(', '));
      }
      id = params.id;
    } else if (typeof params === 'number' || typeof params === 'string') {
      id = params;
    } else {
      throw new Error('Invalid input: ID must be provided as number, string, or in an object with id property');
    }

    if (!id) {
      throw new Error('User ID is required');
    }

    const query = 'SELECT * FROM users WHERE id = ?';
    const results = await executeQuery(query, [id]);

    if (results.length === 0) {
      throw new Error('User with ID ' + id + ' not found');
    }

    return results[0];
  } catch (error) {
    console.error('Error getting user by ID:', error);
    throw error;
  }
}

async function updateUser(userData) {
  try {
    const validation = validateInput(userData, 'update');
    if (!validation.isValid) {
      throw new Error('Validation failed: ' + validation.errors.join(', '));
    }

    if (!userData.id) {
      throw new Error('User ID is required for update operation');
    }

    await getUserById({ id: userData.id });

    const { id, name, email, phone, address } = userData;
    const query = 'UPDATE users SET name = ?, email = ?, phone = ?, address = ?, updated_at = NOW() WHERE id = ?';
    const params = [name, email || null, phone || null, address || null, id];

    await executeQuery(query, params);

    return {
      id,
      name,
      email,
      phone,
      address,
      message: 'User updated successfully'
    };
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

async function deleteUser(params) {
  try {
    let id;
    if (typeof params === 'object' && params !== null) {
      const validation = validateInput(params, 'findById');
      if (!validation.isValid) {
        throw new Error('Validation failed: ' + validation.errors.join(', '));
      }
      id = params.id;
    } else if (typeof params === 'number' || typeof params === 'string') {
      id = params;
    } else {
      throw new Error('Invalid input: ID must be provided as number, string, or in an object with id property');
    }

    if (!id) {
      throw new Error('User ID is required');
    }

    await getUserById({ id });

    const query = 'DELETE FROM users WHERE id = ?';
    await executeQuery(query, [id]);

    return {
      message: 'User with ID ' + id + ' deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

async function getAllUsers(options = {}) {
  try {
    if (options === null || options === undefined) {
      options = {};
    }

    if (typeof options !== 'object' || Array.isArray(options)) {
      throw new Error('Options must be a valid object');
    }

    let query = 'SELECT * FROM users';
    const params = [];

    if (options.limit && typeof options.limit === 'number' && options.limit > 0) {
      query += ' LIMIT ?';
      params.push(options.limit);
    }

    const results = await executeQuery(query, params);
    return results;
  } catch (error) {
    console.error('Error getting all users:', error);
    throw error;
  }
}

module.exports = {
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  getAllUsers,
  validateInput,
  isValidEmail
};
