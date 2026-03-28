const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const FlappyScore = sequelize.define('FlappyScore', {
    username: {
        type: DataTypes.STRING,
        allowNull: false
    },
    score: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    }
});

module.exports = FlappyScore;
