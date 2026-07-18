const logger = require('../config/logger');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { addEmailJob } = require('../config/queue');

// Generate JWT token
const generateToken = (id, tokenVersion) => {
  return jwt.sign({ id, tokenVersion: tokenVersion || 0 }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// @desc    Register a participant
// @route   POST /api/auth/register
// @access  Public
const registerParticipant = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, participantType, contactNumber, collegeOrOrg } = req.body;

    // Validate IIIT email
    if (participantType === 'iiit') {
      if (!email.endsWith('@students.iiit.ac.in') && !email.endsWith('@iiit.ac.in') && !email.endsWith('@research.iiit.ac.in')) {
        return res.status(400).json({ message: 'IIIT participants must use an IIIT-issued email address' });
      }
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: 'participant',
      participantType,
      contactNumber,
      collegeOrOrg,
      tokenVersion: 0
    });

    // Queue Welcome Email (non-blocking)
    await addEmailJob('welcome-email', {
      type: 'welcome',
      data: { email: user.email, name: user.firstName || user.name }
    });

    res.status(201).json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      participantType: user.participantType,
      onboardingComplete: user.onboardingComplete,
      token: generateToken(user._id, user.tokenVersion)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Your account has been disabled. Please contact admin.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      name: user.name,
      email: user.email,
      role: user.role,
      participantType: user.participantType,
      onboardingComplete: user.onboardingComplete,
      interests: user.interests,
      followedClubs: user.followedClubs,
      token: generateToken(user._id, user.tokenVersion)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  const user = await User.findById(req.user._id).select('-password').populate('followedClubs', 'name category');
  res.json(user);
};

// @desc    Complete onboarding (interests + followed clubs)
// @route   POST /api/auth/onboarding
// @access  Private (participant)
const completeOnboarding = async (req, res, next) => {
  try {
    const { interests, followedClubs } = req.body;

    const user = await User.findById(req.user._id);
    user.interests = interests || [];
    user.followedClubs = followedClubs || [];
    user.onboardingComplete = true;
    await user.save();

    res.json({ message: 'Onboarding complete', interests: user.interests, followedClubs: user.followedClubs });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload profile picture
// @route   POST /api/auth/upload-profile
// @access  Private
const uploadProfilePicture = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    // multer-storage-cloudinary places the URL in req.file.path
    const fileUrl = req.file.path;
    const user = await User.findById(req.user._id);

    if (user.role === 'organizer' || user.role === 'admin') {
      user.clubLogoUrl = fileUrl;
    } else {
      user.profilePictureUrl = fileUrl;
    }

    await user.save();
    res.json({ message: 'Profile picture uploaded successfully', fileUrl });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout from all devices (revoke all tokens)
// @route   POST /api/auth/logout-all
// @access  Private
const logoutFromAllDevices = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save();
    res.json({ message: 'Logged out from all devices successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { 
  registerParticipant, 
  loginUser, 
  getMe, 
  completeOnboarding, 
  uploadProfilePicture,
  logoutFromAllDevices
};
