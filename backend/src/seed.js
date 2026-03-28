const { sequelize, Post, Image, Comment, User, Badge, MuseumEvent } = require('./models');
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
        { username: 'Carlinhos', password: hashedPassword, isAdmin: true },
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

    // Badges
    const badges = [
        { name: 'Santo do Rolê', description: 'Participou de 5 eventos do PHV', emoji: '😇' },
        { name: 'Palhaço Oficial', description: 'Fez todo mundo rir no retiro', emoji: '🤡' },
        { name: 'Modo Danny', description: 'Chegou atrasado em 3 eventos seguidos', emoji: '😴' },
        { name: 'Corredor de Fé', description: 'Participou da corrida do MAC', emoji: '🏃' },
        { name: 'Voz da Igreja', description: 'Cantou no coro pelo menos 1 vez', emoji: '🎤' },
        { name: 'Missionário', description: 'Trouxe um amigo novo pro PHV', emoji: '🫶' },
        { name: 'Rei do Snake', description: 'Fez mais de 100 pontos no Snake PHV', emoji: '🐍' },
        { name: 'Fotógrafo Oficial', description: 'Postou mais de 10 fotos', emoji: '📸' },
        { name: 'Comentarista', description: 'Fez mais de 20 comentários', emoji: '💬' },
        { name: 'Firme na Farra', description: 'Presente em todos os pós-missa do mês', emoji: '🍻' },
        { name: 'Piloto de CTPS', description: 'Fez mais de 50 pontos no Flappy CTPS', emoji: '🐦' },
        { name: 'Destruidor Espacial', description: 'Fez mais de 300 pontos no Space Invaders', emoji: '👾' },
    ];

    await Badge.bulkCreate(badges);

    // Museu timeline
    const museumEvents = [
        { title: 'Criação do PHV', description: 'O grupo Pastoral da Juventude Vicentina nasceu com a missão de unir fé e amizade entre os jovens da paróquia.', date: '2018-03-15', imageUrl: 'https://picsum.photos/seed/phv-criacao/800/600' },
        { title: 'Primeiro Retiro', description: 'Nosso primeiro retiro espiritual! Um final de semana inesquecível de oração, música e muita risada.', date: '2018-08-20', imageUrl: 'https://picsum.photos/seed/phv-retiro1/800/600' },
        { title: 'Primeira Corrida do MAC', description: 'A galera se reuniu pra correr no MAC. Alguns correram, outros fingiram que corriam.', date: '2019-05-12', imageUrl: 'https://picsum.photos/seed/phv-mac1/800/600' },
        { title: 'Festa Junina PHV', description: 'Quadrilha, quentão e muito forró. O PHV mostrou que sabe dançar!', date: '2019-06-22', imageUrl: 'https://picsum.photos/seed/phv-junina/800/600' },
        { title: 'Retiro 2020 (Online)', description: 'A pandemia não nos parou. Fizemos nosso retiro online com louvor, partilha e muita emoção.', date: '2020-09-10', imageUrl: 'https://picsum.photos/seed/phv-online/800/600' },
        { title: 'Volta Presencial', description: 'Finalmente juntos de novo! O reencontro presencial foi emocionante demais.', date: '2021-11-05', imageUrl: 'https://picsum.photos/seed/phv-volta/800/600' },
        { title: 'Acampamento PHV', description: 'Um acampamento com fogueira, violão, s\'mores e muita conversa até de madrugada.', date: '2022-07-15', imageUrl: 'https://picsum.photos/seed/phv-acampa/800/600' },
        { title: 'Corrida do MAC 2023', description: 'A maior edição da corrida! Participação recorde e todo mundo chegou (mais ou menos) inteiro.', date: '2023-04-30', imageUrl: 'https://picsum.photos/seed/phv-mac2/800/600' },
        { title: 'Retiro 2024', description: 'O melhor retiro de todos! Tema: "Juntos na fé, firmes na farra." Marcou a história do grupo.', date: '2024-02-17', imageUrl: 'https://picsum.photos/seed/phv-retiro24/800/600' },
        { title: 'Lançamento do Blog', description: 'O PHV Resenha Sagrada entrou no ar! Agora nossas memórias ficam registradas pra sempre.', date: '2025-01-10', imageUrl: 'https://picsum.photos/seed/phv-blog/800/600' },
    ];

    await MuseumEvent.bulkCreate(museumEvents);

    console.log('Banco de dados populado com dados iniciais!');
};

seedDatabase().catch(console.error);