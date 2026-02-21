const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI is not set in environment');
    process.exit(1);
  }

  try {
    // Mongoose 7+ and 9+ use sensible defaults; do not pass deprecated connection options
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message || err);
    console.log('⚠️  Make sure your MongoDB is running (local or Atlas)');
    console.log('📝 Current MONGO_URI:', uri);
    
    // Retry once after 3 seconds
    setTimeout(() => {
      console.log('🔄 Retrying MongoDB connection...');
      connectDB();
    }, 3000);
  }
};

module.exports = connectDB;
