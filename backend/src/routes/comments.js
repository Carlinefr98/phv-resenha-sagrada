const express = require('express');
const router = express.Router();
const { Comment } = require('../models');

// Get comments for a specific post
router.get('/:postId', async (req, res) => {
    const { postId } = req.params;
    try {
        const comments = await Comment.findAll({ where: { postId } });
        res.json(comments);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve comments' });
    }
});

// Add a new comment to a post
router.post('/:postId', async (req, res) => {
    const { postId } = req.params;
    const { author, content } = req.body;
    try {
        const comment = await Comment.create({ postId, author, content });
        res.status(201).json(comment);
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