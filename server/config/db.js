import mongoose from 'mongoose';
import { getRequiredEnv } from './env.js';

const connectDB = async () => {
  try {
    const mongoURI = getRequiredEnv('MONGODB_URI');
    
    // Configure mongoose connection options for better compatibility with cloud environments
    const conn = await mongoose.connect(mongoURI, {
      // These options help with connection stability in cloud environments
      serverSelectionTimeoutMS: 30000, // Increase timeout for cloud connections
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    console.error('Please check your MONGODB_URI environment variable and ensure MongoDB Atlas is accessible.');
    throw error;
  }
};

export default connectDB;
