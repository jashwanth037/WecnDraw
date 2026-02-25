const Session = require('../models/Session');
const cloudinaryService = require('../services/cloudinaryService');
const apiResponse = require('../utils/apiResponse');

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'image/svg+xml'];

const fileController = {
    uploadFile: async (req, res, next) => {
        try {
            if (!req.file) return apiResponse.error(res, 'No file uploaded', 400);
            if (!ALLOWED_MIME_TYPES.includes(req.file.mimetype)) {
                return apiResponse.error(res, 'File type not allowed', 400);
            }

            const { roomId } = req.body;
            const result = await cloudinaryService.uploadImage(req.file.buffer, 'wecndraw/files');
            const fileEntry = {
                name: req.file.originalname,
                url: result.secure_url,
                type: req.file.mimetype,
                uploadedBy: req.user._id,
                uploadedAt: new Date(),
            };

            if (roomId) {
                await Session.findOneAndUpdate(
                    { roomId },
                    {
                        $push: { files: fileEntry },
                        $inc: { 'analytics.totalFiles': 1 },
                    },
                    { upsert: true }
                );
            }

            return apiResponse.success(res, 'File uploaded', { file: fileEntry }, 201);
        } catch (err) {
            next(err);
        }
    },

    getRoomFiles: async (req, res, next) => {
        try {
            const { roomId } = req.params;
            const session = await Session.findOne({ roomId })
                .populate('files.uploadedBy', 'username avatar')
                .select('files')
                .lean();
            return apiResponse.success(res, 'Files fetched', { files: session?.files || [] });
        } catch (err) {
            next(err);
        }
    },

    deleteFile: async (req, res, next) => {
        try {
            const { fileId } = req.params;
            const { roomId } = req.body;
            await Session.findOneAndUpdate(
                { roomId },
                { $pull: { files: { _id: fileId } } }
            );
            return apiResponse.success(res, 'File deleted');
        } catch (err) {
            next(err);
        }
    },
};

module.exports = fileController;
