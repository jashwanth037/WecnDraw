const sessionService = require('../services/sessionService');
const logger = require('../utils/logger');

const drawingHandler = (io, socket, roomUsers) => {
    // Freehand drawing events
    socket.on('draw:start', ({ roomId, data }) => {
        socket.to(roomId).emit('draw:start', { socketId: socket.id, data });
    });

    socket.on('draw:move', ({ roomId, data }) => {
        socket.to(roomId).emit('draw:move', { socketId: socket.id, data });
    });

    socket.on('draw:end', async ({ roomId, data }) => {
        socket.to(roomId).emit('draw:end', { socketId: socket.id, data });
        // Persist stroke
        if (data?.points?.length) {
            await sessionService.addStroke(roomId, {
                tool: data.tool || 'pencil',
                color: data.color || '#000',
                size: data.size || 3,
                points: data.points,
                userId: socket.user._id,
                timestamp: new Date(),
            }).catch((err) => logger.error(`draw:end persist error: ${err.message}`));
        }
    });

    // Object-level events (shapes, text, etc.)
    socket.on('draw:object-added', ({ roomId, data }) => {
        socket.to(roomId).emit('draw:object-added', { socketId: socket.id, data });
    });

    socket.on('draw:object-modified', ({ roomId, data }) => {
        socket.to(roomId).emit('draw:object-modified', { socketId: socket.id, data });
    });

    socket.on('draw:object-removed', ({ roomId, data }) => {
        socket.to(roomId).emit('draw:object-removed', { socketId: socket.id, data });
    });

    // Canvas-level events
    socket.on('canvas:clear', ({ roomId }) => {
        io.to(roomId).emit('canvas:clear', { socketId: socket.id });
    });

    socket.on('canvas:undo', ({ roomId, canvasState }) => {
        socket.to(roomId).emit('canvas:undo', { socketId: socket.id, canvasState });
        sessionService.saveCanvasState(roomId, canvasState).catch((err) =>
            logger.error(`canvas:undo save error: ${err.message}`)
        );
    });

    socket.on('canvas:redo', ({ roomId, canvasState }) => {
        socket.to(roomId).emit('canvas:redo', { socketId: socket.id, canvasState });
        sessionService.saveCanvasState(roomId, canvasState).catch((err) =>
            logger.error(`canvas:redo save error: ${err.message}`)
        );
    });

    socket.on('canvas:sync-request', async ({ roomId }) => {
        const session = await sessionService.getOrCreateSession(roomId);
        socket.emit('canvas:sync-response', { canvasState: session.canvasState || '' });
    });

    socket.on('canvas:state-update', async ({ roomId, canvasState }) => {
        await sessionService.saveCanvasState(roomId, canvasState).catch((err) =>
            logger.error(`canvas:state-update error: ${err.message}`)
        );
    });

    // Auto-save recording frame if recording is active
    socket.on('recording:frame', async ({ roomId, canvasState }) => {
        await sessionService.addRecordingFrame(roomId, canvasState).catch((err) =>
            logger.error(`recording:frame error: ${err.message}`)
        );
    });

    // Emoji reactions on canvas
    socket.on('emoji:place', ({ roomId, data }) => {
        io.to(roomId).emit('emoji:placed', { socketId: socket.id, user: socket.user, data });
    });
};

module.exports = drawingHandler;
