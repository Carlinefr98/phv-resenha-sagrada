const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');
const router = express.Router();

let upload;
let audioUpload;
if (process.env.CLOUDINARY_CLOUD_NAME) {
    const { storage: cloudStorage, audioStorage } = require('../cloudinary');
    upload = multer({ storage: cloudStorage });
    audioUpload = multer({ storage: audioStorage });
} else {
    const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
    const diskStorage = multer.diskStorage({
        destination: uploadsDir,
        filename: (req, file, cb) => {
            cb(null, 'boss-' + Date.now() + path.extname(file.originalname));
        }
    });
    upload = multer({ storage: diskStorage });
    audioUpload = multer({ storage: diskStorage });
}

// In-memory boss storage (persists until server restart, admin can re-upload)
let bosses = [
    { id: 1, name: 'Boss 1', imageUrl: null },
    { id: 2, name: 'Boss 2', imageUrl: null },
    { id: 3, name: 'Boss 3', imageUrl: null },
];

// Laura e Mariana game assets
let gameAssets = {
    lauraImg: null,
    marianaImg: null,
    musicUrl: null,
    flappyBirdImg: null,
};

// Get bosses
router.get('/bosses', (req, res) => {
    res.json(bosses);
});

// Get game assets (Laura e Mariana)
router.get('/assets', (req, res) => {
    res.json(gameAssets);
});

// Update boss image (admin only)
router.put('/bosses/:id', adminMiddleware, upload.single('image'), (req, res) => {
    const boss = bosses.find(b => b.id === parseInt(req.params.id));
    if (!boss) return res.status(404).json({ error: 'Boss not found' });

    if (req.body.name) boss.name = req.body.name;
    if (req.file) {
        boss.imageUrl = req.file.path && req.file.path.startsWith('http')
            ? req.file.path
            : (req.file.filename ? 'uploads/' + req.file.filename : req.file.path);
    }
    res.json(boss);
});

// Upload game asset (admin only) - laura, mariana, or music
router.put('/assets/:type', adminMiddleware, (req, res, next) => {
    const { type } = req.params;
    if (!['laura', 'mariana', 'music', 'flappybird'].includes(type)) {
        return res.status(400).json({ error: 'Invalid asset type' });
    }
    const uploader = type === 'music' ? audioUpload : upload;
    uploader.single('file')(req, res, (err) => {
        if (err) return res.status(500).json({ error: 'Upload failed' });
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

        const url = req.file.path && req.file.path.startsWith('http')
            ? req.file.path
            : (req.file.filename ? 'uploads/' + req.file.filename : req.file.path);

        if (type === 'laura') gameAssets.lauraImg = url;
        else if (type === 'mariana') gameAssets.marianaImg = url;
        else if (type === 'music') gameAssets.musicUrl = url;
        else if (type === 'flappybird') gameAssets.flappyBirdImg = url;

        res.json(gameAssets);
    });
});

module.exports = router;
