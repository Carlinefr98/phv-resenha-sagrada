const express = require('express');
const { MuseumEvent } = require('../models');
const router = express.Router();

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

// Create museum event
router.post('/', async (req, res) => {
    try {
        const { title, description, date, imageUrl } = req.body;
        const event = await MuseumEvent.create({ title, description, date, imageUrl });
        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create museum event' });
    }
});

module.exports = router;
