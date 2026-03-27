const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const UserBadge = sequelize.define('UserBadge', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    badgeId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

module.exports = UserBadge;
