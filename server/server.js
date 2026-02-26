console.log('[WecnDraw] Server starting...');

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

// Trust Railway's reverse proxy (fixes express-rate-limit ERR_ERL_UNEXPECTED_X_FORWARDED_FOR)
app.set('trust proxy', 1);

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

console.log('[WecnDraw] Middleware configured.');

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ success: true, message: 'WecnDraw API is running' });
});

// API Routes — mounted at both /api/* and /* for compatibility
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/files', fileRoutes);

// Also mount without /api prefix (in case VITE_API_URL on Vercel omits /api)
app.use('/auth', authRoutes);
app.use('/rooms', roomRoutes);
app.use('/sessions', sessionRoutes);
app.use('/files', fileRoutes);

console.log('[WecnDraw] Routes registered.');

// 404 handler (use standard middleware — /{*path} can crash on some Express 5 builds)
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

console.log('[WecnDraw] 404 handler set.');

// Error handler
app.use(errorMiddleware);

console.log('[WecnDraw] Error handler set.');

// Socket.IO
try {
    const io = new Server(server, {
        cors: corsConfig,
        pingTimeout: 60000,
        pingInterval: 25000,
    });
    initSocketManager(io);
    console.log('[WecnDraw] Socket.IO initialized.');
} catch (err) {
    console.error('[WecnDraw] Socket.IO init failed:', err.message);
}

// Start listening, then connect to DB
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`[WecnDraw] Server listening on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    logger.info(`WecnDraw server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

// Connect to services AFTER server is listening (non-blocking)
console.log('[WecnDraw] Connecting to MongoDB...');
connectDB();
connectCloudinary();

module.exports = { app, server };
