const Session = require('../models/Session');
const logger = require('../utils/logger');

const sessionService = {
    getOrCreateSession: async (roomId) => {
        let session = await Session.findOne({ roomId }).lean();
        if (!session) {
            session = await Session.create({ roomId });
        }
        return session;
    },

    saveCanvasState: async (roomId, canvasState) => {
        const session = await Session.findOneAndUpdate(
            { roomId },
            { canvasState, savedAt: new Date() },
            { upsert: true, new: true }
        );
        return session;
    },

    addStroke: async (roomId, stroke) => {
        await Session.findOneAndUpdate(
            { roomId },
            {
                $push: { strokes: stroke },
                $inc: { 'analytics.totalStrokes': 1 },
            },
            { upsert: true }
        );
    },

    addRecordingFrame: async (roomId, canvasState) => {
        await Session.findOneAndUpdate(
            { roomId },
            { $push: { recordingFrames: { canvasState, timestamp: new Date() } } },
            { upsert: true }
        );
    },
};

module.exports = sessionService;
