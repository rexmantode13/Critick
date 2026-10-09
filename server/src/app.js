const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const morgan = require('morgan');
const compression = require('compression');
const config = require('./config/env');
const apiRoutes = require('./routes');
const errorHandler = require('./middleware/error.middleware');
const { apiLimiter } = require('./middleware/rateLimiter.middleware');

const app = express();

// Security Headers with Helmet and CSP configuration
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: [
          "'self'",
          'data:',
          'https://m.media-amazon.com',
          'https://ia.media-imdb.com',
          'https://*.media-amazon.com',
        ],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        connectSrc: ["'self'", config.clientUrl],
      },
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Strict CORS
app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Logging & Compression
if (config.env === 'development') {
  app.use(morgan('dev'));
}
app.use(compression());

// Body Parsing & Cookie Parser
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// Mongo Sanitize against NoSQL injection
app.use(mongoSanitize());

// Rate Limiting
app.use('/api', apiLimiter);

// Health Check Route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    app: 'Critick API',
    environment: config.env,
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/v1', apiRoutes);

// 404 Handler for unknown routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Central Error Handler
app.use(errorHandler);

module.exports = app;
