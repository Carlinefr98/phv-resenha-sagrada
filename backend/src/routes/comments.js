const express = require('express');
const router = express.Router();
const { Comment, User } = require('../models');
const authMiddleware = require('../middleware/auth');

// Get comments for a specific post (with user info)
router.get('/:postId', async (req, res) => {
    const { postId } = req.params;
    try {
        const comments = await Comment.findAll({
            where: { postId },
            include: [{ model: User, attributes: ['id', 'username', 'profilePhoto'] }]
        });
        res.json(comments);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve comments' });
    }
});

// Add a new comment to a post (auth required)
router.post('/:postId', authMiddleware, async (req, res) => {
    const { postId } = req.params;
    const { author, content } = req.body;
    try {
        const comment = await Comment.create({ postId, author, content, userId: req.user.id });
        const full = await Comment.findByPk(comment.id, {
            include: [{ model: User, attributes: ['id', 'username', 'profilePhoto'] }]
        });
        res.status(201).json(full);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add comment' });
    }
});

// Delete a comment
router.delete('/:commentId', async (req, res) => {
    const { commentId } = req.params;
    try {
        await Comment.destroy({ where: { id: commentId } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete comment' });
    }
});

module.exports = router;