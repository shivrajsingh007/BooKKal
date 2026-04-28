const Exchange = require('../models/Exchange');
const Book = require('../models/Book');
const Notification = require('../models/Notification');

// @desc    Create exchange request
// @route   POST /api/exchange
// @access  Private
const createExchange = async (req, res, next) => {
  try {
    const { requestedBookId, offeredBookId, message } = req.body;

    const requestedBook = await Book.findById(requestedBookId);
    if (!requestedBook) return res.status(404).json({ success: false, message: 'Requested book not found' });
    if (!requestedBook.isAvailable) return res.status(400).json({ success: false, message: 'Book is no longer available' });
    if (requestedBook.listingType !== 'exchange') return res.status(400).json({ success: false, message: 'This book is not available for exchange' });

    const offeredBook = await Book.findById(offeredBookId);
    if (!offeredBook) return res.status(404).json({ success: false, message: 'Offered book not found' });
    if (offeredBook.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You can only offer your own books' });
    }

    // Check for existing pending request
    const existing = await Exchange.findOne({
      requester: req.user._id,
      requestedBook: requestedBookId,
      status: 'pending',
    });
    if (existing) return res.status(400).json({ success: false, message: 'You already have a pending request for this book' });

    const exchange = await Exchange.create({
      requester: req.user._id,
      owner: requestedBook.owner,
      requestedBook: requestedBookId,
      offeredBook: offeredBookId,
      message,
    });

    // Notify owner
    await Notification.create({
      user: requestedBook.owner,
      type: 'exchange_request',
      message: `${req.user.name} wants to exchange for your book "${requestedBook.title}"`,
      link: `/exchange/${exchange._id}`,
      relatedId: exchange._id,
    });

    await exchange.populate([
      { path: 'requester', select: 'name avatar' },
      { path: 'owner', select: 'name avatar' },
      { path: 'requestedBook', select: 'title image' },
      { path: 'offeredBook', select: 'title image' },
    ]);

    res.status(201).json({ success: true, exchange });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my exchanges (as requester or owner)
// @route   GET /api/exchange
// @access  Private
const getMyExchanges = async (req, res, next) => {
  try {
    const { role } = req.query; // 'sent' | 'received'
    let query = {};

    if (role === 'sent') query = { requester: req.user._id };
    else if (role === 'received') query = { owner: req.user._id };
    else query = { $or: [{ requester: req.user._id }, { owner: req.user._id }] };

    const exchanges = await Exchange.find(query)
      .populate('requester', 'name avatar')
      .populate('owner', 'name avatar')
      .populate('requestedBook', 'title image condition')
      .populate('offeredBook', 'title image condition')
      .sort('-createdAt');

    res.json({ success: true, exchanges });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single exchange
// @route   GET /api/exchange/:id
// @access  Private
const getExchange = async (req, res, next) => {
  try {
    const exchange = await Exchange.findById(req.params.id)
      .populate('requester', 'name avatar email college')
      .populate('owner', 'name avatar email college')
      .populate('requestedBook')
      .populate('offeredBook');

    if (!exchange) return res.status(404).json({ success: false, message: 'Exchange not found' });

    const isParty = [exchange.requester._id.toString(), exchange.owner._id.toString()].includes(req.user._id.toString());
    if (!isParty) return res.status(403).json({ success: false, message: 'Not authorized' });

    res.json({ success: true, exchange });
  } catch (error) {
    next(error);
  }
};

// @desc    Update exchange status (accept/reject)
// @route   PUT /api/exchange/:id/status
// @access  Private
const updateExchangeStatus = async (req, res, next) => {
  try {
    const { status, ownerNote } = req.body;
    const exchange = await Exchange.findById(req.params.id);

    if (!exchange) return res.status(404).json({ success: false, message: 'Exchange not found' });
    if (exchange.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the book owner can update status' });
    }
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    exchange.status = status;
    if (ownerNote) exchange.ownerNote = ownerNote;

    if (status === 'accepted') {
      // Mark both books as unavailable
      await Book.findByIdAndUpdate(exchange.requestedBook, { isAvailable: false });
      await Book.findByIdAndUpdate(exchange.offeredBook, { isAvailable: false });
    }

    await exchange.save();

    // Notify requester
    const notifType = status === 'accepted' ? 'exchange_accepted' : 'exchange_rejected';
    const notifMsg = status === 'accepted'
      ? `Your exchange request has been accepted!`
      : `Your exchange request was declined.`;

    await Notification.create({
      user: exchange.requester,
      type: notifType,
      message: notifMsg,
      link: `/exchange/${exchange._id}`,
      relatedId: exchange._id,
    });

    res.json({ success: true, exchange });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel exchange (by requester)
// @route   PUT /api/exchange/:id/cancel
// @access  Private
const cancelExchange = async (req, res, next) => {
  try {
    const exchange = await Exchange.findById(req.params.id);
    if (!exchange) return res.status(404).json({ success: false, message: 'Exchange not found' });
    if (exchange.requester.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the requester can cancel' });
    }
    if (exchange.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Can only cancel pending requests' });
    }

    exchange.status = 'cancelled';
    await exchange.save();

    res.json({ success: true, exchange });
  } catch (error) {
    next(error);
  }
};

module.exports = { createExchange, getMyExchanges, getExchange, updateExchangeStatus, cancelExchange };
