const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const EventParticipant = sequelize.define('EventParticipant', {
    eventId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

module.exports = EventParticipant;
