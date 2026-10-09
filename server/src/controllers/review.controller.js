const Review = require('../models/Review.model');
const Reply = require('../models/Reply.model');
const Report = require('../models/Report.model');
const Title = require('../models/Title.model');
const Activity = require('../models/Activity.model');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');

// GET /reviews (All reviews across platform)
const getReviews = asyncHandler(async (req, res) => {
  const { sort = 'latest', page = 1, limit = 10 } = req.query;

  let sortOptions = { createdAt: -1 };
  if (sort === 'helpful') sortOptions = { 'helpfulVotes.length': -1, createdAt: -1 };
  else if (sort === 'top-rated') sortOptions = { rating: -1, createdAt: -1 };
  else if (sort === 'discussed') sortOptions = { replyCount: -1, createdAt: -1 };

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const skip = (pageNum - 1) * limitNum;

  const [reviews, totalItems] = await Promise.all([
    Review.find({ status: 'published' })
      .populate('user', 'name username avatarUrl role plan')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Review.countDocuments({ status: 'published' }),
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      items: reviews,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalItems,
        totalPages: Math.ceil(totalItems / limitNum),
      },
    }, 'Reviews fetched successfully')
  );
});

// GET /titles/:imdbID/reviews
const getTitleReviews = asyncHandler(async (req, res) => {
  const { imdbID } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const skip = (pageNum - 1) * limitNum;

  const [reviews, totalItems] = await Promise.all([
    Review.find({ imdbID, status: 'published' })
      .populate('user', 'name username avatarUrl role plan')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Review.countDocuments({ imdbID, status: 'published' }),
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      items: reviews,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalItems,
        totalPages: Math.ceil(totalItems / limitNum),
      },
    }, 'Title reviews fetched successfully')
  );
});

// POST /reviews (Create review)
const createReview = asyncHandler(async (req, res) => {
  const { imdbID, rating, title, body, containsSpoilers = false } = req.body;

  if (!imdbID || !rating || !title || !body) {
    throw new ApiError(400, 'Missing required review fields (imdbID, rating, title, body).');
  }

  if (rating < 1 || rating > 5) {
    throw new ApiError(400, 'Rating must be between 1 and 5 stars.');
  }

  if (title.length < 3 || title.length > 100) {
    throw new ApiError(400, 'Review title must be between 3 and 100 characters.');
  }

  if (body.length < 20 || body.length > 5000) {
    throw new ApiError(400, 'Review body must be between 20 and 5000 characters.');
  }

  // Check if user already reviewed this title
  const existing = await Review.findOne({ user: req.user._id, imdbID });
  if (existing) {
    throw new ApiError(400, 'You have already reviewed this title. You can edit your existing review instead.');
  }

  // Fetch title details for snapshot
  const titleDoc = await Title.findOne({ imdbID });

  const review = await Review.create({
    user: req.user._id,
    imdbID,
    mediaType: titleDoc?.type || 'movie',
    titleSnapshot: titleDoc?.title || '',
    posterUrlSnapshot: titleDoc?.posterUrl || '',
    rating: parseInt(rating, 10),
    title,
    body,
    containsSpoilers: Boolean(containsSpoilers),
  });

  // Log activity
  await Activity.create({
    user: req.user._id,
    type: 'reviewed',
    imdbID,
    mediaType: titleDoc?.type || 'movie',
    title: titleDoc?.title || '',
  });

  const populatedReview = await Review.findById(review._id).populate('user', 'name username avatarUrl role plan');

  res.status(201).json(new ApiResponse(201, { review: populatedReview }, 'Review published successfully!'));
});

// PUT /reviews/:id (Update own review)
const updateReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rating, title, body, containsSpoilers } = req.body;

  const review = await Review.findById(id);
  if (!review) throw new ApiError(404, 'Review not found.');

  if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'You are not authorized to edit this review.');
  }

  if (rating) review.rating = parseInt(rating, 10);
  if (title) review.title = title;
  if (body) review.body = body;
  if (typeof containsSpoilers === 'boolean') review.containsSpoilers = containsSpoilers;

  await review.save();
  const updated = await Review.findById(id).populate('user', 'name username avatarUrl role plan');

  res.status(200).json(new ApiResponse(200, { review: updated }, 'Review updated successfully.'));
});

// DELETE /reviews/:id
const deleteReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const review = await Review.findById(id);
  if (!review) throw new ApiError(404, 'Review not found.');

  if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'You are not authorized to delete this review.');
  }

  await Review.findByIdAndDelete(id);
  await Reply.deleteMany({ review: id });

  res.status(200).json(new ApiResponse(200, null, 'Review deleted successfully.'));
});

// POST /reviews/:id/helpful (Toggle helpful vote)
const toggleHelpful = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const review = await Review.findById(id);
  if (!review) throw new ApiError(404, 'Review not found.');

  const userIdStr = req.user._id.toString();
  const existsIndex = review.helpfulVotes.findIndex((v) => v.toString() === userIdStr);

  if (existsIndex > -1) {
    review.helpfulVotes.splice(existsIndex, 1);
  } else {
    review.helpfulVotes.push(req.user._id);
  }

  await review.save();

  res.status(200).json(
    new ApiResponse(
      200,
      { helpfulVotesCount: review.helpfulVotes.length, isHelpful: existsIndex === -1 },
      existsIndex > -1 ? 'Helpful vote removed' : 'Marked as helpful'
    )
  );
});

// GET /reviews/:id/replies
const getReplies = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const replies = await Reply.find({ review: id })
    .populate('user', 'name username avatarUrl role plan')
    .sort({ createdAt: 1 })
    .lean();

  res.status(200).json(new ApiResponse(200, { items: replies }, 'Replies loaded'));
});

// POST /reviews/:id/replies
const addReply = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { body } = req.body;

  if (!body || body.trim().length < 2) {
    throw new ApiError(400, 'Reply content must be at least 2 characters long.');
  }

  const review = await Review.findById(id);
  if (!review) throw new ApiError(404, 'Review not found.');

  const reply = await Reply.create({
    review: id,
    user: req.user._id,
    body: body.trim(),
  });

  review.replyCount += 1;
  await review.save();

  const populated = await Reply.findById(reply._id).populate('user', 'name username avatarUrl role plan');

  res.status(201).json(new ApiResponse(201, { reply: populated }, 'Reply posted!'));
});

// POST /reviews/:id/report
const reportReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  if (!reason || reason.trim().length === 0) {
    throw new ApiError(400, 'Report reason is required.');
  }

  const review = await Review.findById(id);
  if (!review) throw new ApiError(404, 'Review not found.');

  await Report.create({
    reporter: req.user._id,
    review: id,
    reason: reason.trim(),
  });

  res.status(200).json(new ApiResponse(200, null, 'Review reported to moderators. Thank you.'));
});

module.exports = {
  getReviews,
  getTitleReviews,
  createReview,
  updateReview,
  deleteReview,
  toggleHelpful,
  getReplies,
  addReply,
  reportReview,
};
