const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const InvaderScore = sequelize.define('InvaderScore', {
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

module.exports = InvaderScore;
