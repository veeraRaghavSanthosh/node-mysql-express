const express = require('express');
const router = express.Router();

// Mock user data (in a real app, this would come from a database)
const users = [
    { id: 1, name: "John Doe", email: "john@example.com", active: true },
    { id: 2, name: "Jane Smith", email: "jane@example.com", active: true },
    { id: 3, name: "Bob Johnson", email: "bob@example.com", active: false }
];

// Validation helper functions
const validateRequestBody = (body) => {
    if (!body || typeof body !== 'object') {
        return { valid: false, message: 'Request body is required and must be a valid object' };
    }
    return { valid: true };
};

const validateString = (value, fieldName, required = true) => {
    if (required && (!value || typeof value !== 'string' || value.trim() === '')) {
        return { valid: false, message: `${fieldName} is required and must be a non-empty string` };
    }
    if (!required && value !== undefined && value !== null && (typeof value !== 'string' || value.trim() === '')) {
        return { valid: false, message: `${fieldName} must be a non-empty string if provided` };
    }
    return { valid: true };
};

const validateEmail = (email) => {
    if (!email || typeof email !== 'string' || !email.includes('@')) {
        return { valid: false, message: 'Email must be a valid email address' };
    }
    return { valid: true };
};

// Get all users
router.get('/', (req, res) => {
    try {
        res.json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Search users by name - Must come BEFORE /:id route to avoid conflicts
router.get('/search/:query', (req, res) => {
    try {
        // Validate query parameter
        if (!req.params.query || typeof req.params.query !== 'string') {
            return res.status(400).json({ 
                success: false, 
                message: 'Search query is required and must be a non-empty string' 
            });
        }
        
        const query = req.params.query.toLowerCase().trim();
        
        if (!query) {
            return res.status(400).json({ 
                success: false, 
                message: 'Search query cannot be empty or contain only whitespace' 
            });
        }
        
        const filteredUsers = users.filter(user => 
            user.name.toLowerCase().includes(query) || 
            user.email.toLowerCase().includes(query)
        );
        
        res.json({ success: true, data: filteredUsers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get user by ID
router.get('/:id', (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        
        // Validate ID parameter
        if (isNaN(userId) || userId <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid user ID' });
        }
        
        const user = users.find(u => u.id === userId);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Create new user - Fixed with proper validation
router.post('/', (req, res) => {
    try {
        // Express.json() converts null/undefined to {}, but we want to allow empty objects
        // and let field validation handle missing required fields
        if (!req.body || typeof req.body !== 'object') {
            return res.status(400).json({ 
                success: false, 
                message: 'Request body is required and must be a valid object' 
            });
        }

        const { name, email, active } = req.body;
        
        // Validate name field
        if (!name || typeof name !== 'string') {
            return res.status(400).json({ 
                success: false, 
                message: 'Name is required and must be a non-empty string' 
            });
        }
        
        const trimmedName = name.trim();
        if (!trimmedName) {
            return res.status(400).json({ 
                success: false, 
                message: 'Name cannot be empty or contain only whitespace' 
            });
        }
        
        // Validate email field
        const emailValidation = validateEmail(email);
        if (!emailValidation.valid) {
            return res.status(400).json({ success: false, message: emailValidation.message });
        }
        
        const lowerEmail = email.toLowerCase();
        
        // Check for duplicate email
        const existingUser = users.find(u => u.email === lowerEmail);
        if (existingUser) {
            return res.status(409).json({ 
                success: false, 
                message: 'User with this email already exists' 
            });
        }
        
        const newUser = {
            id: users.length + 1,
            name: trimmedName,
            email: lowerEmail,
            active: active !== undefined && active !== null ? Boolean(active) : true
        };
        
        users.push(newUser);
        res.status(201).json({ success: true, data: newUser });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update user - Fixed with proper validation
router.put('/:id', (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        
        // Validate ID parameter
        if (isNaN(userId) || userId <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid user ID' });
        }
        
        const userIndex = users.findIndex(u => u.id === userId);
        
        if (userIndex === -1) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        // Handle null/undefined body explicitly for PUT requests
        if (!req.body || typeof req.body !== 'object' || Object.keys(req.body).length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Request body is required and must be a valid object' 
            });
        }

        const { name, email, active } = req.body;
        
        // Validate optional fields with null/undefined checks
        if (name !== undefined && name !== null) {
            if (typeof name !== 'string') {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Name must be a string if provided' 
                });
            }
            
            const trimmedName = name.trim();
            if (!trimmedName) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Name cannot be empty or contain only whitespace' 
                });
            }
            users[userIndex].name = trimmedName;
        }
        
        if (email !== undefined && email !== null) {
            const emailValidation = validateEmail(email);
            if (!emailValidation.valid) {
                return res.status(400).json({ success: false, message: emailValidation.message });
            }
            
            const lowerEmail = email.toLowerCase();
            
            // Check for duplicate email (excluding current user)
            const existingUser = users.find(u => u.email === lowerEmail && u.id !== userId);
            if (existingUser) {
                return res.status(409).json({ 
                    success: false, 
                    message: 'User with this email already exists' 
                });
            }
            
            users[userIndex].email = lowerEmail;
        }
        
        if (active !== undefined && active !== null) {
            users[userIndex].active = Boolean(active);
        }
        
        res.json({ success: true, data: users[userIndex] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Delete user
router.delete('/:id', (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        
        // Validate ID parameter
        if (isNaN(userId) || userId <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid user ID' });
        }
        
        const userIndex = users.findIndex(u => u.id === userId);
        
        if (userIndex === -1) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        const deletedUser = users.splice(userIndex, 1)[0];
        res.json({ success: true, data: deletedUser });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;