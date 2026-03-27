const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Like = sequelize.define('Like', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

module.exports = Like;
