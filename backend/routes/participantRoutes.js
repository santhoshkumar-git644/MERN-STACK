const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, changePassword, getOrganizers, requestPasswordReset, getDashboardData } = require('../controllers/participantController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { cacheMiddleware } = require('../middleware/cache');

router.get('/profile', protect, authorizeRoles('participant'), getProfile);
router.put('/profile', protect, authorizeRoles('participant'), updateProfile);
router.put('/change-password', protect, authorizeRoles('participant'), changePassword);
router.get('/organizers', protect, cacheMiddleware('clubs:list', 300), getOrganizers);
router.get('/dashboard', protect, authorizeRoles('participant'), getDashboardData);
router.post('/request-password-reset', protect, authorizeRoles('organizer'), requestPasswordReset);

module.exports = router;
