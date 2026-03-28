const express = require('express');
const { SnakeScore, User, Badge, UserBadge } = require('../models');
const router = express.Router();

// Helper: award badge to user if not already assigned
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
    } catch (e) {
        console.error('Badge award error:', e);
        return null;
    }
}

// Get ranking (top 10)
router.get('/ranking', async (req, res) => {
    try {
        const scores = await SnakeScore.findAll({
            order: [['score', 'DESC']],
            limit: 10
        });
        res.json(scores);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get ranking' });
    }
});

// Save score
router.post('/', async (req, res) => {
    try {
        const { username, score } = req.body;
        let earnedBadge = null;
        const existing = await SnakeScore.findOne({ where: { username } });
        if (existing) {
            if (score > existing.score) {
                existing.score = score;
                await existing.save();
                if (score >= 100) {
                    earnedBadge = await tryAwardBadge(username, 'Rei do Snake');
                }
                return res.json({ score: existing, earnedBadge });
            }
            return res.json({ score: existing, earnedBadge: null });
        }
        const newScore = await SnakeScore.create({ username, score });
        if (score >= 100) {
            earnedBadge = await tryAwardBadge(username, 'Rei do Snake');
        }
        res.status(201).json({ score: newScore, earnedBadge });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save score' });
    }
});

module.exports = router;
