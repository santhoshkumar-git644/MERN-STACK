const logger = require('../config/logger');
const User = require('../models/User');
const PasswordResetRequest = require('../models/PasswordResetRequest');
const Registration = require('../models/Registration');
const Ticket = require('../models/Ticket');
const Event = require('../models/Event');

// @desc    Get participant profile
// @route   GET /api/participants/profile
// @access  Private (participant)
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('followedClubs', 'name category');
    res.json(user);
  } catch (error) {
    next(error);
  }
};

// @desc    Update participant profile
// @route   PUT /api/participants/profile
// @access  Private (participant)
const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, contactNumber, collegeOrOrg, interests, followedClubs } = req.body;
    const user = await User.findById(req.user._id);

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.contactNumber = contactNumber || user.contactNumber;
    user.collegeOrOrg = collegeOrOrg || user.collegeOrOrg;
    if (interests !== undefined) user.interests = interests;
    if (followedClubs !== undefined) user.followedClubs = followedClubs;

    await user.save();
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/participants/change-password
// @access  Private (participant)
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });

    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all organizers (for following)
// @route   GET /api/participants/organizers
// @access  Private (participant)
const getOrganizers = async (req, res, next) => {
  try {
    const organizers = await User.find({ role: 'organizer', isActive: true })
      .select('name email category description clubLogoUrl')
      .sort({ name: 1 });
    res.json(organizers);
  } catch (error) {
    next(error);
  }
};

// @desc    Organizer requests password reset
// @route   POST /api/participants/request-password-reset (organizer route)
// @access  Private (organizer)
const requestPasswordReset = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const existing = await PasswordResetRequest.findOne({ organizer: req.user._id, status: 'pending' });
    if (existing) {
      return res.status(400).json({ message: 'You already have a pending password reset request' });
    }
    const resetReq = await PasswordResetRequest.create({ organizer: req.user._id, reason });
    res.status(201).json({ message: 'Password reset request submitted to Admin', request: resetReq });
  } catch (error) {
    next(error);
  }
};

// @desc    Get participant dashboard stats
// @route   GET /api/participants/dashboard
// @access  Private (participant)
const getDashboardData = async (req, res, next) => {
  try {
    const registrations = await Registration.find({ participant: req.user._id }).populate('event');
    const upcomingEvents = registrations.filter(r => r.event && new Date(r.event.eventStartDate) >= new Date()).length;
    const attendedEvents = registrations.filter(r => r.attendanceMarked).length;
    
    // Attach tickets to recent registrations
    const recent = registrations.slice(0, 5);
    const recentRegistrations = await Promise.all(recent.map(async (reg) => {
      const ticket = await Ticket.findOne({ registration: reg._id });
      return { ...reg.toObject(), ticket };
    }));

    res.json({
      stats: {
        totalRegistrations: registrations.length,
        upcomingEvents,
        attendedEvents
      },
      recentRegistrations
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProfile, updateProfile, changePassword, getOrganizers, requestPasswordReset, getDashboardData };
