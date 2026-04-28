const Book = require('../models/Book');

// @desc    Get all books with search & filter
// @route   GET /api/books
// @access  Public
const getBooks = async (req, res, next) => {
  try {
    const { search, listingType, minPrice, maxPrice, condition, city, page = 1, limit = 12 } = req.query;

    const query = { isAvailable: true };

    // Text search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
      ];
    }

    if (listingType) query.listingType = listingType;
    if (condition) query.condition = condition;

    // Price range (only for paid books)
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Location filter
    if (city) query['location.city'] = { $regex: city, $options: 'i' };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Book.countDocuments(query);
    const books = await Book.find(query)
      .populate('owner', 'name avatar college rating')
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      books,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single book
// @route   GET /api/books/:id
// @access  Public
const getBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id).populate('owner', 'name avatar college rating location');
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });

    // Increment views
    book.views += 1;
    await book.save();

    res.json({ success: true, book });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a book
// @route   POST /api/books
// @access  Private
const createBook = async (req, res, next) => {
  try {
    const { title, author, description, condition, listingType, price, subject, genre } = req.body;

    const bookData = {
      title, author, description, condition, listingType,
      price: listingType === 'paid' ? Number(price) : 0,
      subject, genre,
      owner: req.user._id,
      location: req.user.location,
    };

    if (req.file) {
      bookData.image = `/uploads/${req.file.filename}`;
    }

    const book = await Book.create(bookData);
    await book.populate('owner', 'name avatar college rating');

    res.status(201).json({ success: true, book });
  } catch (error) {
    next(error);
  }
};

// @desc    Update book
// @route   PUT /api/books/:id
// @access  Private
const updateBook = async (req, res, next) => {
  try {
    let book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });

    if (book.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this book' });
    }

    const updateData = { ...req.body };
    if (req.file) updateData.image = `/uploads/${req.file.filename}`;
    if (updateData.listingType !== 'paid') updateData.price = 0;

    book = await Book.findByIdAndUpdate(req.params.id, updateData, {
      new: true, runValidators: true,
    }).populate('owner', 'name avatar college rating');

    res.json({ success: true, book });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete book
// @route   DELETE /api/books/:id
// @access  Private
const deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });

    if (book.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this book' });
    }

    await book.deleteOne();
    res.json({ success: true, message: 'Book deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my books
// @route   GET /api/books/my-books
// @access  Private
const getMyBooks = async (req, res, next) => {
  try {
    const books = await Book.find({ owner: req.user._id }).sort('-createdAt');
    res.json({ success: true, books });
  } catch (error) {
    next(error);
  }
};

module.exports = { getBooks, getBook, createBook, updateBook, deleteBook, getMyBooks };
