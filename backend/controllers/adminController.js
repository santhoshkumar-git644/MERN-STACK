const logger = require('../config/logger');
const User = require('../models/User');
const { generatePassword } = require('../utils/generatePassword');
const { sendOrganizerCredentials, sendPasswordResetEmail } = require('../utils/emailService');
const PasswordResetRequest = require('../models/PasswordResetRequest');

// @desc    Create organizer account (admin only)
// @route   POST /api/admin/organizers
// @access  Private (admin)
const createOrganizer = async (req, res, next) => {
  try {
    const { name, category, description, contactEmail } = req.body;

    // Auto-generate email and password
    const loginEmail = `${name.toLowerCase().replace(/\s+/g, '.')}.org@felicity.com`;
    const password = generatePassword(12);

    const existingUser = await User.findOne({ email: loginEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'An organizer with this name already exists' });
    }

    const organizer = await User.create({
      name,
      email: loginEmail,
      password,
      role: 'organizer',
      category,
      description,
      contactEmail,
      isActive: true
    });

    // Send credentials to admin (who shares with organizer)
    try {
      await sendOrganizerCredentials({
        to: req.user.email,
        organizerName: name,
        loginEmail,
        password
      });
    } catch (e) {
      logger.error('Email error:', e.message);
    }

    res.status(201).json({
      message: 'Organizer created successfully. Credentials sent to your email.',
      organizer: {
        _id: organizer._id,
        name: organizer.name,
        email: organizer.email,
        category: organizer.category
      },
      credentials: { loginEmail, password } // also return in response
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all organizers
// @route   GET /api/admin/organizers
// @access  Private (admin)
const getAllOrganizers = async (req, res, next) => {
  try {
    const organizers = await User.find({ role: 'organizer' }).select('-password').sort({ createdAt: -1 });
    res.json(organizers);
  } catch (error) {
    next(error);
  }
};

// @desc    Disable/enable organizer
// @route   PUT /api/admin/organizers/:id/toggle
// @access  Private (admin)
const toggleOrganizerStatus = async (req, res, next) => {
  try {
    const organizer = await User.findById(req.params.id);
    if (!organizer || organizer.role !== 'organizer') {
      return res.status(404).json({ message: 'Organizer not found' });
    }
    organizer.isActive = !organizer.isActive;
    await organizer.save();
    res.json({ message: `Organizer ${organizer.isActive ? 'enabled' : 'disabled'}`, isActive: organizer.isActive });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete organizer permanently
// @route   DELETE /api/admin/organizers/:id
// @access  Private (admin)
const deleteOrganizer = async (req, res, next) => {
  try {
    const organizer = await User.findById(req.params.id);
    if (!organizer || organizer.role !== 'organizer') {
      return res.status(404).json({ message: 'Organizer not found' });
    }
    await organizer.deleteOne();
    res.json({ message: 'Organizer deleted permanently' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all password reset requests
// @route   GET /api/admin/password-resets
// @access  Private (admin)
const getPasswordResetRequests = async (req, res, next) => {
  try {
    const requests = await PasswordResetRequest.find()
      .populate('organizer', 'name email category')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    next(error);
  }
};

// @desc    Approve or reject password reset request
// @route   PUT /api/admin/password-resets/:id
// @access  Private (admin)
const handlePasswordResetRequest = async (req, res, next) => {
  try {
    const { action, adminComment } = req.body; // action: 'approve' | 'reject'

    const resetReq = await PasswordResetRequest.findById(req.params.id).populate('organizer');
    if (!resetReq) return res.status(404).json({ message: 'Request not found' });

    if (action === 'approve') {
      const newPassword = generatePassword(10);
      const organizer = await User.findById(resetReq.organizer._id);
      organizer.password = newPassword;
      await organizer.save();

      resetReq.status = 'approved';
      resetReq.adminComment = adminComment || '';
      resetReq.resolvedAt = new Date();
      await resetReq.save();

      // Send new password to admin
      try {
        await sendPasswordResetEmail({
          to: req.user.email,
          organizerName: organizer.name,
          newPassword
        });
      } catch (e) {
        logger.error('Email error:', e.message);
      }

      res.json({ message: 'Password reset approved. New password sent to admin email.', newPassword });
    } else {
      resetReq.status = 'rejected';
      resetReq.adminComment = adminComment || '';
      resetReq.resolvedAt = new Date();
      await resetReq.save();
      res.json({ message: 'Password reset request rejected.' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private (admin)
const getAdminStats = async (req, res, next) => {
  try {
    const Event = require('../models/Event');
    const Registration = require('../models/Registration');
    
    const [totalOrganizers, totalParticipants, totalEvents, totalRegistrations, pendingResets] = await Promise.all([
      User.countDocuments({ role: 'organizer' }),
      User.countDocuments({ role: 'participant' }),
      Event.countDocuments({ isActive: true }),
      Registration.countDocuments(),
      PasswordResetRequest.countDocuments({ status: 'pending' })
    ]);

    res.json({ totalOrganizers, totalParticipants, totalEvents, totalRegistrations, pendingResets });
  } catch (error) {
    next(error);
  }
};

module.exports = { createOrganizer, getAllOrganizers, toggleOrganizerStatus, deleteOrganizer, getPasswordResetRequests, handlePasswordResetRequest, getAdminStats };
