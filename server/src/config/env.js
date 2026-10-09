const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  env: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/critick',
  omdbApiKey: process.env.OMDB_API_KEY || '',
  omdbDailyLimit: parseInt(process.env.OMDB_DAILY_LIMIT || '1000', 10),
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || 'critick_access_jwt_secret_key_2026',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'critick_refresh_jwt_secret_key_2026',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
};

function validateEnv() {
  const missing = [];
  if (!config.mongodbUri) missing.push('MONGODB_URI');
  if (!config.jwtAccessSecret) missing.push('JWT_ACCESS_SECRET');
  if (!config.jwtRefreshSecret) missing.push('JWT_REFRESH_SECRET');

  if (missing.length > 0) {
    console.error(`❌ [ENV ERROR] Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
}

validateEnv();

module.exports = config;
