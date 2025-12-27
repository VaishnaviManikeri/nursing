const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function createAdmin() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ MongoDB connected');

        // Check if admin exists
        const existingAdmin = await User.findOne({ email: 'admin@example.com' });
        if (existingAdmin) {
            console.log('⚠️ Admin already exists');
            console.log('Email:', existingAdmin.email);
            console.log('Role:', existingAdmin.role);
            process.exit(0);
        }

        // Create new admin
        console.log('Creating admin user...');
        const admin = new User({
            username: 'admin',
            email: 'admin@example.com',
            password: 'admin123', // Will be hashed automatically
            role: 'admin'
        });

        await admin.save();
        console.log('🎉 ADMIN CREATED SUCCESSFULLY');
        console.log('================================');
        console.log('Email: admin@example.com');
        console.log('Password: admin123');
        console.log('Role: admin');
        console.log('================================');
        console.log('Please change the password after first login!');

        process.exit(0);
    } catch (err) {
        console.error('❌ Error creating admin:', err.message);
        console.error('Stack:', err.stack);
        process.exit(1);
    }
}

createAdmin();