const mongoose = require('mongoose');
const config = require('./env');
const dns = require('dns');

// Configure public DNS resolvers to prevent querySrv ECONNREFUSED issues on Windows/ISPs
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {
  // Safe fallback — system resolvers will be used
}

let isConnecting = false;

const connectDB = async () => {
  // Already connected — reuse
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // Another call is already trying to connect
  if (isConnecting) {
    return new Promise((resolve, reject) => {
      mongoose.connection.once('connected', () => resolve(mongoose.connection));
      mongoose.connection.once('error', reject);
    });
  }

  isConnecting = true;

  try {
    const conn = await mongoose.connect(config.mongodbUri, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
    });
    console.log(`✅ [MongoDB] Connected to database: ${conn.connection.host}/${conn.connection.name}`);
    isConnecting = false;
    return conn;
  } catch (error) {
    isConnecting = false;
    console.error(`❌ [MongoDB] Connection error: ${error.message}`);
    console.error('💡 Please make sure MongoDB service is running or check your MONGODB_URI');
    console.error('💡 If using Atlas, ensure your IP is whitelisted (0.0.0.0/0 for all access)');
    throw error;
  }
};

module.exports = connectDB;
