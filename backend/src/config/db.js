const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI is not set in environment');
    process.exit(1);
  }

  try {
    // Mongoose 7+ and 9+ use sensible defaults; do not pass deprecated connection options
    await mongoose.connect(uri);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message || err);
    process.exit(1);
  }
};

module.exports = connectDB;
