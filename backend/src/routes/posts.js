const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { cloudinary, storage: cloudStorage, mixedStorage } = require('../cloudinary');
const { Post, Image, Comment, Like, User, Badge, UserBadge } = require('../models');

const router = express.Router();

let upload;
if (process.env.CLOUDINARY_CLOUD_NAME) {
    // Production: use Cloudinary mixed storage (images + audio)
    upload = multer({ storage: mixedStorage });
} else {
    // Local: use disk storage
    const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const diskStorage = multer.diskStorage({
        destination: uploadsDir,
        filename: (req, file, cb) => {
            const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
            const ext = path.extname(file.originalname);
            cb(null, uniqueName + ext);
        }
    });
    upload = multer({ storage: diskStorage });
}

// Create a new post
router.post('/', upload.fields([{ name: 'images', maxCount: 5 }, { name: 'audio', maxCount: 1 }]), async (req, res) => {
    try {
        const { title, description, author, videoUrl } = req.body;
        const post = await Post.create({ title, description, author, videoUrl: videoUrl || null, audioUrl: null });

        // Handle image files
        const imageFiles = req.files && req.files['images'] ? req.files['images'] : [];
        if (imageFiles.length > 0) {
            const images = imageFiles.map(file => ({
                postId: post.id,
                url: file.path && file.path.startsWith('http') ? file.path : (file.filename ? 'uploads/' + file.filename : file.path)
            }));
            await Image.bulkCreate(images);
        }

        // Handle audio file
        const audioFiles = req.files && req.files['audio'] ? req.files['audio'] : [];
        if (audioFiles.length > 0) {
            const audioFile = audioFiles[0];
            post.audioUrl = audioFile.path && audioFile.path.startsWith('http') ? audioFile.path : (audioFile.filename ? 'uploads/' + audioFile.filename : audioFile.path);
            await post.save();
        }

        // Check "Fotógrafo Oficial" badge (10+ posts with photos)
        try {
            const user = await User.findOne({ where: { username: author } });
            if (user) {
                const postCount = await Post.count({ where: { author } });
                if (postCount >= 10) {
                    const badge = await Badge.findOne({ where: { name: 'Fotógrafo Oficial' } });
                    if (badge) {
                        const existing = await UserBadge.findOne({ where: { userId: user.id, badgeId: badge.id } });
                        if (!existing) {
                            await UserBadge.create({ userId: user.id, badgeId: badge.id });
                        }
                    }
                }
            }
        } catch (e) { console.error('Badge check error:', e); }

        const fullPost = await Post.findByPk(post.id, { include: Image });
        res.status(201).json(fullPost);
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ error: 'Failed to create post' });
    }
});

// Get all posts
router.get('/', async (req, res) => {
    try {
        const posts = await Post.findAll({
            include: [
                Image,
                { model: Comment, attributes: ['id'] },
                { model: Like, include: [{ model: User, attributes: ['id', 'username', 'profilePhoto'] }] }
            ],
            order: [['createdAt', 'DESC']]
        });
        // Get all users for author profile photos
        const users = await User.findAll({ attributes: ['username', 'profilePhoto'] });
        const userMap = {};
        users.forEach(u => { userMap[u.username] = u.profilePhoto; });

        const result = posts.map(p => {
            const pj = p.toJSON();
            pj.commentCount = pj.Comments ? pj.Comments.length : 0;
            pj.likeUsers = pj.Likes ? pj.Likes.map(l => l.User).filter(Boolean) : [];
            pj.likeCount = pj.Likes ? pj.Likes.length : 0;
            pj.authorPhoto = userMap[pj.author] || null;
            delete pj.Comments;
            delete pj.Likes;
            return pj;
        });
        res.json(result);
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