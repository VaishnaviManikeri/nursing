const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Define User schema inline (same as your models/User.js)
const userSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: [true, 'Username is required'], 
        unique: true,
        trim: true
    },
    email: { 
        type: String, 
        required: [true, 'Email is required'], 
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },
    password: { 
        type: String, 
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters']
    },
    role: { 
        type: String, 
        enum: ['admin', 'editor'], 
        default: 'editor' 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

// FIXED: Pre-save hook for password hashing
userSchema.pre('save', async function() {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) return;
    
    // Hash the password with cost factor of 10
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Alternative: If you want to use callback style (old way)
// userSchema.pre('save', function(next) {
//     if (!this.isModified('password')) return next();
    
//     bcrypt.genSalt(10, (err, salt) => {
//         if (err) return next(err);
        
//         bcrypt.hash(this.password, salt, (err, hash) => {
//             if (err) return next(err);
//             this.password = hash;
//             next();
//         });
//     });
// });

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

async function createAdmin() {
    try {
        console.log('🚀 Starting admin creation process...');
        console.log('========================================');
        
        // Use the same connection string as testConnection.js
        const mongoUri = 'mongodb+srv://nursing:jadhavar1@cluster0.ykycbzj.mongodb.net/test?retryWrites=true&w=majority';
        
        console.log('🔗 Connecting to database: test');
        console.log('📋 MongoDB URI:', mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
        
        // Connect to MongoDB
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(mongoUri);
        console.log('✅ MongoDB connected successfully!');
        
        // Check if "users" collection exists
        const collections = await mongoose.connection.db.listCollections().toArray();
        const usersCollectionExists = collections.some(c => c.name === 'users');
        console.log(`📁 Users collection exists: ${usersCollectionExists ? '✅ Yes' : '❌ No'}`);
        
        if (!usersCollectionExists) {
            console.log('📝 Creating "users" collection...');
        }
        
        // List all users to see what's already there
        console.log('\n🔍 Checking existing users in database...');
        const existingUsers = await User.find({}).catch(err => {
            console.log('⚠️  No users collection or error reading:', err.message);
            return [];
        });
        
        console.log(`📊 Total users found: ${existingUsers.length}`);
        
        if (existingUsers.length > 0) {
            console.log('\n👥 Existing users:');
            existingUsers.forEach((user, index) => {
                console.log(`  ${index + 1}. ${user.email} (${user.role}) - ${user.username}`);
            });
        }
        
        // Check if admin already exists
        const adminEmail = 'admin@example.com';
        let existingAdmin;
        
        try {
            existingAdmin = await User.findOne({ email: adminEmail });
        } catch (err) {
            console.log('⚠️  Error finding user:', err.message);
            existingAdmin = null;
        }
        
        if (existingAdmin) {
            console.log(`\n⚠️  Admin user '${adminEmail}' already exists!`);
            console.log('👤 Details:');
            console.log(`   Email: ${existingAdmin.email}`);
            console.log(`   Username: ${existingAdmin.username}`);
            console.log(`   Role: ${existingAdmin.role}`);
            console.log(`   ID: ${existingAdmin._id}`);
            
            // Test the password
            console.log('\n🔐 Testing password "admin123"...');
            try {
                const isValid = await bcrypt.compare('admin123', existingAdmin.password);
                console.log(`🔑 Password "admin123" is: ${isValid ? '✅ VALID' : '❌ INVALID'}`);
                
                if (isValid) {
                    console.log('\n🎉 You can login with:');
                    console.log('   Email: admin@example.com');
                    console.log('   Password: admin123');
                } else {
                    console.log('\n💡 Password does not match "admin123"');
                    console.log('   Try resetting the password:');
                    console.log('   node resetAdminPassword.js');
                }
            } catch (err) {
                console.log('⚠️  Could not test password:', err.message);
            }
            
        } else {
            // Create new admin user
            console.log('\n👷 Creating new admin user...');
            
            const admin = new User({
                username: 'admin',
                email: adminEmail,
                password: 'admin123', // Will be hashed by pre-save hook
                role: 'admin'
            });
            
            try {
                await admin.save();
                console.log('✅ User saved successfully!');
                
                console.log('\n🎉 ADMIN USER CREATED SUCCESSFULLY!');
                console.log('========================================');
                console.log('📧 Email: admin@example.com');
                console.log('🔑 Password: admin123');
                console.log('👤 Role: admin');
                console.log('🆔 ID:', admin._id);
                console.log('📅 Created:', admin.createdAt);
                console.log('========================================');
                
                // Verify the user was saved
                const savedAdmin = await User.findOne({ email: adminEmail });
                if (savedAdmin) {
                    console.log('✅ Verification: User saved in database');
                    console.log('✅ Hashed password stored:', savedAdmin.password ? 'Yes' : 'No');
                }
                
            } catch (saveError) {
                console.error('❌ Error saving user:', saveError.message);
                
                if (saveError.code === 11000) {
                    console.log('💡 Duplicate key error - user already exists');
                    console.log('Try: db.users.deleteOne({email: "admin@example.com"}) in MongoDB');
                }
            }
        }
        
        // Test login with the user
        console.log('\n🔐 Testing login simulation...');
        const testUser = await User.findOne({ email: adminEmail });
        if (testUser) {
            console.log('✅ User found in database');
            console.log('✅ Email:', testUser.email);
            console.log('✅ Role:', testUser.role);
            console.log('✅ Username:', testUser.username);
            
            // Test password comparison
            console.log('\n🔐 Testing password comparison...');
            const passwordMatch = await testUser.comparePassword('admin123');
            console.log(`✅ Password "admin123" matches: ${passwordMatch ? 'Yes' : 'No'}`);
            
            if (passwordMatch) {
                console.log('\n✨ Everything is working! You can now login.');
                console.log('👉 Use these credentials in your frontend:');
                console.log('   Email: admin@example.com');
                console.log('   Password: admin123');
            }
        } else {
            console.log('❌ User not found after creation');
        }
        
        await mongoose.disconnect();
        console.log('\n👋 Disconnected from MongoDB');
        console.log('✨ Process completed!');
        
        process.exit(0);
        
    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        console.error('Stack:', error.stack);
        
        if (error.code === 11000) {
            console.log('💡 Duplicate key error - user already exists');
        }
        
        if (mongoose.connection.readyState === 1) {
            await mongoose.disconnect();
        }
        
        process.exit(1);
    }
}

// Run the function
createAdmin();