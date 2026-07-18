const express = require('express');
const router = express.Router();
const {
  createEvent, getEvents, getTrendingEvents, getEventById,
  updateEvent, deleteEvent, getOrganizerEvents, getOrganizerDashboard
} = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const validate = require('../middleware/validate');
const { createEventSchema } = require('../validators/eventValidator');
const { cacheMiddleware } = require('../middleware/cache');

// Generate cache key for events based on query params
const eventsCacheKey = (req) => `events:${JSON.stringify(req.query)}`;

router.get('/', cacheMiddleware(eventsCacheKey, 60), getEvents);
router.get('/trending', cacheMiddleware('events:trending', 300), getTrendingEvents);
router.get('/organizer/my-events', protect, authorizeRoles('organizer'), getOrganizerEvents);
router.get('/organizer/dashboard', protect, authorizeRoles('organizer'), getOrganizerDashboard);
router.get('/:id', cacheMiddleware((req) => `event:${req.params.id}`, 120), getEventById);
router.post('/', protect, authorizeRoles('organizer'), validate(createEventSchema), createEvent);
router.put('/:id', protect, authorizeRoles('organizer'), updateEvent);
router.delete('/:id', protect, authorizeRoles('organizer', 'admin'), deleteEvent);

module.exports = router;
