const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
    if (!process.env.MONGO_URI) {
        logger.error('MONGO_URI environment variable is not defined. Cannot connect to MongoDB.');
        process.exit(1);
    }

    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
        });
        logger.info(`MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
        logger.error(`MongoDB connection error: ${error.message}`);
        logger.warn('Server running WITHOUT database — API calls will fail until MongoDB is configured.');
    }
};

mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('reconnected', () => {
    logger.info('MongoDB reconnected');
});

module.exports = connectDB;
