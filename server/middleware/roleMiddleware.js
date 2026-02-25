const Room = require('../models/Room');

const requireHostRole = async (req, res, next) => {
    try {
        const { roomId } = req.params;
        const room = await Room.findOne({ roomId }).lean();

        if (!room) {
            return res.status(404).json({ success: false, message: 'Room not found' });
        }

        if (room.host.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Only the host can perform this action' });
        }

        req.room = room;
        next();
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = { requireHostRole };
