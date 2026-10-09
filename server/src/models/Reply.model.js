const mongoose = require('mongoose');

const replySchema = new mongoose.Schema(
  {
    review: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    body: {
      type: String,
      required: [true, 'Reply content is required'],
      trim: true,
      minlength: 2,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Reply', replySchema);
