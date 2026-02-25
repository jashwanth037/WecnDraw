const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
    {
        roomId: { type: String, required: true, index: true },
        sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        text: { type: String, default: '' },
        type: {
            type: String,
            enum: ['text', 'file', 'system'],
            default: 'text',
        },
        fileUrl: { type: String, default: '' },
        fileName: { type: String, default: '' },
        mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    },
    { timestamps: true }
);

module.exports = mongoose.model('Message', messageSchema);
