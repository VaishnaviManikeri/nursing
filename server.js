const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// ====================== LOAD ENV ======================
dotenv.config();

// ====================== CONNECT DB ======================
connectDB();

const app = express();

// ====================== CORS CONFIG (SAFE & MODERN) ======================
const allowedOrigins = [
    "http://localhost:5173",
    process.env.FRONTEND_URL
].filter(Boolean); // remove undefined

app.use(cors({
    origin: (origin, callback) => {
        // allow requests with no origin (Postman, curl, server-to-server)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// ❌ DO NOT USE app.options('*', cors()) — breaks Node 22

// ====================== BODY PARSERS ======================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ====================== ROUTES ======================
app.use('/api/auth', require('./routes/auth'));
app.use('/api/gallery', require('./routes/gallery'));
app.use('/api/announcements', require('./routes/announcement'));
app.use('/api/careers', require('./routes/career'));

// ====================== HEALTH CHECK (RENDER) ======================
app.get('/', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Server is running successfully 🚀',
        timestamp: new Date().toISOString()
    });
});

// ====================== ERROR HANDLER ======================
app.use((err, req, res, next) => {
    console.error('ERROR:', err.message);

    if (err.message === 'Not allowed by CORS') {
        return res.status(403).json({
            success: false,
            message: 'CORS Error: Origin not allowed'
        });
    }

    res.status(500).json({
        success: false,
        message: 'Internal Server Error'
    });
});

// ====================== START SERVER ======================
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`🌐 Allowed origins: ${allowedOrigins.join(', ')}`);
});
