const express = require('express');
const authenticateToken = require('../auth');
const {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
} = require('../database');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET all users
router.get('/', async (req, res) => {
    try {
        const users = await getAllUsers();
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET single user
router.get('/:id', async (req, res) => {
    try {
        const user = await getUserById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST create user
router.post('/', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validation
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Username, email, and password are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        const user = await createUser({ username, email, password });
        res.status(201).json(user);
    } catch (error) {
        console.error('Error creating user:', error);
        if (error.message.includes('already exists')) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT update user
router.put('/:id', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validation
        if (!username || !email) {
            return res.status(400).json({ error: 'Username and email are required' });
        }

        if (password && password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        const user = await updateUser(req.params.id, { username, email, password });
        res.json(user);
    } catch (error) {
        console.error('Error updating user:', error);
        if (error.message === 'User not found') {
            return res.status(404).json({ error: error.message });
        }
        if (error.message.includes('already exists')) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE user
router.delete('/:id', async (req, res) => {
    try {
        await deleteUser(req.params.id);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        if (error.message === 'User not found') {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;

