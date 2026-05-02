const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error('MONGO_URI is missing. Add it to backend/.env');
  }

  await mongoose.connect(mongoUri, {
    dbName: process.env.MONGO_DB_NAME || 'krushimitra'
  });
};

module.exports = connectDB;

