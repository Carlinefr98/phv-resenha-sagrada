const { sequelize, Post, Image, Comment, User } = require('./models');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
    await sequelize.sync({ force: true });

    const hashedPassword = await bcrypt.hash('senha123', 10);
    const users = [
        { username: 'Bruno', password: hashedPassword },
        { username: 'Ks', password: hashedPassword },
        { username: 'Laura', password: hashedPassword },
        { username: 'Julia', password: hashedPassword },
        { username: 'Mariana', password: hashedPassword },
        { username: 'Danny', password: hashedPassword },
        { username: 'Jady', password: hashedPassword },
        { username: 'Carlinhos', password: hashedPassword },
    ];

    const createdUsers = await User.bulkCreate(users);

    const posts = [
        {
            title: 'Retiro PHV 2025',
            description: 'Um retiro incrível para fortalecer nossa fé!',
            author: 'Bruno',
        },
        {
            title: 'Corrida do MAC',
            description: 'Vamos correr juntos e nos divertir!',
            author: 'Ks',
        },
        {
            title: 'Pós-missa',
            description: 'Um momento de descontração após a missa.',
            author: 'Laura',
        },
    ];

    const createdPosts = await Post.bulkCreate(posts);

    const images = [
        { postId: createdPosts[0].id, url: 'https://picsum.photos/seed/retiro1/800/600' },
        { postId: createdPosts[0].id, url: 'https://picsum.photos/seed/retiro2/800/600' },
        { postId: createdPosts[1].id, url: 'https://picsum.photos/seed/corrida1/800/600' },
        { postId: createdPosts[2].id, url: 'https://picsum.photos/seed/missa1/800/600' },
    ];

    await Image.bulkCreate(images);

    const comments = [
        { postId: createdPosts[0].id, author: 'Ks', content: 'Mal posso esperar!' },
        { postId: createdPosts[1].id, author: 'Laura', content: 'Isso vai ser divertido!' },
        { postId: createdPosts[2].id, author: 'Julia', content: 'Adoro esses momentos!' },
    ];

    await Comment.bulkCreate(comments);

    console.log('Banco de dados populado com dados iniciais!');
};

seedDatabase().catch(console.error);