const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Book title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    author: {
      type: String,
      required: [true, 'Author name is required'],
      trim: true,
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    condition: {
      type: String,
      required: [true, 'Book condition is required'],
      enum: ['Like New', 'Good', 'Fair', 'Poor'],
    },
    listingType: {
      type: String,
      required: [true, 'Listing type is required'],
      enum: ['free', 'paid', 'exchange'],
    },
    price: {
      type: Number,
      default: 0,
      min: [0, 'Price cannot be negative'],
    },
    image: {
      type: String,
      default: '',
    },
    subject: {
      type: String,
      trim: true,
      default: '',
    },
    genre: {
      type: String,
      trim: true,
      default: '',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    location: {
      city: { type: String, default: '' },
      state: { type: String, default: '' },
    },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Text index for search
BookSchema.index({ title: 'text', author: 'text', subject: 'text' });

module.exports = mongoose.model('Book', BookSchema);
