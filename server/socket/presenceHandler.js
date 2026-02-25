const presenceHandler = (io, socket, roomUsers) => {
    socket.on('cursor:move', ({ roomId, x, y }) => {
        socket.to(roomId).emit('cursor:update', {
            socketId: socket.id,
            user: {
                _id: socket.user._id,
                username: socket.user.username,
                avatar: socket.user.avatar,
            },
            x,
            y,
        });
    });

    socket.on('presence:status', ({ roomId, status }) => {
        socket.to(roomId).emit('presence:update', {
            socketId: socket.id,
            user: socket.user,
            status,
        });
    });

    socket.on('presence:follow', ({ roomId, targetSocketId }) => {
        io.to(targetSocketId).emit('presence:follow-request', {
            from: socket.id,
            user: socket.user,
        });
    });

    socket.on('presence:viewport', ({ roomId, viewport }) => {
        const users = roomUsers.get(roomId);
        if (!users) return;
        // Emit viewport to anyone following this user
        socket.to(roomId).emit('presence:viewport-update', {
            socketId: socket.id,
            viewport,
        });
    });

    // Timer events (host-only, but validated client-side)
    socket.on('timer:start', ({ roomId, duration }) => {
        io.to(roomId).emit('timer:started', { duration, startedAt: Date.now(), by: socket.user });
    });

    socket.on('timer:stop', ({ roomId }) => {
        io.to(roomId).emit('timer:stopped', {});
    });
};

module.exports = presenceHandler;
