const mongoose = require('mongoose');

const watchlistItemSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    imdbID: {
      type: String,
      required: true,
      index: true,
    },
    mediaType: {
      type: String,
      enum: ['movie', 'series'],
      default: 'movie',
    },
    title: {
      type: String,
      default: '',
    },
    posterUrl: {
      type: String,
      default: '',
    },
    year: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['planned', 'watched'],
      default: 'planned',
      index: true,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
    watchedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

watchlistItemSchema.index({ user: 1, imdbID: 1 }, { unique: true });

module.exports = mongoose.model('WatchlistItem', watchlistItemSchema);
