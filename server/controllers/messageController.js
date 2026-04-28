const Message = require('../models/Message');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res, next) => {
  try {
    const { receiverId, content } = req.body;

    if (receiverId === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot message yourself' });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) return res.status(404).json({ success: false, message: 'User not found' });

    const conversationId = Message.getConversationId(req.user._id, receiverId);

    const message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      content,
      conversationId,
    });

    await message.populate('sender', 'name avatar');
    await message.populate('receiver', 'name avatar');

    // Notify receiver
    await Notification.create({
      user: receiverId,
      type: 'new_message',
      message: `New message from ${req.user.name}`,
      link: `/chat/${req.user._id}`,
      relatedId: req.user._id,
    });

    res.status(201).json({ success: true, message });
  } catch (error) {
    next(error);
  }
};

// @desc    Get conversation between two users
// @route   GET /api/messages/:userId
// @access  Private
const getConversation = async (req, res, next) => {
  try {
    const conversationId = Message.getConversationId(req.user._id, req.params.userId);

    const messages = await Message.find({ conversationId })
      .populate('sender', 'name avatar')
      .populate('receiver', 'name avatar')
      .sort('createdAt');

    // Mark messages as read
    await Message.updateMany(
      { conversationId, receiver: req.user._id, isRead: false },
      { isRead: true }
    );

    const otherUser = await User.findById(req.params.userId).select('name avatar college');

    res.json({ success: true, messages, otherUser });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all conversations (inbox)
// @route   GET /api/messages
// @access  Private
const getConversations = async (req, res, next) => {
  try {
    // Get all unique conversations for the user
    const messages = await Message.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }],
    })
      .populate('sender', 'name avatar')
      .populate('receiver', 'name avatar')
      .sort('-createdAt');

    // Group by conversationId and get the latest message
    const conversationMap = new Map();
    for (const msg of messages) {
      if (!conversationMap.has(msg.conversationId)) {
        const otherUser = msg.sender._id.toString() === req.user._id.toString()
          ? msg.receiver
          : msg.sender;

        const unreadCount = await Message.countDocuments({
          conversationId: msg.conversationId,
          receiver: req.user._id,
          isRead: false,
        });

        conversationMap.set(msg.conversationId, {
          conversationId: msg.conversationId,
          otherUser,
          lastMessage: msg.content,
          lastMessageTime: msg.createdAt,
          unreadCount,
        });
      }
    }

    const conversations = Array.from(conversationMap.values());
    res.json({ success: true, conversations });
  } catch (error) {
    next(error);
  }
};

module.exports = { sendMessage, getConversation, getConversations };
