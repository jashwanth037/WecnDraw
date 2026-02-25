const { socketAuthMiddleware } = require('../middleware/authMiddleware');
const roomHandler = require('./roomHandler');
const drawingHandler = require('./drawingHandler');
const chatHandler = require('./chatHandler');
const presenceHandler = require('./presenceHandler');
const webrtcHandler = require('./webrtcHandler');
const logger = require('../utils/logger');

// Map: roomId -> Map of socketId -> { user, socketId }
const roomUsers = new Map();

const initSocketManager = (io) => {
    io.use(socketAuthMiddleware);

    io.on('connection', (socket) => {
        if (process.env.NODE_ENV !== 'production') {
            logger.info(`Socket connected: ${socket.id} user: ${socket.user.username}`);
        }

        roomHandler(io, socket, roomUsers);
        drawingHandler(io, socket, roomUsers);
        chatHandler(io, socket, roomUsers);
        presenceHandler(io, socket, roomUsers);
        webrtcHandler(io, socket, roomUsers);

        socket.on('disconnect', () => {
            if (process.env.NODE_ENV !== 'production') {
                logger.info(`Socket disconnected: ${socket.id}`);
            }
            // Clean up from all rooms
            roomUsers.forEach((users, roomId) => {
                if (users.has(socket.id)) {
                    users.delete(socket.id);
                    const remaining = Array.from(users.values());
                    socket.to(roomId).emit('room:user-left', {
                        socketId: socket.id,
                        user: socket.user,
                        users: remaining,
                    });
                    if (users.size === 0) {
                        roomUsers.delete(roomId);
                    }
                }
            });
        });
    });
};

module.exports = { initSocketManager, roomUsers };
