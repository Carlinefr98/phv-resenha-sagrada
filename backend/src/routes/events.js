const express = require('express');
const { Event, EventParticipant } = require('../models');
const router = express.Router();

// Get all events
router.get('/', async (req, res) => {
    try {
        const events = await Event.findAll({
            include: EventParticipant,
            order: [['date', 'ASC']]
        });
        res.json(events);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get events' });
    }
});

// Create event
router.post('/', async (req, res) => {
    try {
        const { name, description, date, createdBy } = req.body;
        const event = await Event.create({ name, description, date, createdBy });
        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create event' });
    }
});

// Confirm presence
router.post('/:eventId/participate', async (req, res) => {
    try {
        const { eventId } = req.params;
        const { username } = req.body;
        const existing = await EventParticipant.findOne({ where: { eventId, username } });
        if (existing) {
            return res.status(400).json({ error: 'Already participating' });
        }
        const participant = await EventParticipant.create({ eventId, username });
        res.status(201).json(participant);
    } catch (error) {
        res.status(500).json({ error: 'Failed to confirm presence' });
    }
});

// Cancel presence
router.delete('/:eventId/participate', async (req, res) => {
    try {
        const { eventId } = req.params;
        const { username } = req.body;
        await EventParticipant.destroy({ where: { eventId, username } });
        res.json({ message: 'Presence cancelled' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to cancel presence' });
    }
});

module.exports = router;
