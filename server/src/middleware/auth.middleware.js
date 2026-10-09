const jwt = require('jsonwebtoken');
const config = require('../config/env');
const ApiError = require('../utils/apiError');
const User = require('../models/User.model');

const protect = async (req, res, next) => {
  let token;

  // Read access token from httpOnly cookie or Authorization Bearer header
  if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new ApiError(401, 'Authentication required. Please sign in.'));
  }

  try {
    const decoded = jwt.verify(token, config.jwtAccessSecret);
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new ApiError(401, 'User account no longer exists.'));
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Session expired. Token refresh required.'));
    }
    return next(new ApiError(401, 'Invalid authentication token.'));
  }
};

// Optional auth: attaches req.user if logged in, but does not block if guest
const optionalAuth = async (req, res, next) => {
  let token;
  if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, config.jwtAccessSecret);
    const user = await User.findById(decoded.id);
    req.user = user || null;
  } catch (e) {
    req.user = null;
  }
  next();
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(403, `User role '${req.user?.role || 'guest'}' is not authorized to perform this action.`));
    }
    next();
  };
};

module.exports = {
  protect,
  optionalAuth,
  authorize,
};
