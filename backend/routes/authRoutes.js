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
const rateLimit = require('express-rate-limit');
const validate = require('../middleware/validate');
const { registerSchema, loginSchema } = require('../validators/authValidator');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: { message: 'Too many login/register attempts from this IP, please try again after 15 minutes.' }
});

router.post('/register', authLimiter, validate(registerSchema), registerParticipant);
router.post('/login', authLimiter, validate(loginSchema), loginUser);
router.get('/me', protect, getMe);
router.post('/onboarding', protect, completeOnboarding);
router.post('/upload-profile', protect, upload.single('profilePicture'), uploadProfilePicture);
router.post('/logout-all', protect, logoutFromAllDevices);

module.exports = router;
