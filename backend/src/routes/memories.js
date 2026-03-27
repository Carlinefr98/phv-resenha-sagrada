const express = require('express');
const { Op } = require('sequelize');
const { Post, Image } = require('../models');
const router = express.Router();

// Get memories (posts from same day/month in previous years)
router.get('/', async (req, res) => {
    try {
        const now = new Date();
        const month = now.getMonth() + 1;
        const day = now.getDate();
        const currentYear = now.getFullYear();

        const allPosts = await Post.findAll({ include: Image, order: [['createdAt', 'DESC']] });

        const memories = allPosts.filter(post => {
            const postDate = new Date(post.createdAt);
            return postDate.getMonth() + 1 === month &&
                   postDate.getDate() === day &&
                   postDate.getFullYear() < currentYear;
        });

        res.json(memories);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get memories' });
    }
});

module.exports = router;
