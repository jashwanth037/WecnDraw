const User = require('../models/User');
const jwtService = require('../services/jwtService');
const cloudinaryService = require('../services/cloudinaryService');
const apiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');

const authController = {
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
