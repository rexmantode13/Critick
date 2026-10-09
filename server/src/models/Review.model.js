const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
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
    titleSnapshot: {
      type: String,
      default: '',
    },
    posterUrlSnapshot: {
      type: String,
      default: '',
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required (1-5 stars)'],
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      required: [true, 'Review title is required'],
      trim: true,
      minlength: 3,
      maxlength: 100,
    },
    body: {
      type: String,
      required: [true, 'Review body is required'],
      trim: true,
      minlength: 20,
      maxlength: 5000,
    },
    containsSpoilers: {
      type: Boolean,
      default: false,
    },
    helpfulVotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    replyCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['published', 'flagged', 'hidden'],
      default: 'published',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// One review per user per title
reviewSchema.index({ user: 1, imdbID: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
