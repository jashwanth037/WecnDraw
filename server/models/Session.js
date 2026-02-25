const mongoose = require('mongoose');

const strokeSchema = new mongoose.Schema({
    tool: { type: String, required: true },
    color: { type: String, default: '#000000' },
    size: { type: Number, default: 3 },
    points: [{ x: Number, y: Number }],
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now },
});

const fileSchema = new mongoose.Schema({
    name: String,
    url: String,
    type: String,
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    uploadedAt: { type: Date, default: Date.now },
});

const recordingFrameSchema = new mongoose.Schema({
    canvasState: String,
    timestamp: { type: Date, default: Date.now },
});

const sessionSchema = new mongoose.Schema(
    {
        roomId: {
            type: String,
            required: true,
            index: true,
        },
        strokes: [strokeSchema],
        canvasState: { type: String, default: '' },
        chatMessages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],
        snapshot: { type: String, default: '' },
        files: [fileSchema],
        recordingFrames: [recordingFrameSchema],
        isRecording: { type: Boolean, default: false },
        recordingStartedAt: { type: Date, default: null },
        savedAt: { type: Date, default: Date.now },
        analytics: {
            totalStrokes: { type: Number, default: 0 },
            totalMessages: { type: Number, default: 0 },
            totalFiles: { type: Number, default: 0 },
            activeTime: { type: Number, default: 0 },
            userContributions: [{
                userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
                strokes: { type: Number, default: 0 },
                messages: { type: Number, default: 0 },
            }],
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Session', sessionSchema);
