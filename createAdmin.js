const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function createAdmin() {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);

        console.log('✅ MongoDB Connected');

        const existingAdmin = await User.findOne({
            email: 'admin@example.com'
        });

        if (existingAdmin) {
            console.log('⚠️ Admin already exists');
            process.exit(0);
        }

        const admin = new User({
            username: 'admin',
            email: 'admin@example.com',
            password: 'admin123', // 🔥 RAW password ONLY
            role: 'admin'
        });

        await admin.save(); // ✅ hashed by pre-save hook

        console.log('🎉 ADMIN CREATED SUCCESSFULLY');
        console.log('Email: admin@example.com');
        console.log('Password: admin123');

        await mongoose.disconnect();
        process.exit(0);

    } catch (err) {
        console.error('❌ Error creating admin:', err.message);
        process.exit(1);
    }
}

createAdmin();
