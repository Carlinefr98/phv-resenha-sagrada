const authMiddleware = require('./auth');

const adminMiddleware = (req, res, next) => {
    authMiddleware(req, res, () => {
        if (!req.user || !req.user.isAdmin) {
            return res.status(403).json({ message: 'Acesso negado. Apenas administradores.' });
        }
        next();
    });
};

module.exports = adminMiddleware;
