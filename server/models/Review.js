const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema(
  {
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reviewedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    exchange: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exchange',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      maxlength: [300, 'Comment cannot exceed 300 characters'],
      default: '',
    },
  },
  { timestamps: true }
);

// One review per exchange per reviewer
ReviewSchema.index({ reviewer: 1, exchange: 1 }, { unique: true });

module.exports = mongoose.model('Review', ReviewSchema);
