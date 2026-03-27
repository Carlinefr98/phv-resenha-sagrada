const express = require('express');
const { Badge, User, UserBadge } = require('../models');
const router = express.Router();

// Get all badges
router.get('/', async (req, res) => {
    try {
        const badges = await Badge.findAll();
        res.json(badges);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get badges' });
    }
});

// Get badges for a user
router.get('/user/:username', async (req, res) => {
    try {
        const user = await User.findOne({ where: { username: req.params.username } });
        if (!user) return res.status(404).json({ error: 'User not found' });
        const badges = await user.getBadges();
        res.json(badges);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get user badges' });
    }
});

// Assign badge to user
router.post('/assign', async (req, res) => {
    try {
        const { username, badgeId } = req.body;
        const user = await User.findOne({ where: { username } });
        if (!user) return res.status(404).json({ error: 'User not found' });
        const existing = await UserBadge.findOne({ where: { userId: user.id, badgeId } });
        if (existing) return res.status(400).json({ error: 'Badge already assigned' });
        await UserBadge.create({ userId: user.id, badgeId });
        res.status(201).json({ message: 'Badge assigned' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to assign badge' });
    }
});

module.exports = router;
