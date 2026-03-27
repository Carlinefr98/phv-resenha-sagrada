const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Image = sequelize.define('Image', {
    url: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

module.exports = Image;
