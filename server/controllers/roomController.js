const Room = require('../models/Room');
const User = require('../models/User');
const generateRoomId = require('../utils/generateRoomId');
const apiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');

const roomController = {
    createRoom: async (req, res, next) => {
        try {
            const { name, description, password, maxUsers, tags, template } = req.body;

            const roomId = generateRoomId();
            const roomData = {
                roomId,
                name,
                description: description || '',
                host: req.user._id,
                participants: [{ user: req.user._id, role: 'host' }],
                isPasswordProtected: !!password,
                maxUsers: maxUsers || 10,
                tags: tags || [],
                template: template || 'blank',
            };
            if (password) roomData.password = password;

            const room = await Room.create(roomData);
            const populated = await Room.findById(room._id)
                .populate('host', 'username avatar')
                .populate('participants.user', 'username avatar')
                .lean();

            return apiResponse.success(res, 'Room created', { room: { ...populated, password: undefined } }, 201);
        } catch (err) {
            next(err);
        }
    },

    getMyRooms: async (req, res, next) => {
        try {
            const rooms = await Room.find({
                $or: [
                    { host: req.user._id },
                    { 'participants.user': req.user._id },
                ],
                isActive: true,
            })
                .populate('host', 'username avatar')
                .populate('participants.user', 'username avatar')
                .select('-password')
                .sort({ updatedAt: -1 })
                .lean();

            return apiResponse.success(res, 'Rooms fetched', { rooms });
        } catch (err) {
            next(err);
        }
    },

    getRoom: async (req, res, next) => {
        try {
            const { roomId } = req.params;
            const room = await Room.findOne({ roomId })
                .populate('host', 'username avatar')
                .populate('participants.user', 'username avatar')
                .select('-password')
                .lean();

            if (!room) {
                return apiResponse.error(res, 'Room not found', 404);
            }

            return apiResponse.success(res, 'Room fetched', { room });
        } catch (err) {
            next(err);
        }
    },

    joinRoom: async (req, res, next) => {
        try {
            const { roomId } = req.params;
            const { password } = req.body;

            const room = await Room.findOne({ roomId }).select('+password');
            if (!room) {
                return apiResponse.error(res, 'Room not found', 404);
            }
            if (!room.isActive) {
                return apiResponse.error(res, 'Room is closed', 403);
            }
            if (room.participants.length >= room.maxUsers) {
                return apiResponse.error(res, 'Room is full', 403);
            }
            if (room.isPasswordProtected) {
                if (!password || !(await room.comparePassword(password))) {
                    return apiResponse.error(res, 'Incorrect room password', 401);
                }
            }

            const alreadyIn = room.participants.some(
                (p) => p.user.toString() === req.user._id.toString()
            );
            if (!alreadyIn) {
                room.participants.push({ user: req.user._id, role: 'participant' });
                await room.save();
            }

            const populated = await Room.findOne({ roomId })
                .populate('host', 'username avatar')
                .populate('participants.user', 'username avatar')
                .select('-password')
                .lean();

            return apiResponse.success(res, 'Joined room', { room: populated });
        } catch (err) {
            next(err);
        }
    },

    deleteRoom: async (req, res, next) => {
        try {
            const { roomId } = req.params;
            const room = await Room.findOne({ roomId });
            if (!room) return apiResponse.error(res, 'Room not found', 404);
            if (room.host.toString() !== req.user._id.toString()) {
                return apiResponse.error(res, 'Only the host can delete this room', 403);
            }
            await Room.findOneAndUpdate({ roomId }, { isActive: false });
            return apiResponse.success(res, 'Room deleted');
        } catch (err) {
            next(err);
        }
    },

    updateSettings: async (req, res, next) => {
        try {
            const { roomId } = req.params;
            const { name, description, maxUsers, tags } = req.body;
            const room = await Room.findOne({ roomId });
            if (!room) return apiResponse.error(res, 'Room not found', 404);
            if (room.host.toString() !== req.user._id.toString()) {
                return apiResponse.error(res, 'Only the host can update settings', 403);
            }

            const updates = {};
            if (name) updates.name = name;
            if (description !== undefined) updates.description = description;
            if (maxUsers) updates.maxUsers = maxUsers;
            if (tags) updates.tags = tags;

            const updated = await Room.findOneAndUpdate({ roomId }, updates, { new: true })
                .populate('host', 'username avatar')
                .lean();
            return apiResponse.success(res, 'Settings updated', { room: updated });
        } catch (err) {
            next(err);
        }
    },

    kickUser: async (req, res, next) => {
        try {
            const { roomId, userId } = req.params;
            const room = await Room.findOne({ roomId });
            if (!room) return apiResponse.error(res, 'Room not found', 404);
            if (room.host.toString() !== req.user._id.toString()) {
                return apiResponse.error(res, 'Only the host can kick users', 403);
            }
            if (userId === req.user._id.toString()) {
                return apiResponse.error(res, 'Cannot kick yourself', 400);
            }

            room.participants = room.participants.filter(
                (p) => p.user.toString() !== userId
            );
            await room.save();
            return apiResponse.success(res, 'User kicked', { userId });
        } catch (err) {
            next(err);
        }
    },
};

module.exports = roomController;
