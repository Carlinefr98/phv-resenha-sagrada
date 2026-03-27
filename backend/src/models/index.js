const sequelize = require('../database');
const User = require('./User');
const Post = require('./Post');
const Image = require('./Image');
const Comment = require('./Comment');
const Like = require('./Like');

// Associations
Post.hasMany(Image, { foreignKey: 'postId', onDelete: 'CASCADE' });
Image.belongsTo(Post, { foreignKey: 'postId' });

Post.hasMany(Comment, { foreignKey: 'postId', onDelete: 'CASCADE' });
Comment.belongsTo(Post, { foreignKey: 'postId' });

Post.hasMany(Like, { foreignKey: 'postId', onDelete: 'CASCADE' });
Like.belongsTo(Post, { foreignKey: 'postId' });

User.hasMany(Post, { foreignKey: 'authorId' });
Post.belongsTo(User, { foreignKey: 'authorId' });

User.hasMany(Comment, { foreignKey: 'userId' });
Comment.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Like, { foreignKey: 'userId' });
Like.belongsTo(User, { foreignKey: 'userId' });

module.exports = { sequelize, User, Post, Image, Comment, Like };
