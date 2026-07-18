const logger = require('../config/logger');
const ForumMessage = require('../models/ForumMessage');
const Registration = require('../models/Registration');

// @desc    Get forum messages for an event
// @route   GET /api/forum/:eventId
// @access  Private
const getMessages = async (req, res, next) => {
  try {
    const messages = await ForumMessage.find({
      event: req.params.eventId,
      isDeleted: false,
      parentMessage: null
    })
      .populate('author', 'firstName lastName name role')
      .sort({ isPinned: -1, createdAt: 1 })
      .limit(100);

    // Attach replies
    const withReplies = await Promise.all(messages.map(async (msg) => {
      const replies = await ForumMessage.find({ parentMessage: msg._id, isDeleted: false })
        .populate('author', 'firstName lastName name role')
        .sort({ createdAt: 1 });
      return { ...msg.toObject(), replies };
    }));

    res.json(withReplies);
  } catch (error) {
    next(error);
  }
};

// @desc    Post a message
// @route   POST /api/forum/:eventId
// @access  Private (registered participant or organizer)
const postMessage = async (req, res, next) => {
  try {
    const { content, parentMessage } = req.body;

    // Verify user is registered or is the organizer
    if (req.user.role === 'participant') {
      const reg = await Registration.findOne({ event: req.params.eventId, participant: req.user._id });
      if (!reg) return res.status(403).json({ message: 'You must be registered for this event to post' });
    }

    const isAnnouncement = req.user.role === 'organizer';

    const message = await ForumMessage.create({
      event: req.params.eventId,
      author: req.user._id,
      content,
      parentMessage: parentMessage || null,
      isAnnouncement
    });

    const populated = await message.populate('author', 'firstName lastName name role');

    // Emit via socket.io (handled in server.js)
    req.io.to(req.params.eventId).emit('new-message', populated);

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a message (organizer or author)
// @route   DELETE /api/forum/message/:id
// @access  Private
const deleteMessage = async (req, res, next) => {
  try {
    const message = await ForumMessage.findById(req.params.id);
    if (!message) return res.status(404).json({ message: 'Message not found' });

    const isAuthor = message.author.toString() === req.user._id.toString();
    const isOrganizer = req.user.role === 'organizer' || req.user.role === 'admin';

    if (!isAuthor && !isOrganizer) return res.status(403).json({ message: 'Not authorized' });

    message.isDeleted = true;
    await message.save();
    req.io.to(message.event.toString()).emit('message-deleted', message._id);
    res.json({ message: 'Message deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Pin/unpin a message (organizer only)
// @route   PUT /api/forum/message/:id/pin
// @access  Private (organizer)
const togglePin = async (req, res, next) => {
  try {
    const message = await ForumMessage.findById(req.params.id);
    if (!message) return res.status(404).json({ message: 'Message not found' });

    message.isPinned = !message.isPinned;
    await message.save();
    res.json({ message: `Message ${message.isPinned ? 'pinned' : 'unpinned'}`, isPinned: message.isPinned });
  } catch (error) {
    next(error);
  }
};

// @desc    React to a message
// @route   POST /api/forum/message/:id/react
// @access  Private
const reactToMessage = async (req, res, next) => {
  try {
    const { emoji } = req.body;
    const message = await ForumMessage.findById(req.params.id);
    if (!message) return res.status(404).json({ message: 'Message not found' });

    // Toggle reaction
    const existingIdx = message.reactions.findIndex(r => r.user.toString() === req.user._id.toString() && r.emoji === emoji);
    if (existingIdx >= 0) {
      message.reactions.splice(existingIdx, 1);
    } else {
      message.reactions.push({ user: req.user._id, emoji });
    }
    await message.save();
    res.json(message.reactions);
  } catch (error) {
    next(error);
  }
};

module.exports = { getMessages, postMessage, deleteMessage, togglePin, reactToMessage };
