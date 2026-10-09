const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 60,
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores'],
      index: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
    },
    avatarUrl: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: '',
      maxlength: 300,
    },
    role: {
      type: String,
      enum: ['user', 'critic', 'admin'],
      default: 'user',
    },
    plan: {
      type: String,
      enum: ['free', 'pro', 'critic'],
      default: 'free',
    },
    favourites: [
      {
        imdbID: { type: String, required: true },
        mediaType: { type: String, enum: ['movie', 'series'], default: 'movie' },
        title: { type: String },
        posterUrl: { type: String },
        year: { type: String },
        addedAt: { type: Date, default: Date.now },
      },
    ],
    refreshTokens: {
      type: [String],
      default: [],
      select: false,
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpire: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

module.exports = mongoose.model('User', userSchema);
