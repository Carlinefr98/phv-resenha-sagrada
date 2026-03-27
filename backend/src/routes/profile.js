const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { User, Badge, UserBadge } = require('../models');
const authMiddleware = require('../middleware/auth');
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
            cb(null, 'profile-' + Date.now() + path.extname(file.originalname));
        }
    });
    upload = multer({ storage: diskStorage });
}

const getZodiacSign = (birthday) => {
    if (!birthday) return null;
    const date = new Date(birthday + 'T00:00:00');
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const signs = [
        { name: 'Capricórnio', emoji: '♑', start: [12, 22], end: [1, 19] },
        { name: 'Aquário', emoji: '♒', start: [1, 20], end: [2, 18] },
        { name: 'Peixes', emoji: '♓', start: [2, 19], end: [3, 20] },
        { name: 'Áries', emoji: '♈', start: [3, 21], end: [4, 19] },
        { name: 'Touro', emoji: '♉', start: [4, 20], end: [5, 20] },
        { name: 'Gêmeos', emoji: '♊', start: [5, 21], end: [6, 20] },
        { name: 'Câncer', emoji: '♋', start: [6, 21], end: [7, 22] },
        { name: 'Leão', emoji: '♌', start: [7, 23], end: [8, 22] },
        { name: 'Virgem', emoji: '♍', start: [8, 23], end: [9, 22] },
        { name: 'Libra', emoji: '♎', start: [9, 23], end: [10, 22] },
        { name: 'Escorpião', emoji: '♏', start: [10, 23], end: [11, 21] },
        { name: 'Sagitário', emoji: '♐', start: [11, 22], end: [12, 21] },
    ];
    for (const sign of signs) {
        if (sign.name === 'Capricórnio') {
            if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return sign;
        } else {
            if ((month === sign.start[0] && day >= sign.start[1]) || (month === sign.end[0] && day <= sign.end[1])) return sign;
        }
    }
    return null;
};

// Get user profile
router.get('/:username', async (req, res) => {
    try {
        const user = await User.findOne({
            where: { username: req.params.username },
            attributes: ['id', 'username', 'profilePhoto', 'bio', 'birthday', 'createdAt']
        });
        if (!user) return res.status(404).json({ error: 'User not found' });
        const zodiac = getZodiacSign(user.birthday);
        res.json({ ...user.toJSON(), zodiac });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get profile' });
    }
});

// Update profile
router.put('/', authMiddleware, upload.single('profilePhoto'), async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const { bio, birthday } = req.body;
        if (bio !== undefined) user.bio = bio;
        if (birthday) user.birthday = birthday;
        if (req.file) {
            user.profilePhoto = req.file.path && req.file.path.startsWith('http') ? req.file.path : (req.file.filename ? 'uploads/' + req.file.filename : req.file.path);
        }
        await user.save();

        // Auto-assign zodiac badge
        if (user.birthday) {
            const zodiac = getZodiacSign(user.birthday);
            if (zodiac) {
                const [badge] = await Badge.findOrCreate({
                    where: { name: zodiac.name },
                    defaults: { name: zodiac.name, description: `Signo: ${zodiac.name}`, emoji: zodiac.emoji }
                });
                const existing = await UserBadge.findOne({ where: { userId: user.id, badgeId: badge.id } });
                if (!existing) await UserBadge.create({ userId: user.id, badgeId: badge.id });
            }
        }

        const zodiac = getZodiacSign(user.birthday);
        res.json({
            id: user.id, username: user.username, profilePhoto: user.profilePhoto,
            bio: user.bio, birthday: user.birthday, zodiac
        });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

module.exports = router;
