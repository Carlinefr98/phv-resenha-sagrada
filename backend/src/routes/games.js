const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');
const { GameAsset, FlappyScore, InvaderScore, User, Badge, UserBadge } = require('../models');
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

// Helper: get asset from DB
async function getAsset(key) {
    const asset = await GameAsset.findOne({ where: { key } });
    return asset ? asset.value : null;
}

// Helper: set asset in DB
async function setAsset(key, value) {
    const [asset] = await GameAsset.findOrCreate({ where: { key }, defaults: { value } });
    if (asset.value !== value) {
        asset.value = value;
        await asset.save();
    }
}

// Helper: award badge
async function tryAwardBadge(username, badgeName) {
    try {
        const user = await User.findOne({ where: { username } });
        if (!user) return null;
        const badge = await Badge.findOne({ where: { name: badgeName } });
        if (!badge) return null;
        const existing = await UserBadge.findOne({ where: { userId: user.id, badgeId: badge.id } });
        if (existing) return null;
        await UserBadge.create({ userId: user.id, badgeId: badge.id });
        return badge;
    } catch (e) { console.error('Badge award error:', e); return null; }
}

// Get bosses (from DB)
router.get('/bosses', async (req, res) => {
    try {
        const bosses = [];
        for (let i = 1; i <= 3; i++) {
            bosses.push({
                id: i,
                name: await getAsset(`boss_${i}_name`) || `Boss ${i}`,
                imageUrl: await getAsset(`boss_${i}_image`) || null
            });
        }
        res.json(bosses);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get bosses' });
    }
});

// Get game assets (from DB)
router.get('/assets', async (req, res) => {
    try {
        const assets = {
            lauraImg: await getAsset('lauraImg'),
            marianaImg: await getAsset('marianaImg'),
            musicUrl: await getAsset('musicUrl'),
            flappyBirdImg: await getAsset('flappyBirdImg'),
            flappyPipeImg: await getAsset('flappyPipeImg'),
        };
        res.json(assets);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get assets' });
    }
});

// Update boss image (admin only)
router.put('/bosses/:id', adminMiddleware, upload.single('image'), async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (id < 1 || id > 3) return res.status(404).json({ error: 'Boss not found' });

        if (req.body.name) await setAsset(`boss_${id}_name`, req.body.name);
        if (req.file) {
            const url = req.file.path && req.file.path.startsWith('http')
                ? req.file.path
                : (req.file.filename ? 'uploads/' + req.file.filename : req.file.path);
            await setAsset(`boss_${id}_image`, url);
        }
        res.json({
            id,
            name: await getAsset(`boss_${id}_name`) || `Boss ${id}`,
            imageUrl: await getAsset(`boss_${id}_image`) || null
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update boss' });
    }
});

// Upload game asset (admin only)
router.put('/assets/:type', adminMiddleware, (req, res, next) => {
    const { type } = req.params;
    if (!['laura', 'mariana', 'music', 'flappybird', 'flappypipe'].includes(type)) {
        return res.status(400).json({ error: 'Invalid asset type' });
    }
    const uploader = type === 'music' ? audioUpload : upload;
    uploader.single('file')(req, res, async (err) => {
        if (err) return res.status(500).json({ error: 'Upload failed' });
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

        try {
            const url = req.file.path && req.file.path.startsWith('http')
                ? req.file.path
                : (req.file.filename ? 'uploads/' + req.file.filename : req.file.path);

            const keyMap = { laura: 'lauraImg', mariana: 'marianaImg', music: 'musicUrl', flappybird: 'flappyBirdImg', flappypipe: 'flappyPipeImg' };
            await setAsset(keyMap[type], url);

            const assets = {
                lauraImg: await getAsset('lauraImg'),
                marianaImg: await getAsset('marianaImg'),
                musicUrl: await getAsset('musicUrl'),
                flappyBirdImg: await getAsset('flappyBirdImg'),
                flappyPipeImg: await getAsset('flappyPipeImg'),
            };
            res.json(assets);
        } catch (error) {
            res.status(500).json({ error: 'Failed to save asset' });
        }
    });
});

// ===== FLAPPY CTPS SCORES =====
router.get('/flappy/ranking', async (req, res) => {
    try {
        const scores = await FlappyScore.findAll({ order: [['score', 'DESC']], limit: 10 });
        res.json(scores);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get ranking' });
    }
});

router.post('/flappy', async (req, res) => {
    try {
        const { username, score } = req.body;
        let earnedBadge = null;
        const existing = await FlappyScore.findOne({ where: { username } });
        if (existing) {
            if (score > existing.score) {
                existing.score = score;
                await existing.save();
                if (score >= 50) earnedBadge = await tryAwardBadge(username, 'Piloto de CTPS');
                return res.json({ score: existing, earnedBadge });
            }
            return res.json({ score: existing, earnedBadge: null });
        }
        const newScore = await FlappyScore.create({ username, score });
        if (score >= 50) earnedBadge = await tryAwardBadge(username, 'Piloto de CTPS');
        res.status(201).json({ score: newScore, earnedBadge });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save score' });
    }
});

// ===== SPACE INVADERS SCORES =====
router.get('/invaders/ranking', async (req, res) => {
    try {
        const scores = await InvaderScore.findAll({ order: [['score', 'DESC']], limit: 10 });
        res.json(scores);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get ranking' });
    }
});

router.post('/invaders', async (req, res) => {
    try {
        const { username, score } = req.body;
        let earnedBadge = null;
        const existing = await InvaderScore.findOne({ where: { username } });
        if (existing) {
            if (score > existing.score) {
                existing.score = score;
                await existing.save();
                if (score >= 300) earnedBadge = await tryAwardBadge(username, 'Destruidor Espacial');
                return res.json({ score: existing, earnedBadge });
            }
            return res.json({ score: existing, earnedBadge: null });
        }
        const newScore = await InvaderScore.create({ username, score });
        if (score >= 300) earnedBadge = await tryAwardBadge(username, 'Destruidor Espacial');
        res.status(201).json({ score: newScore, earnedBadge });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save score' });
    }
});

module.exports = router;
