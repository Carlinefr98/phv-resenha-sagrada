const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const GameAsset = sequelize.define('GameAsset', {
    key: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    value: {
        type: DataTypes.TEXT,
        allowNull: true
    }
});

module.exports = GameAsset;
