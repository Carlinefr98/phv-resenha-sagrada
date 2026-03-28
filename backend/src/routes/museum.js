const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { MuseumEvent } = require('../models');
const adminMiddleware = require('../middleware/admin');
const router = express.Router();

let upload;
if (process.env.CLOUDINARY_CLOUD_NAME) {
    const { mixedStorage } = require('../cloudinary');
    upload = multer({ storage: mixedStorage });
} else {
    const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
    const diskStorage = multer.diskStorage({
        destination: uploadsDir,
        filename: (req, file, cb) => {
            cb(null, Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname));
        }
    });
    upload = multer({ storage: diskStorage });
}

// Get all museum events (timeline)
router.get('/', async (req, res) => {
    try {
        const events = await MuseumEvent.findAll({
            order: [['date', 'ASC']]
        });
        res.json(events);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get museum events' });
    }
});

// Create museum event (admin only, with image + audio upload)
router.post('/', adminMiddleware, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'audio', maxCount: 1 }]), async (req, res) => {
    try {
        const { title, description, date, videoUrl } = req.body;
        let imageUrl = req.body.imageUrl || null;
        let audioUrl = req.body.audioUrl || null;
        if (req.files && req.files.image && req.files.image[0]) {
            const f = req.files.image[0];
            imageUrl = f.path && f.path.startsWith('http') ? f.path : (f.filename ? 'uploads/' + f.filename : f.path);
        }
        if (req.files && req.files.audio && req.files.audio[0]) {
            const f = req.files.audio[0];
            audioUrl = f.path && f.path.startsWith('http') ? f.path : (f.filename ? 'uploads/' + f.filename : f.path);
        }
        const event = await MuseumEvent.create({ title, description, date, imageUrl, audioUrl, videoUrl: videoUrl || null });
        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create museum event' });
    }
});

// Delete museum event (admin only)
router.delete('/:id', adminMiddleware, async (req, res) => {
    try {
        const event = await MuseumEvent.findByPk(req.params.id);
        if (!event) return res.status(404).json({ error: 'Event not found' });
        await event.destroy();
        res.json({ message: 'Museum event deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete museum event' });
    }
});

module.exports = router;
