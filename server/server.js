// Only load .env file in development — Railway injects env vars directly
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const connectDB = require('./config/db');
const { connectCloudinary } = require('./config/cloudinary');

const { generalLimiter } = require('./middleware/rateLimiter');
const errorMiddleware = require('./middleware/errorMiddleware');
const { initSocketManager } = require('./socket/socketManager');
const logger = require('./utils/logger');

// Routes
const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const fileRoutes = require('./routes/fileRoutes');

const app = express();
const server = http.createServer(app);

// ─── CORS (FIRST middleware, before everything else) ───
const corsConfig = {
    origin: 'https://wecndraw.vercel.app',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
};

// In development, also allow localhost
if (process.env.NODE_ENV !== 'production') {
    corsConfig.origin = [
        'http://localhost:5173',
        'https://wecndraw.vercel.app',
    ];
}

app.use(cors(corsConfig));
app.options('/(.*)', cors(corsConfig));

// Socket.IO
const io = new Server(server, {
    cors: corsConfig,
    pingTimeout: 60000,
    pingInterval: 25000,
});

// Connect services
connectDB();
connectCloudinary();

// Security
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// Parsing
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}

// Rate limiting
app.use('/api', generalLimiter);

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ success: true, message: 'WecnDraw API is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/files', fileRoutes);

// 404 handler
app.use('/{*path}', (req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use(errorMiddleware);

// Socket.io
initSocketManager(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    logger.info(`WecnDraw server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

module.exports = { app, server };
