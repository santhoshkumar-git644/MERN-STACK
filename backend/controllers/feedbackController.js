const logger = require('../config/logger');
const Feedback = require('../models/Feedback');
const Registration = require('../models/Registration');

// @desc    Submit anonymous feedback
// @route   POST /api/feedback/:eventId
// @access  Private (participant - must have completed event)
const submitFeedback = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Verify participant attended the event
    const registration = await Registration.findOne({
      event: req.params.eventId,
      participant: req.user._id
    });

    if (!registration) {
      return res.status(403).json({ message: 'You must be registered for this event to submit feedback' });
    }

    // No link to participant — fully anonymous
    const feedback = await Feedback.create({
      event: req.params.eventId,
      rating,
      comment
    });

    res.status(201).json({ message: 'Feedback submitted anonymously. Thank you!', feedback });
  } catch (error) {
    next(error);
  }
};

// @desc    Get feedback for an event (organizer/admin)
// @route   GET /api/feedback/:eventId
// @access  Private (organizer/admin)
const getEventFeedback = async (req, res, next) => {
  try {
    const feedbacks = await Feedback.find({ event: req.params.eventId }).sort({ createdAt: -1 });

    const totalRatings = feedbacks.length;
    const averageRating = totalRatings > 0
      ? (feedbacks.reduce((acc, f) => acc + f.rating, 0) / totalRatings).toFixed(2)
      : 0;

    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    feedbacks.forEach(f => ratingDistribution[f.rating]++);

    res.json({
      totalRatings,
      averageRating: parseFloat(averageRating),
      ratingDistribution,
      feedbacks: feedbacks.map(f => ({ rating: f.rating, comment: f.comment, createdAt: f.createdAt }))
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { submitFeedback, getEventFeedback };
