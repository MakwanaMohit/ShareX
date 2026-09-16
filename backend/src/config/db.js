const mongoose = require("mongoose");
try {
  require("dns").setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {}

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.warn("MONGODB_URI is not defined in environment variables");
      return;
    }
    const options = process.env.DB_NAME ? { dbName: process.env.DB_NAME } : {};
    const conn = await mongoose.connect(process.env.MONGODB_URI, options);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
  }
};

module.exports = connectDB;
