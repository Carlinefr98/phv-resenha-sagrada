const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const MuseumEvent = sequelize.define('MuseumEvent', {
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    imageUrl: {
        type: DataTypes.STRING,
        allowNull: true
    },
    audioUrl: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

module.exports = MuseumEvent;
