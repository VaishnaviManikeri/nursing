const mongoose = require('mongoose');

async function testConnection() {
    try {
        console.log('Testing MongoDB connection...');
        
        // Use your connection string
        const uri = 'mongodb+srv://nursing:jadhavar1@cluster0.ykycbzj.mongodb.net/test?retryWrites=true&w=majority';
        
        await mongoose.connect(uri);
        console.log('✅ MongoDB Connected Successfully!');
        
        // Check the connection
        console.log('Connection state:', mongoose.connection.readyState);
        console.log('Database name:', mongoose.connection.db?.databaseName);
        
        // List collections to verify access
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections in database:', collections.map(c => c.name));
        
        await mongoose.disconnect();
        console.log('Disconnected');
        process.exit(0);
        
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error.message);
        console.error('Error details:', error);
        process.exit(1);
    }
}

testConnection();