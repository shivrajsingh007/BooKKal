const Review = require('../models/Review');
const User = require('../models/User');
const Exchange = require('../models/Exchange');
const Notification = require('../models/Notification');

// @desc    Create review
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res, next) => {
  try {
    const { exchangeId, rating, comment } = req.body;

    const exchange = await Exchange.findById(exchangeId);
    if (!exchange) return res.status(404).json({ success: false, message: 'Exchange not found' });
    if (exchange.status !== 'accepted') {
      return res.status(400).json({ success: false, message: 'Can only review after exchange is accepted' });
    }

    // Determine who is being reviewed
    const isRequester = exchange.requester.toString() === req.user._id.toString();
    const isOwner = exchange.owner.toString() === req.user._id.toString();

    if (!isRequester && !isOwner) {
      return res.status(403).json({ success: false, message: 'Not part of this exchange' });
    }

    const reviewedUserId = isRequester ? exchange.owner : exchange.requester;

    // Check if already reviewed
    const existing = await Review.findOne({ reviewer: req.user._id, exchange: exchangeId });
    if (existing) return res.status(400).json({ success: false, message: 'You already reviewed this exchange' });

    const review = await Review.create({
      reviewer: req.user._id,
      reviewedUser: reviewedUserId,
      exchange: exchangeId,
      rating: Number(rating),
      comment,
    });

    // Update user average rating
    const reviews = await Review.find({ reviewedUser: reviewedUserId });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await User.findByIdAndUpdate(reviewedUserId, {
      'rating.average': Math.round(avgRating * 10) / 10,
      'rating.count': reviews.length,
    });

    // Notify reviewed user
    await Notification.create({
      user: reviewedUserId,
      type: 'new_review',
      message: `${req.user.name} left you a ${rating}-star review`,
      link: `/profile/${reviewedUserId}`,
      relatedId: review._id,
    });

    await review.populate('reviewer', 'name avatar');

    res.status(201).json({ success: true, review });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews for a user
// @route   GET /api/reviews/user/:userId
// @access  Public
const getUserReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ reviewedUser: req.params.userId })
      .populate('reviewer', 'name avatar')
      .sort('-createdAt');

    res.json({ success: true, reviews });
  } catch (error) {
    next(error);
  }
};

module.exports = { createReview, getUserReviews };
