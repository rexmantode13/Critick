const mongoose = require('mongoose');

const titleSchema = new mongoose.Schema(
  {
    imdbID: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['movie', 'series'],
      default: 'movie',
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    year: {
      type: String,
      default: '',
    },
    startYear: {
      type: Number,
      index: true,
    },
    endYear: {
      type: Number,
    },
    rated: {
      type: String,
      default: 'Not Rated',
    },
    released: {
      type: Date,
      index: true,
    },
    runtimeMinutes: {
      type: Number,
      default: null,
    },
    genres: {
      type: [String],
      default: [],
      index: true,
    },
    directors: {
      type: [String],
      default: [],
    },
    writers: {
      type: [String],
      default: [],
    },
    actors: {
      type: [String],
      default: [],
    },
    plot: {
      type: String,
      default: '',
    },
    languages: {
      type: [String],
      default: [],
    },
    countries: {
      type: [String],
      default: [],
    },
    awards: {
      type: String,
      default: 'N/A',
    },
    posterUrl: {
      type: String,
      default: '',
    },
    imdbRating: {
      type: Number,
      default: null,
      index: true,
    },
    imdbVotes: {
      type: Number,
      default: null,
      index: true,
    },
    metascore: {
      type: Number,
      default: null,
    },
    ratings: {
      rottenTomatoes: { type: String, default: null },
      metacritic: { type: String, default: null },
    },
    totalSeasons: {
      type: Number,
      default: null,
    },
    boxOffice: {
      type: String,
      default: 'N/A',
    },
    production: {
      type: String,
      default: 'N/A',
    },
    source: {
      type: String,
      enum: ['seed', 'search', 'view'],
      default: 'search',
    },
    addedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    fetchedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Text Index for full-text search across titles, actors, directors, genres
titleSchema.index({
  title: 'text',
  actors: 'text',
  directors: 'text',
  genres: 'text',
}, {
  weights: {
    title: 10,
    actors: 5,
    directors: 5,
    genres: 3,
  },
  name: 'title_search_text_index',
});

module.exports = mongoose.model('Title', titleSchema);
