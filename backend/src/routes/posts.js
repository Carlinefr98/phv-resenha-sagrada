const express = require('express');
const multer = require('multer');
const path = require('path');
const { Post, Image } = require('../models');

const router = express.Router();

const storage = multer.diskStorage({
    destination: path.join(__dirname, '..', '..', 'uploads'),
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, uniqueName + ext);
    }
});
const upload = multer({ storage });

// Create a new post
router.post('/', upload.array('images', 5), async (req, res) => {
    try {
        const { title, description, author } = req.body;
        const post = await Post.create({ title, description, author });

        if (req.files) {
            const images = req.files.map(file => ({
                postId: post.id,
                url: 'uploads/' + file.filename
            }));
            await Image.bulkCreate(images);
        }

        res.status(201).json(post);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create post' });
    }
});

// Get all posts
router.get('/', async (req, res) => {
    try {
        const posts = await Post.findAll({ include: Image });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve posts' });
    }
});

// Get a single post by ID
router.get('/:id', async (req, res) => {
    try {
        const post = await Post.findByPk(req.params.id, { include: Image });
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        res.json(post);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve post' });
    }
});

// Update a post
router.put('/:id', async (req, res) => {
    try {
        const { title, description } = req.body;
        const post = await Post.findByPk(req.params.id);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        post.title = title;
        post.description = description;
        await post.save();
        res.json(post);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update post' });
    }
});

// Delete a post
router.delete('/:id', async (req, res) => {
    try {
        const post = await Post.findByPk(req.params.id);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        await post.destroy();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete post' });
    }
});

module.exports = router;