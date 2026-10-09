const User = require('../models/User.model');
const Review = require('../models/Review.model');
const WatchlistItem = require('../models/WatchlistItem.model');
const Activity = require('../models/Activity.model');
const Title = require('../models/Title.model');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');

// GET /users/:username
const getUserByUsername = asyncHandler(async (req, res) => {
  const { username } = req.params;

  const user = await User.findOne({ username: username.toLowerCase() }).lean();
  if (!user) throw new ApiError(404, `User '@${username}' not found.`);

  const [reviewsCount, watchedCount, recentReviews, activityTimeline] = await Promise.all([
    Review.countDocuments({ user: user._id, status: 'published' }),
    WatchlistItem.countDocuments({ user: user._id, status: 'watched' }),
    Review.find({ user: user._id, status: 'published' })
      .sort({ createdAt: -1 })
      .limit(6)
      .lean(),
    Activity.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),
  ]);

  // Critic Insights calculation (gated feature for critic plan or critic role)
  let criticInsights = null;
  if (user.role === 'critic' || user.plan === 'critic') {
    const agg = await Review.aggregate([
      { $match: { user: user._id, status: 'published' } },
      { $group: { _id: null, avgRating: { $avg: '$rating' }, total: { $sum: 1 } } },
    ]);
    if (agg.length > 0) {
      criticInsights = {
        avgRatingGiven: Math.round(agg[0].avgRating * 10) / 10,
        totalReviewsGiven: agg[0].total,
      };
    }
  }

  const profileData = {
    _id: user._id,
    name: user.name,
    username: user.username,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    role: user.role,
    plan: user.plan,
    favourites: user.favourites || [],
    stats: {
      reviewsCount,
      watchedCount,
      favouritesCount: user.favourites ? user.favourites.length : 0,
    },
    recentReviews,
    activityTimeline,
    criticInsights,
    createdAt: user.createdAt,
  };

  res.status(200).json(new ApiResponse(200, profileData, 'User profile retrieved successfully.'));
});

// PATCH /users/me
const updateProfile = asyncHandler(async (req, res) => {
  const { name, bio, avatarUrl } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) throw new ApiError(404, 'User not found.');

  if (name) user.name = name.trim();
  if (typeof bio === 'string') user.bio = bio.trim();
  if (typeof avatarUrl === 'string') user.avatarUrl = avatarUrl.trim();

  await user.save();

  res.status(200).json(new ApiResponse(200, { user }, 'Profile updated successfully!'));
});

// GET /users/me/activity
const getMyActivity = asyncHandler(async (req, res) => {
  const activities = await Activity.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(30)
    .lean();

  res.status(200).json(new ApiResponse(200, { items: activities }, 'Activity timeline loaded.'));
});

// POST /favourites (Toggle favourite)
const toggleFavourite = asyncHandler(async (req, res) => {
  const { imdbID, mediaType, title, posterUrl, year } = req.body;
  if (!imdbID) throw new ApiError(400, 'imdbID is required.');

  const user = await User.findById(req.user._id);
  const existsIndex = user.favourites.findIndex((f) => f.imdbID === imdbID);

  let isFavourited = false;
  if (existsIndex > -1) {
    user.favourites.splice(existsIndex, 1);
  } else {
    const titleDoc = await Title.findOne({ imdbID });
    user.favourites.push({
      imdbID,
      mediaType: mediaType || titleDoc?.type || 'movie',
      title: title || titleDoc?.title || '',
      posterUrl: posterUrl || titleDoc?.posterUrl || '',
      year: year || titleDoc?.year || '',
    });
    isFavourited = true;

    await Activity.create({
      user: req.user._id,
      type: 'favourited',
      imdbID,
      mediaType: mediaType || 'movie',
      title: title || '',
    });
  }

  await user.save();

  res.status(200).json(
    new ApiResponse(
      200,
      { favourites: user.favourites, isFavourited },
      isFavourited ? 'Added to favourites!' : 'Removed from favourites.'
    )
  );
});

// POST /billing/demo-upgrade (Critick Pro Demo Upgrade)
const demoUpgradePlan = asyncHandler(async (req, res) => {
  const { plan } = req.body;
  if (!['free', 'pro', 'critic'].includes(plan)) {
    throw new ApiError(400, "Invalid plan selection. Options: 'free', 'pro', 'critic'.");
  }

  const user = await User.findById(req.user._id);
  user.plan = plan;
  if (plan === 'critic' && user.role === 'user') {
    user.role = 'critic'; // Elevate role for critic plan badge
  }
  await user.save();

  res.status(200).json(
    new ApiResponse(
      200,
      { user: { _id: user._id, plan: user.plan, role: user.role } },
      `Demo Subscription successful! You are now on the Critick ${plan.toUpperCase()} plan.`
    )
  );
});

module.exports = {
  getUserByUsername,
  updateProfile,
  getMyActivity,
  toggleFavourite,
  demoUpgradePlan,
};
