const Message = require('../models/Message');
const Session = require('../models/Session');
const User = require('../models/User');
const cloudinaryService = require('../services/cloudinaryService');
const logger = require('../utils/logger');

const chatHandler = (io, socket, roomUsers) => {
    socket.on('chat:message', async ({ roomId, text, type = 'text', fileUrl = '', fileName = '', mentions = [] }) => {
        try {
            const msg = await Message.create({
                roomId,
                sender: socket.user._id,
                text,
                type,
                fileUrl,
                fileName,
                mentions,
            });

            // Save message ref to session
            await Session.findOneAndUpdate(
                { roomId },
                {
                    $push: { chatMessages: msg._id },
                    $inc: { 'analytics.totalMessages': 1 },
                },
                { upsert: true }
            );

            const populated = await Message.findById(msg._id)
                .populate('sender', 'username avatar')
                .lean();

            io.to(roomId).emit('chat:message', populated);

            // Notify mentioned users
            if (mentions.length > 0) {
                const mentionedUsers = await User.find({ username: { $in: mentions } }).select('_id').lean();
                const mentionedSocketIds = [];
                const roomUsersMap = roomUsers.get(roomId);
                if (roomUsersMap) {
                    roomUsersMap.forEach((userEntry, sId) => {
                        const isMentioned = mentionedUsers.some(
                            (u) => u._id.toString() === userEntry.user._id.toString()
                        );
                        if (isMentioned) mentionedSocketIds.push(sId);
                    });
                }
                mentionedSocketIds.forEach((sId) => {
                    io.to(sId).emit('chat:mention', {
                        from: socket.user.username,
                        text,
                        roomId,
                    });
                });
            }
        } catch (err) {
            logger.error(`chat:message error: ${err.message}`);
        }
    });

    socket.on('chat:typing', ({ roomId }) => {
        socket.to(roomId).emit('chat:typing', { socketId: socket.id, user: socket.user });
    });

    socket.on('chat:stop-typing', ({ roomId }) => {
        socket.to(roomId).emit('chat:stop-typing', { socketId: socket.id });
    });
};

module.exports = chatHandler;
