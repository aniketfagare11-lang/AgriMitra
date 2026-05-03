const mongoose = require('mongoose');

// Connect to MongoDB Atlas using direct shard connection (no SRV lookup needed)
const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  const dbName = process.env.MONGO_DB_NAME || 'agrimitra';

  if (!uri) {
    throw new Error('MONGO_URI is missing. Please set it in your .env file.');
  }

  await mongoose.connect(uri, {
    dbName,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    family: 4, // force IPv4
  });

  console.log('✅ MongoDB Connected');
};

module.exports = connectDB;
