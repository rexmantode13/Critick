const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/env');
const User = require('../models/User.model');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');
const logger = require('../utils/logger');

// Generate JWT tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, config.jwtAccessSecret, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id: userId }, config.jwtRefreshSecret, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

// Set secure cookies
const setTokenCookies = (res, accessToken, refreshToken) => {
  const isProd = config.env === 'production';
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000, // 15 mins
  });

  if (refreshToken) {
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }
};

const clearTokenCookies = (res) => {
  res.clearCookie('accessToken', { httpOnly: true, sameSite: 'lax' });
  res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'lax' });
};

// REGISTER
const register = asyncHandler(async (req, res) => {
  const { name, username, email, password } = req.body;

  if (!name || !username || !email || !password) {
    throw new ApiError(400, 'All fields (name, username, email, password) are required.');
  }

  // Password rules: min 8 chars, uppercase, lowercase, number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  if (!passwordRegex.test(password)) {
    throw new ApiError(400, 'Password must be at least 8 characters with at least one uppercase letter, one lowercase letter, and one number.');
  }

  // Check existing user
  const existing = await User.findOne({
    $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }],
  });

  if (existing) {
    if (existing.email.toLowerCase() === email.toLowerCase()) {
      throw new ApiError(400, 'An account with this email address already exists.');
    } else {
      throw new ApiError(400, 'This username is already taken. Please choose another.');
    }
  }

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    username: username.toLowerCase(),
    email: email.toLowerCase(),
    passwordHash,
    role: 'user',
    plan: 'free',
  });

  const { accessToken, refreshToken } = generateTokens(user._id);

  // Save refresh token
  user.refreshTokens = [refreshToken];
  await user.save();

  setTokenCookies(res, accessToken, refreshToken);

  const userData = {
    _id: user._id,
    name: user.name,
    username: user.username,
    email: user.email,
    avatarUrl: user.avatarUrl,
    role: user.role,
    plan: user.plan,
    bio: user.bio,
    createdAt: user.createdAt,
  };

  res.status(201).json(new ApiResponse(201, { user: userData }, 'Account registered successfully!'));
});

// LOGIN
const login = asyncHandler(async (req, res) => {
  const { emailOrUsername, password } = req.body;

  if (!emailOrUsername || !password) {
    throw new ApiError(400, 'Email/Username and password are required.');
  }

  const user = await User.findOne({
    $or: [{ email: emailOrUsername.toLowerCase() }, { username: emailOrUsername.toLowerCase() }],
  }).select('+passwordHash +refreshTokens');

  if (!user) {
    // Generic error to prevent user enumeration
    throw new ApiError(401, 'Invalid credentials. Please check your email/username and password.');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid credentials. Please check your email/username and password.');
  }

  const { accessToken, refreshToken } = generateTokens(user._id);

  // Keep up to 5 refresh tokens for multi-device support
  user.refreshTokens = [...(user.refreshTokens || []).slice(-4), refreshToken];
  await user.save();

  setTokenCookies(res, accessToken, refreshToken);

  const userData = {
    _id: user._id,
    name: user.name,
    username: user.username,
    email: user.email,
    avatarUrl: user.avatarUrl,
    role: user.role,
    plan: user.plan,
    bio: user.bio,
    favourites: user.favourites,
    createdAt: user.createdAt,
  };

  res.status(200).json(new ApiResponse(200, { user: userData }, 'Sign in successful!'));
});

// LOGOUT
const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (refreshToken && req.user) {
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { refreshTokens: refreshToken },
    });
  }

  clearTokenCookies(res);
  res.status(200).json(new ApiResponse(200, null, 'Signed out successfully.'));
});

// REFRESH TOKEN
const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    throw new ApiError(401, 'Refresh token missing.');
  }

  try {
    const decoded = jwt.verify(refreshToken, config.jwtRefreshSecret);
    const user = await User.findById(decoded.id).select('+refreshTokens');

    if (!user || !user.refreshTokens.includes(refreshToken)) {
      clearTokenCookies(res);
      throw new ApiError(401, 'Invalid or revoked refresh token. Please sign in again.');
    }

    // Generate new access token
    const newAccessToken = jwt.sign({ id: user._id }, config.jwtAccessSecret, { expiresIn: '15m' });
    setTokenCookies(res, newAccessToken, null);

    res.status(200).json(new ApiResponse(200, { accessToken: newAccessToken }, 'Token refreshed successfully.'));
  } catch (error) {
    clearTokenCookies(res);
    throw new ApiError(401, 'Session expired. Please sign in again.');
  }
});

// GET CURRENT USER ME
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.status(200).json(new ApiResponse(200, { user }, 'Current user profile'));
});

// FORGOT PASSWORD
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new ApiError(400, 'Email address is required.');

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    // Return generic success to avoid user enumeration
    return res
      .status(200)
      .json(new ApiResponse(200, null, 'If an account with that email exists, a password reset link has been logged.'));
  }

  // Create reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 mins
  await user.save();

  const resetUrl = `${config.clientUrl}/reset-password/${resetToken}`;
  logger.info(`🔑 [DEVELOPMENT RESET LINK] Reset URL for ${user.email}: ${resetUrl}`);

  res
    .status(200)
    .json(new ApiResponse(200, { devResetUrl: config.env === 'development' ? resetUrl : undefined }, 'Password reset link generated.'));
});

// RESET PASSWORD
const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password || password.length < 8) {
    throw new ApiError(400, 'Password must be at least 8 characters long.');
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, 'Password reset token is invalid or has expired.');
  }

  const salt = await bcrypt.genSalt(12);
  user.passwordHash = await bcrypt.hash(password, salt);
  user.resetPasswordToken = null;
  user.resetPasswordExpire = null;
  user.refreshTokens = [];
  await user.save();

  res.status(200).json(new ApiResponse(200, null, 'Password reset successful! You can now sign in with your new password.'));
});

module.exports = {
  register,
  login,
  logout,
  refresh,
  getMe,
  forgotPassword,
  resetPassword,
};
