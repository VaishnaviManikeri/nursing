const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// ====================== LOAD ENV ======================
dotenv.config();

// ====================== CONNECT DB ======================
connectDB();

const app = express();

// ====================== MIDDLEWARE ======================
// FIX: Better CORS configuration
const allowedOrigins = [
    "http://localhost:5173",
    "https://your-frontend-domain.vercel.app", // Add your actual frontend URL
    process.env.FRONTEND_URL
].filter(Boolean); // Remove any undefined values

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight requests
app.options('*', cors());

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
    
    // Handle CORS errors
    if (err.message.includes('CORS')) {
        return res.status(403).json({
            success: false,
            message: 'CORS Error: Request blocked'
        });
    }

    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

// ====================== START SERVER ======================
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`🌐 Allowed origins: ${allowedOrigins.join(', ')}`);
});