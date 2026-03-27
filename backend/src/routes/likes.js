const express = require('express');
const router = express.Router();
const { Like } = require('../models');

// Route to like a post
router.post('/:postId/like', async (req, res) => {
    const { userId } = req.body;
    const postId = req.params.postId;

    try {
        const existing = await Like.findOne({ where: { postId, userId } });
        if (existing) {
            return res.status(400).json({ message: 'Already liked' });
        }
        const like = await Like.create({ postId, userId });
        res.status(201).json({ message: 'Post liked', likeId: like.id });
    } catch (error) {
        res.status(500).json({ error: 'Failed to like post' });
    }
});

// Route to unlike a post
router.delete('/:postId/unlike', async (req, res) => {
    const { userId } = req.body;
    const postId = req.params.postId;

    try {
        await Like.destroy({ where: { postId, userId } });
        res.status(200).json({ message: 'Post unliked' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to unlike post' });
    }
});

// Route to get likes for a post
router.get('/:postId/likes', async (req, res) => {
    const postId = req.params.postId;

    try {
        const likes = await Like.findAll({ where: { postId } });
        res.status(200).json(likes);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve likes' });
    }
});

module.exports = router;