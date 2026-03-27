const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'phv-resenha-sagrada-secret';

const authMiddleware = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ message: 'Acesso negado. Token não fornecido.' });
    }

    const tokenValue = token.startsWith('Bearer ') ? token.slice(7) : token;

    jwt.verify(tokenValue, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Token inválido.' });
        }
        req.user = user;
        next();
    });
};

module.exports = authMiddleware;