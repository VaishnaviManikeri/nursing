const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function resetAdminPassword() {
    try {
        const mongoUri = 'mongodb+srv://nursing:jadhavar1@cluster0.ykycbzj.mongodb.net/test?retryWrites=true&w=majority';
        
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');
        
        // Get the User model
        const User = mongoose.model('User', new mongoose.Schema({
            username: String,
            email: String,
            password: String,
            role: String
        }));
        
        // Find admin user
        const admin = await User.findOne({ email: 'admin@example.com' });
        
        if (!admin) {
            console.log('❌ Admin user not found');
            await mongoose.disconnect();
            return;
        }
        
        console.log('👤 Found admin user:', admin.email);
        console.log('🔑 Current password hash:', admin.password.substring(0, 20) + '...');
        
        // Hash new password
        const newPassword = 'admin123';
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        
        // Update password
        admin.password = hashedPassword;
        await admin.save();
        
        console.log('✅ Password updated successfully!');
        console.log('📧 Email: admin@example.com');
        console.log('🔑 New Password: admin123');
        console.log('🔐 New Hash:', hashedPassword.substring(0, 20) + '...');
        
        // Verify
        const isValid = await bcrypt.compare(newPassword, admin.password);
        console.log(`✅ Password verification: ${isValid ? 'SUCCESS' : 'FAILED'}`);
        
        await mongoose.disconnect();
        console.log('👋 Disconnected');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (mongoose.connection.readyState === 1) {
            await mongoose.disconnect();
        }
    }
}

resetAdminPassword();