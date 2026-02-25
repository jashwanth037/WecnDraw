const { cloudinary } = require('../config/cloudinary');
const logger = require('../utils/logger');

const cloudinaryService = {
    uploadImage: async (fileBuffer, folder = 'wecndraw', options = {}) => {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder,
                    resource_type: 'auto',
                    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'svg'],
                    max_bytes: 10 * 1024 * 1024, // 10MB
                    ...options,
                },
                (error, result) => {
                    if (error) {
                        logger.error('Cloudinary upload error:', error);
                        reject(error);
                    } else {
                        resolve(result);
                    }
                }
            );
            uploadStream.end(fileBuffer);
        });
    },

    uploadBase64: async (base64String, folder = 'wecndraw/snapshots', options = {}) => {
        try {
            const result = await cloudinary.uploader.upload(base64String, {
                folder,
                resource_type: 'image',
                ...options,
            });
            return result;
        } catch (error) {
            logger.error('Cloudinary base64 upload error:', error);
            throw error;
        }
    },

    deleteFile: async (publicId) => {
        try {
            const result = await cloudinary.uploader.destroy(publicId);
            return result;
        } catch (error) {
            logger.error('Cloudinary delete error:', error);
            throw error;
        }
    },
};

module.exports = cloudinaryService;
