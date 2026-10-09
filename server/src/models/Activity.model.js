const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['reviewed', 'rated', 'watchlisted', 'watched', 'favourited', 'viewed'],
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
  },
  {
    timestamps: true,
  }
);

activitySchema.index({ createdAt: -1 });

module.exports = mongoose.model('Activity', activitySchema);
