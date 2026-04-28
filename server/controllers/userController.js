const User = require('../models/User');
const Book = require('../models/Book');
const Review = require('../models/Review');

// @desc    Get user profile by ID
// @route   GET /api/users/:id
// @access  Public
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const books = await Book.find({ owner: user._id, isAvailable: true }).sort('-createdAt');
    const reviews = await Review.find({ reviewedUser: user._id })
      .populate('reviewer', 'name avatar')
      .sort('-createdAt')
      .limit(10);

    res.json({ success: true, user, books, reviews });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, college, course, year, bio, location } = req.body;

    const updateData = { name, college, course, year, bio, location };
    if (req.file) {
      updateData.avatar = `/uploads/${req.file.filename}`;
    }

    const user = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true,
    }).select('-password');

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Search users
// @route   GET /api/users/search?q=name
// @access  Private
const searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query;
    const users = await User.find({
      name: { $regex: q, $options: 'i' },
      _id: { $ne: req.user._id },
    })
      .select('name email avatar college')
      .limit(10);

    res.json({ success: true, users });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUserProfile, updateProfile, searchUsers };
