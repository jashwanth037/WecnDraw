const Session = require('../models/Session');
const Message = require('../models/Message');
const cloudinaryService = require('../services/cloudinaryService');
const apiResponse = require('../utils/apiResponse');

const sessionController = {
    getSession: async (req, res, next) => {
        try {
            const { roomId } = req.params;
            const session = await Session.findOne({ roomId })
                .populate('chatMessages')
                .lean();
            return apiResponse.success(res, 'Session fetched', { session: session || { roomId, canvasState: '' } });
        } catch (err) {
            next(err);
        }
    },

    saveSession: async (req, res, next) => {
        try {
            const { roomId } = req.params;
            const { canvasState } = req.body;
            const session = await Session.findOneAndUpdate(
                { roomId },
                { canvasState, savedAt: new Date() },
                { upsert: true, new: true }
            ).lean();
            return apiResponse.success(res, 'Session saved', { session });
        } catch (err) {
            next(err);
        }
    },

    getHistory: async (req, res, next) => {
        try {
            const { roomId } = req.params;
            const session = await Session.findOne({ roomId })
                .select('strokes recordingFrames analytics savedAt')
                .lean();
            return apiResponse.success(res, 'History fetched', { history: session });
        } catch (err) {
            next(err);
        }
    },

    saveSnapshot: async (req, res, next) => {
        try {
            const { roomId } = req.params;
            const { imageData } = req.body;
            if (!imageData) return apiResponse.error(res, 'No image data', 400);

            const result = await cloudinaryService.uploadBase64(imageData, 'wecndraw/snapshots');
            await Session.findOneAndUpdate(
                { roomId },
                { snapshot: result.secure_url },
                { upsert: true }
            );
            return apiResponse.success(res, 'Snapshot saved', { url: result.secure_url });
        } catch (err) {
            next(err);
        }
    },

    toggleRecording: async (req, res, next) => {
        try {
            const { roomId } = req.params;
            const { action } = req.body; // 'start' or 'stop'
            const session = await Session.findOne({ roomId });
            if (!session) return apiResponse.error(res, 'Session not found', 404);

            if (action === 'start') {
                session.isRecording = true;
                session.recordingStartedAt = new Date();
                session.recordingFrames = [];
            } else {
                session.isRecording = false;
            }
            await session.save();
            return apiResponse.success(res, `Recording ${action}ed`, { isRecording: session.isRecording });
        } catch (err) {
            next(err);
        }
    },

    getMessages: async (req, res, next) => {
        try {
            const { roomId } = req.params;
            const messages = await Message.find({ roomId })
                .populate('sender', 'username avatar')
                .sort({ createdAt: 1 })
                .limit(100)
                .lean();
            return apiResponse.success(res, 'Messages fetched', { messages });
        } catch (err) {
            next(err);
        }
    },
};

module.exports = sessionController;
