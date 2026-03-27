const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Post = sequelize.define('Post', {
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    author: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

module.exports = Post;
