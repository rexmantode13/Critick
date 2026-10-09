const logger = require('../utils/logger');
const config = require('../config/env');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message || 'Internal Server Error';
  error.statusCode = err.statusCode || 500;

  // Log error with redaction
  logger.error(`[API Error ${error.statusCode}] ${req.method} ${req.originalUrl} - ${error.message}`);

  // Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    error.statusCode = 400;
    error.message = `Resource not found with invalid ID format: ${err.value}`;
  }

  // Mongoose Duplicate Key (11000)
  if (err.code === 11000) {
    error.statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    error.message = `An entry with this ${field} already exists.`;
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    error.statusCode = 400;
    error.message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
  }

  // Sanitize message to prevent leaking apikey or upstream URLs
  const sanitizedMessage = logger.sanitize(error.message);

  res.status(error.statusCode).json({
    success: false,
    message: sanitizedMessage,
    errors: error.errors || [],
    ...(config.env === 'development' && { stack: logger.sanitize(err.stack) }),
  });
};

module.exports = errorHandler;
