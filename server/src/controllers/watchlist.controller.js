const WatchlistItem = require('../models/WatchlistItem.model');
const Title = require('../models/Title.model');
const Activity = require('../models/Activity.model');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');

// GET /watchlist
const getWatchlist = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = { user: req.user._id };
  if (status && ['planned', 'watched'].includes(status)) {
    filter.status = status;
  }

  const items = await WatchlistItem.find(filter).sort({ addedAt: -1 }).lean();

  res.status(200).json(new ApiResponse(200, { items }, 'Watchlist items loaded'));
});

// POST /watchlist
const addToWatchlist = asyncHandler(async (req, res) => {
  const { imdbID, mediaType, title, posterUrl, year } = req.body;

  if (!imdbID) throw new ApiError(400, 'imdbID is required.');

  const existing = await WatchlistItem.findOne({ user: req.user._id, imdbID });
  if (existing) {
    return res.status(200).json(new ApiResponse(200, { item: existing }, 'Title is already in your watchlist.'));
  }

  const titleDoc = await Title.findOne({ imdbID });

  const item = await WatchlistItem.create({
    user: req.user._id,
    imdbID,
    mediaType: mediaType || titleDoc?.type || 'movie',
    title: title || titleDoc?.title || '',
    posterUrl: posterUrl || titleDoc?.posterUrl || '',
    year: year || titleDoc?.year || '',
    status: 'planned',
  });

  await Activity.create({
    user: req.user._id,
    type: 'watchlisted',
    imdbID,
    mediaType: item.mediaType,
    title: item.title,
  });

  res.status(201).json(new ApiResponse(201, { item }, 'Added to watchlist!'));
});

// PATCH /watchlist/:id (Toggle status)
const updateWatchlistStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['planned', 'watched'].includes(status)) {
    throw new ApiError(400, "Status must be either 'planned' or 'watched'.");
  }

  const item = await WatchlistItem.findOne({ _id: id, user: req.user._id });
  if (!item) throw new ApiError(404, 'Watchlist item not found.');

  item.status = status;
  if (status === 'watched') {
    item.watchedAt = new Date();
    await Activity.create({
      user: req.user._id,
      type: 'watched',
      imdbID: item.imdbID,
      mediaType: item.mediaType,
      title: item.title,
    });
  } else {
    item.watchedAt = null;
  }

  await item.save();

  res.status(200).json(new ApiResponse(200, { item }, `Watchlist item marked as ${status}.`));
});

// DELETE /watchlist/:id
const removeFromWatchlist = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const item = await WatchlistItem.findOneAndDelete({
    $or: [{ _id: id, user: req.user._id }, { imdbID: id, user: req.user._id }],
  });

  if (!item) throw new ApiError(404, 'Watchlist item not found.');

  res.status(200).json(new ApiResponse(200, null, 'Removed from watchlist.'));
});

module.exports = {
  getWatchlist,
  addToWatchlist,
  updateWatchlistStatus,
  removeFromWatchlist,
};
