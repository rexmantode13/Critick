const Title = require('../models/Title.model');
const Review = require('../models/Review.model');
const User = require('../models/User.model');
const WatchlistItem = require('../models/WatchlistItem.model');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

// GET /stats (Real database counts)
const getStats = asyncHandler(async (req, res) => {
  const [totalTitles, totalReviews, totalUsers, totalWatchlists] = await Promise.all([
    Title.countDocuments(),
    Review.countDocuments({ status: 'published' }),
    User.countDocuments(),
    WatchlistItem.countDocuments(),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        totalTitles,
        totalReviews,
        totalUsers,
        totalWatchlists,
      },
      'Platform statistics loaded'
    )
  );
});

module.exports = {
  getStats,
};
