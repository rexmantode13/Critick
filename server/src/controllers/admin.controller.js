const User = require('../models/User.model');
const Review = require('../models/Review.model');
const Report = require('../models/Report.model');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');

// GET /admin/users
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-passwordHash').sort({ createdAt: -1 }).lean();
  res.status(200).json(new ApiResponse(200, { items: users }, 'Users list loaded.'));
});

// PATCH /admin/users/:id/role
const updateUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!['user', 'critic', 'admin'].includes(role)) {
    throw new ApiError(400, "Role must be 'user', 'critic', or 'admin'.");
  }

  const user = await User.findById(id);
  if (!user) throw new ApiError(404, 'User not found.');

  user.role = role;
  await user.save();

  res.status(200).json(new ApiResponse(200, { user: { _id: user._id, role: user.role } }, `Role updated to ${role}`));
});

// GET /admin/reports
const getReports = asyncHandler(async (req, res) => {
  const reports = await Report.find()
    .populate('reporter', 'name username email')
    .populate({
      path: 'review',
      populate: { path: 'user', select: 'name username' },
    })
    .sort({ createdAt: -1 })
    .lean();

  res.status(200).json(new ApiResponse(200, { items: reports }, 'Moderation reports loaded.'));
});

// DELETE /admin/reviews/:id
const adminDeleteReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const review = await Review.findByIdAndDelete(id);
  if (!review) throw new ApiError(404, 'Review not found.');

  // Resolve associated reports
  await Report.updateMany({ review: id }, { status: 'resolved' });

  res.status(200).json(new ApiResponse(200, null, 'Review deleted by admin moderator.'));
});

module.exports = {
  getUsers,
  updateUserRole,
  getReports,
  adminDeleteReview,
};
