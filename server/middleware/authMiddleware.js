const jwtService = require('../services/jwtService');
const User = require('../models/User');
const logger = require('../utils/logger');

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwtService.verifyAccessToken(token);

        const user = await User.findById(decoded.userId).lean();
        if (!user) {
            return res.status(401).json({ success: false, message: 'User not found' });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: 'Token expired', code: 'TOKEN_EXPIRED' });
        }
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

const socketAuthMiddleware = async (socket, next) => {
    try {
        const token = socket.handshake.auth?.token;
        if (!token) {
            return next(new Error('Authentication required'));
        }

        const decoded = jwtService.verifyAccessToken(token);
        const user = await User.findById(decoded.userId).lean();
        if (!user) {
            return next(new Error('User not found'));
        }

        socket.user = user;
        next();
    } catch (error) {
        next(new Error('Invalid or expired token'));
    }
};

module.exports = { authMiddleware, socketAuthMiddleware };
