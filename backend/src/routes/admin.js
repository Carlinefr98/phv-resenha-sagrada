const express = require('express');
const bcrypt = require('bcryptjs');
const { User } = require('../models');
const adminMiddleware = require('../middleware/admin');
const router = express.Router();

// Get all users (admin only)
router.get('/users', adminMiddleware, async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'username', 'isAdmin', 'createdAt']
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get users' });
    }
});

// Create user (admin only)
router.post('/users', adminMiddleware, async (req, res) => {
    try {
        const { username, password, isAdmin } = req.body;
        const existing = await User.findOne({ where: { username } });
        if (existing) return res.status(400).json({ error: 'Username already exists' });
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ username, password: hashedPassword, isAdmin: isAdmin || false });
        res.status(201).json({ id: user.id, username: user.username, isAdmin: user.isAdmin });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create user' });
    }
});

// Delete user (admin only)
router.delete('/users/:id', adminMiddleware, async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        if (user.id === req.user.id) return res.status(400).json({ error: 'Cannot delete yourself' });
        await user.destroy();
        res.json({ message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// Delete any post (admin only)
router.delete('/posts/:id', adminMiddleware, async (req, res) => {
    try {
        const { Post } = require('../models');
        const post = await Post.findByPk(req.params.id);
        if (!post) return res.status(404).json({ error: 'Post not found' });
        await post.destroy();
        res.json({ message: 'Post deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete post' });
    }
});

module.exports = router;
