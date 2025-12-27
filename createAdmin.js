const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function createAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB connected');

        const existingAdmin = await User.findOne({ email: 'admin@example.com' });

        if (existingAdmin) {
            console.log('⚠️ Admin already exists');
            process.exit(0);
        }

        const admin = new User({
            username: 'admin',
            email: 'admin@example.com',
            password: 'admin123', // 🔥 RAW password
            role: 'admin'
        });

        await admin.save();

        console.log('🎉 ADMIN CREATED SUCCESSFULLY');
        console.log('Email: admin@example.com');
        console.log('Password: admin123');

        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
}

createAdmin();
