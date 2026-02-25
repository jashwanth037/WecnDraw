const Session = require('../models/Session');
const sessionService = require('../services/sessionService');
const logger = require('../utils/logger');

const roomHandler = (io, socket, roomUsers) => {
    socket.on('room:join', async ({ roomId }) => {
        try {
            socket.join(roomId);

            if (!roomUsers.has(roomId)) {
                roomUsers.set(roomId, new Map());
            }
            const users = roomUsers.get(roomId);
            const userEntry = {
                socketId: socket.id,
                user: {
                    _id: socket.user._id,
                    username: socket.user.username,
                    avatar: socket.user.avatar,
                },
                color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`,
                joinedAt: Date.now(),
            };
            users.set(socket.id, userEntry);

            // Emit to the joining user
            const userList = Array.from(users.values());
            socket.emit('room:joined', { roomId, users: userList, currentUser: userEntry });

            // Broadcast to others
            socket.to(roomId).emit('room:user-joined', { user: userEntry, users: userList });

            // Send canvas sync to new joiner
            const session = await sessionService.getOrCreateSession(roomId);
            socket.emit('canvas:sync-response', { canvasState: session.canvasState || '' });

            if (process.env.NODE_ENV !== 'production') {
                logger.info(`${socket.user.username} joined room ${roomId}`);
            }
        } catch (err) {
            socket.emit('error', { message: 'Failed to join room' });
            logger.error(`room:join error: ${err.message}`);
        }
    });

    socket.on('room:leave', ({ roomId }) => {
        socket.leave(roomId);
        const users = roomUsers.get(roomId);
        if (users) {
            users.delete(socket.id);
            const remaining = Array.from(users.values());
            io.to(roomId).emit('room:user-left', { socketId: socket.id, user: socket.user, users: remaining });
            if (users.size === 0) roomUsers.delete(roomId);
        }
    });

    socket.on('room:kick', ({ roomId, targetSocketId }) => {
        const users = roomUsers.get(roomId);
        if (!users) return;

        // Verify requester is the host (first user who joined = first entry in Map)
        const usersArr = Array.from(users.values());
        const host = usersArr[0];
        if (!host || host.user._id !== socket.user._id) {
            socket.emit('error', { message: 'Only the host can kick members' });
            return;
        }

        // Find target
        const target = users.get(targetSocketId);
        if (!target) return;

        // Cannot kick yourself
        if (targetSocketId === socket.id) return;

        // Emit kick to target
        io.to(targetSocketId).emit('room:kicked', { reason: 'You were removed by the host' });

        // Force-leave the target from the socket room
        const targetSocket = io.sockets.sockets.get(targetSocketId);
        if (targetSocket) {
            targetSocket.leave(roomId);
        }

        // Remove from tracked users
        users.delete(targetSocketId);
        const remaining = Array.from(users.values());
        io.to(roomId).emit('room:user-left', { socketId: targetSocketId, user: target.user, users: remaining });

        logger.info(`${socket.user.username} kicked ${target.user.username} from room ${roomId}`);
    });

    socket.on('room:user-list', ({ roomId }) => {
        const users = roomUsers.get(roomId);
        const userList = users ? Array.from(users.values()) : [];
        socket.emit('room:user-list', { users: userList });
    });
};

module.exports = roomHandler;
