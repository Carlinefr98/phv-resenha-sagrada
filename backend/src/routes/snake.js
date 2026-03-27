const express = require('express');
const { SnakeScore } = require('../models');
const router = express.Router();

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
        const existing = await SnakeScore.findOne({ where: { username } });
        if (existing) {
            if (score > existing.score) {
                existing.score = score;
                await existing.save();
                return res.json(existing);
            }
            return res.json(existing);
        }
        const newScore = await SnakeScore.create({ username, score });
        res.status(201).json(newScore);
    } catch (error) {
        res.status(500).json({ error: 'Failed to save score' });
    }
});

module.exports = router;
