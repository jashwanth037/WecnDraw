const User = require('../models/User');
const jwtService = require('../services/jwtService');
const cloudinaryService = require('../services/cloudinaryService');
const apiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const authController = {
    googleLogin: async (req, res, next) => {
        try {
            const { credential } = req.body;
            if (!credential) {
                return apiResponse.error(res, 'Google credential is required', 400);
            }

            let googleId, email, name, picture;

            try {
                const ticket = await googleClient.verifyIdToken({
                    idToken: credential,
                    audience: process.env.GOOGLE_CLIENT_ID,
                });
                const payload = ticket.getPayload();
                googleId = payload.sub;
                email = payload.email;
                name = payload.name;
                picture = payload.picture;
            } catch (_idTokenErr) {
                const https = require('https');
                const userInfo = await new Promise((resolve, reject) => {
                    https.get(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${credential}`, (resp) => {
                        let data = '';
                        resp.on('data', (chunk) => { data += chunk; });
                        resp.on('end', () => {
                            try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
                        });
                    }).on('error', reject);
                });
                if (!userInfo.email) {
                    return apiResponse.error(res, 'Invalid Google token', 401);
                }
                googleId = userInfo.sub;
                email = userInfo.email;
                name = userInfo.name;
                picture = userInfo.picture;
            }

            let user = await User.findOne({ googleId });

            if (!user) {
                user = await User.findOne({ email });
                if (user) {
                    user.googleId = googleId;
                    user.authProvider = user.authProvider === 'local' ? 'local' : 'google';
                    if (!user.avatar && picture) user.avatar = picture;
                    await user.save({ validateBeforeSave: false });
                } else {
                    const baseUsername = (name || email.split('@')[0]).replace(/[^a-zA-Z0-9_]/g, '').slice(0, 25);
                    let username = baseUsername;
                    let counter = 1;
                    while (await User.findOne({ username })) {
                        username = `${baseUsername}${counter++}`;
                    }

                    user = await User.create({
                        username,
                        email,
                        googleId,
                        authProvider: 'google',
                        avatar: picture || '',
                    });
                }
            }

            const { accessToken, refreshToken } = jwtService.generateTokenPair(user._id, user.role);
            user.refreshToken = refreshToken;
            await user.save({ validateBeforeSave: false });
            jwtService.setRefreshTokenCookie(res, refreshToken);

            return apiResponse.success(res, 'Google login successful', {
                user: { _id: user._id, username: user.username, email: user.email, avatar: user.avatar, role: user.role },
                accessToken,
            });
        } catch (err) {
            logger.error('Google login error:', err);
            if (err.message?.includes('Token used too late') || err.message?.includes('Invalid token')) {
                return apiResponse.error(res, 'Invalid or expired Google token', 401);
            }
            next(err);
        }
    },



    register: async (req, res, next) => {
        try {
            const { username, email, password } = req.body;
            const existingUser = await User.findOne({ $or: [{ email }, { username }] });
            if (existingUser) {
                return apiResponse.error(res, 'Email or username already in use', 400);
            }

            const user = await User.create({ username, email, passwordHash: password });
            const { accessToken, refreshToken } = jwtService.generateTokenPair(user._id, user.role);

            await User.findByIdAndUpdate(user._id, { refreshToken });
            jwtService.setRefreshTokenCookie(res, refreshToken);

            return apiResponse.success(res, 'Registration successful', {
                user: { _id: user._id, username: user.username, email: user.email, avatar: user.avatar, role: user.role },
                accessToken,
            }, 201);
        } catch (err) {
            next(err);
        }
    },

    login: async (req, res, next) => {
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ email }).select('+passwordHash +refreshToken');
            if (!user || !(await user.comparePassword(password))) {
                return apiResponse.error(res, 'Invalid email or password', 401);
            }

            const { accessToken, refreshToken } = jwtService.generateTokenPair(user._id, user.role);
            user.refreshToken = refreshToken;
            await user.save({ validateBeforeSave: false });
            jwtService.setRefreshTokenCookie(res, refreshToken);

            return apiResponse.success(res, 'Login successful', {
                user: { _id: user._id, username: user.username, email: user.email, avatar: user.avatar, role: user.role },
                accessToken,
            });
        } catch (err) {
            next(err);
        }
    },

    logout: async (req, res, next) => {
        try {
            const { refreshToken } = req.cookies;
            if (refreshToken) {
                await User.findOneAndUpdate({ refreshToken }, { refreshToken: null });
            }
            jwtService.clearRefreshTokenCookie(res);
            return apiResponse.success(res, 'Logged out successfully');
        } catch (err) {
            next(err);
        }
    },

    refreshToken: async (req, res, next) => {
        try {
            const { refreshToken } = req.cookies;
            if (!refreshToken) {
                return apiResponse.error(res, 'No refresh token', 401);
            }

            const decoded = jwtService.verifyRefreshToken(refreshToken);
            const user = await User.findOne({ _id: decoded.userId, refreshToken }).lean();
            if (!user) {
                return apiResponse.error(res, 'Invalid refresh token', 401);
            }

            const { accessToken, refreshToken: newRefreshToken } = jwtService.generateTokenPair(user._id, user.role);
            await User.findByIdAndUpdate(user._id, { refreshToken: newRefreshToken });
            jwtService.setRefreshTokenCookie(res, newRefreshToken);

            return apiResponse.success(res, 'Token refreshed', { accessToken });
        } catch (err) {
            if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
                return apiResponse.error(res, 'Invalid or expired refresh token', 401);
            }
            next(err);
        }
    },

    getMe: async (req, res, next) => {
        try {
            const user = await User.findById(req.user._id).lean();
            return apiResponse.success(res, 'User fetched', { user });
        } catch (err) {
            next(err);
        }
    },

    updateProfile: async (req, res, next) => {
        try {
            const { username } = req.body;
            const updateData = {};
            if (username) updateData.username = username;

            const user = await User.findByIdAndUpdate(req.user._id, updateData, { new: true, runValidators: true }).lean();
            return apiResponse.success(res, 'Profile updated', { user });
        } catch (err) {
            next(err);
        }
    },

    uploadAvatar: async (req, res, next) => {
        try {
            if (!req.file) {
                return apiResponse.error(res, 'No file uploaded', 400);
            }
            const result = await cloudinaryService.uploadImage(req.file.buffer, 'wecndraw/avatars', {
                transformation: [{ width: 200, height: 200, crop: 'fill', gravity: 'face' }],
            });
            const user = await User.findByIdAndUpdate(
                req.user._id,
                { avatar: result.secure_url },
                { new: true }
            ).lean();
            return apiResponse.success(res, 'Avatar uploaded', { user });
        } catch (err) {
            next(err);
        }
    },
};

module.exports = authController;
