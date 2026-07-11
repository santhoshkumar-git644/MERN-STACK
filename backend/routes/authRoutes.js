const express = require('express');
const router = express.Router();
const { 
  registerParticipant, 
  loginUser, 
  getMe, 
  completeOnboarding, 
  uploadProfilePicture,
  logoutFromAllDevices
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

router.post('/register', registerParticipant);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.post('/onboarding', protect, completeOnboarding);
router.post('/upload-profile', protect, upload.single('profilePicture'), uploadProfilePicture);
router.post('/logout-all', protect, logoutFromAllDevices);

module.exports = router;
