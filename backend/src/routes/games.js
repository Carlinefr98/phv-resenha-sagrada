const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');
const router = express.Router();

let upload;
if (process.env.CLOUDINARY_CLOUD_NAME) {
    const { storage: cloudStorage } = require('../cloudinary');
    upload = multer({ storage: cloudStorage });
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
}

// In-memory boss storage (persists until server restart, admin can re-upload)
let bosses = [
    { id: 1, name: 'Boss 1', imageUrl: null },
    { id: 2, name: 'Boss 2', imageUrl: null },
    { id: 3, name: 'Boss 3', imageUrl: null },
];

// Get bosses
router.get('/bosses', (req, res) => {
    res.json(bosses);
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

module.exports = router;
