const express = require('express');
const router = express.Router();

// Mock user data (in a real app, this would come from a database)
const users = [
    { id: 1, name: "test3", email: "test3@example.com" },
    { id: 2, name: "test4", email: "test4@example.com" }
];

/**
 * Input validation helper function
 * @param {any} input - Input to validate
 * @param {string} fieldName - Name of the field for error messages
 * @returns {boolean} - True if valid, throws error if invalid
 */
function validateInput(input, fieldName = 'input') {
    if (input === null) {
        throw new TypeError(`${fieldName} cannot be null`);
    }
    if (input === undefined) {
        throw new TypeError(`${fieldName} cannot be undefined`);
    }
    return true;
}

/**
 * Validate user object
 * @param {Object} user - User object to validate
 * @returns {boolean} - True if valid, throws error if invalid
 */
function validateUser(user) {
    validateInput(user, 'user');
    
    if (typeof user !== 'object') {
        throw new TypeError('user must be an object');
    }
    
    if (user.name !== undefined) {
        validateInput(user.name, 'user.name');
        if (typeof user.name !== 'string' || user.name.trim() === '') {
            throw new TypeError('user.name must be a non-empty string');
        }
    }
    
    if (user.email !== undefined) {
        validateInput(user.email, 'user.email');
        if (typeof user.email !== 'string' || user.email.trim() === '') {
            throw new TypeError('user.email must be a non-empty string');
        }
    }
    
    return true;
}

/**
 * Get all users
 */
router.get('/', (req, res) => {
    try {
        res.json({ success: true, users: users });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * Get user by ID
 */
router.get('/:id', (req, res) => {
    try {
        const id = req.params.id;
        validateInput(id, 'id');
        
        const userId = parseInt(id, 10);
        if (isNaN(userId)) {
            return res.status(400).json({ success: false, error: 'Invalid user ID' });
        }
        
        const user = users.find(u => u.id === userId);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        
        res.json({ success: true, user: user });
    } catch (error) {
        if (error instanceof TypeError) {
            res.status(400).json({ success: false, error: error.message });
        } else {
            res.status(500).json({ success: false, error: 'Internal server error' });
        }
    }
});

/**
 * Create a new user
 */
router.post('/', (req, res) => {
    try {
        const userData = req.body;
        validateUser(userData);
        
        const newUser = {
            id: users.length + 1,
            name: userData.name,
            email: userData.email
        };
        
        users.push(newUser);
        res.status(201).json({ success: true, user: newUser });
    } catch (error) {
        if (error instanceof TypeError) {
            res.status(400).json({ success: false, error: error.message });
        } else {
            res.status(500).json({ success: false, error: 'Internal server error' });
        }
    }
});

/**
 * Update user by ID
 */
router.put('/:id', (req, res) => {
    try {
        const id = req.params.id;
        const userData = req.body;
        
        validateInput(id, 'id');
        validateUser(userData);
        
        const userId = parseInt(id, 10);
        if (isNaN(userId)) {
            return res.status(400).json({ success: false, error: 'Invalid user ID' });
        }
        
        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex === -1) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        
        // Update user (maintain backward compatibility by only updating provided fields)
        if (userData.name !== undefined) {
            users[userIndex].name = userData.name;
        }
        if (userData.email !== undefined) {
            users[userIndex].email = userData.email;
        }
        
        res.json({ success: true, user: users[userIndex] });
    } catch (error) {
        if (error instanceof TypeError) {
            res.status(400).json({ success: false, error: error.message });
        } else {
            res.status(500).json({ success: false, error: 'Internal server error' });
        }
    }
});

/**
 * Delete user by ID
 */
router.delete('/:id', (req, res) => {
    try {
        const id = req.params.id;
        validateInput(id, 'id');
        
        const userId = parseInt(id, 10);
        if (isNaN(userId)) {
            return res.status(400).json({ success: false, error: 'Invalid user ID' });
        }
        
        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex === -1) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        
        const deletedUser = users.splice(userIndex, 1)[0];
        res.json({ success: true, message: 'User deleted successfully', user: deletedUser });
    } catch (error) {
        if (error instanceof TypeError) {
            res.status(400).json({ success: false, error: error.message });
        } else {
            res.status(500).json({ success: false, error: 'Internal server error' });
        }
    }
});

module.exports = router;