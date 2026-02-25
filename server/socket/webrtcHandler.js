const webrtcHandler = (io, socket, roomUsers) => {
    socket.on('webrtc:offer', ({ roomId, targetSocketId, offer, type }) => {
        io.to(targetSocketId).emit('webrtc:offer', { from: socket.id, offer, user: socket.user, type });
    });

    socket.on('webrtc:answer', ({ roomId, targetSocketId, answer, type }) => {
        io.to(targetSocketId).emit('webrtc:answer', { from: socket.id, answer, type });
    });

    socket.on('webrtc:ice-candidate', ({ roomId, targetSocketId, candidate, type }) => {
        io.to(targetSocketId).emit('webrtc:ice-candidate', { from: socket.id, candidate, type });
    });

    // Screen sharing
    socket.on('webrtc:screen-share-start', ({ roomId }) => {
        socket.to(roomId).emit('webrtc:screen-share-started', {
            socketId: socket.id,
            user: socket.user,
        });
    });

    socket.on('webrtc:screen-share-stop', ({ roomId }) => {
        socket.to(roomId).emit('webrtc:screen-share-stopped', {
            socketId: socket.id,
            user: socket.user,
        });
    });

    // Audio sharing
    socket.on('webrtc:audio-start', ({ roomId }) => {
        socket.to(roomId).emit('webrtc:audio-started', {
            socketId: socket.id,
            user: socket.user,
        });
    });

    socket.on('webrtc:audio-stop', ({ roomId }) => {
        socket.to(roomId).emit('webrtc:audio-stopped', {
            socketId: socket.id,
            user: socket.user,
        });
    });

    // Late-joiner: broadcast request to all room members so active sharers send offers
    socket.on('webrtc:request-streams', ({ roomId }) => {
        socket.to(roomId).emit('webrtc:request-streams', {
            from: socket.id,
            user: socket.user,
        });
    });

    // Emoji reactions (relay to all in room)
    socket.on('draw:emoji', ({ roomId, emoji }) => {
        socket.to(roomId).emit('draw:emoji', { emoji, user: socket.user });
    });
};

module.exports = webrtcHandler;
