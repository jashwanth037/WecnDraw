const jwt = require('jsonwebtoken');

const jwtService = {
    generateAccessToken: (payload) => {
        return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
    },

    generateRefreshToken: (payload) => {
        return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
    },

    verifyAccessToken: (token) => {
        return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    },

    verifyRefreshToken: (token) => {
        return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    },

    generateTokenPair: (userId, role) => {
        const payload = { userId, role };
        return {
            accessToken: jwtService.generateAccessToken(payload),
            refreshToken: jwtService.generateRefreshToken(payload),
        };
    },

    setRefreshTokenCookie: (res, refreshToken) => {
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
    },

    clearRefreshTokenCookie: (res) => {
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        });
    },
};

module.exports = jwtService;
