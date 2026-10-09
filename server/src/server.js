const app = require('./app');
const config = require('./config/env');
const connectDB = require('./config/db');
const omdbService = require('./services/omdb.service');
const logger = require('./utils/logger');

const startServer = async () => {
  // 1. Try to connect to MongoDB (non-fatal — server starts regardless)
  try {
    await connectDB();
  } catch (err) {
    logger.error('⚠️  MongoDB connection failed on startup. Server will start anyway.');
    logger.error('   Requests requiring the database will fail until connection is restored.');
    logger.error(`   Error: ${err.message}`);
    
    // Retry connection in background every 30 seconds
    const retryInterval = setInterval(async () => {
      try {
        await connectDB();
        logger.info('✅ [MongoDB] Reconnected successfully on background retry.');
        clearInterval(retryInterval);
      } catch (retryErr) {
        logger.error(`🔄 [MongoDB] Retry failed: ${retryErr.message}`);
      }
    }, 30000);
  }

  // 2. Verify OMDb API Key (non-fatal)
  try {
    const isOmdbValid = await omdbService.verifyApiKeyOnStartup();
    if (!isOmdbValid) {
      console.warn('⚠️  Server started with unverified OMDb Key. Cached database fallback will be used when available.');
    }
  } catch (omdbErr) {
    console.warn('⚠️  OMDb API key verification failed:', omdbErr.message);
  }

  // 3. Listen on Port
  const server = app.listen(config.port, () => {
    logger.info(`🚀 [Critick Server] Listening on http://localhost:${config.port} (${config.env} mode)`);
  });

  // Handle Unhandled Rejections
  process.on('unhandledRejection', (err) => {
    logger.error('Unhandled Promise Rejection:', err.message);
  });
};

startServer();
