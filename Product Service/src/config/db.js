const mongoose = require('mongoose');
const logger = require('./logger');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10, // Adjust based on load
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 45000,
    });
    logger.info('Connected to MongoDB Atlas');
  } catch (error) {
    logger.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

module.exports = { connectDB };