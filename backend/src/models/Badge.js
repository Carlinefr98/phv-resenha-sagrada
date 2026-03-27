const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Badge = sequelize.define('Badge', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true
    },
    emoji: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

module.exports = Badge;
